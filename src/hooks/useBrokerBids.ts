import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrokerBidWithAuction {
  id: string;
  auction_id: string;
  broker_id: string;
  bid_amount: number;
  commission_amount: number;
  effective_score: number | null;
  placed_at: string;
  status: string;
  bid_type: string | null;
  // Joined auction data
  auction?: {
    id: string;
    auction_type: string;
    status: string;
    start_time: string;
    end_time: string;
    current_highest_bid: number | null;
    current_highest_commission: number | null;
    winning_broker_id: string | null;
    inspections: {
      id: string;
      vehicle_make: string;
      vehicle_model: string;
      vehicle_year: number | null;
      odometer_reading: number | null;
      vehicle_color: string | null;
      condition_score: number | null;
    } | null;
  } | null;
}

interface UseBrokerBidsReturn {
  liveBids: BrokerBidWithAuction[];
  wonBids: BrokerBidWithAuction[];
  lostBids: BrokerBidWithAuction[];
  loading: boolean;
  stats: {
    totalBids: number;
    totalWins: number;
    winRate: number;
    avgBidAmount: number;
  };
  refetch: () => Promise<void>;
}

export const useBrokerBids = (brokerId: string | undefined): UseBrokerBidsReturn => {
  const [liveBids, setLiveBids] = useState<BrokerBidWithAuction[]>([]);
  const [wonBids, setWonBids] = useState<BrokerBidWithAuction[]>([]);
  const [lostBids, setLostBids] = useState<BrokerBidWithAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBids: 0,
    totalWins: 0,
    winRate: 0,
    avgBidAmount: 0,
  });

  const fetchBids = useCallback(async () => {
    if (!brokerId) return;

    try {
      // Fetch all bids for this broker with auction details
      const { data: allBids, error } = await supabase
        .from("broker_bids")
        .select(`
          *,
          auction:auctions (
            id, auction_type, status, start_time, end_time,
            current_highest_bid, current_highest_commission, winning_broker_id,
            inspections (
              id, vehicle_make, vehicle_model, vehicle_year,
              odometer_reading, vehicle_color, condition_score
            )
          )
        `)
        .eq("broker_id", brokerId)
        .order("placed_at", { ascending: false });

      if (error) {
        console.error("Error fetching broker bids:", error);
        return;
      }

      const typedBids = (allBids || []) as BrokerBidWithAuction[];

      // Separate bids by auction status
      const live: BrokerBidWithAuction[] = [];
      const won: BrokerBidWithAuction[] = [];
      const lost: BrokerBidWithAuction[] = [];

      // Group by auction (only keep latest bid per auction)
      const latestBidsByAuction = new Map<string, BrokerBidWithAuction>();
      
      for (const bid of typedBids) {
        const existingBid = latestBidsByAuction.get(bid.auction_id);
        if (!existingBid || new Date(bid.placed_at) > new Date(existingBid.placed_at)) {
          latestBidsByAuction.set(bid.auction_id, bid);
        }
      }

      for (const bid of latestBidsByAuction.values()) {
        if (!bid.auction) continue;

        if (bid.auction.status === "live" || bid.auction.status === "scheduled") {
          // Check if this is the winning bid
          const isWinning = bid.effective_score !== null && 
            bid.bid_amount === bid.auction.current_highest_bid &&
            bid.commission_amount === bid.auction.current_highest_commission;
          
          live.push({
            ...bid,
            status: isWinning ? "winning" : "outbid",
          });
        } else if (bid.auction.status === "ended") {
          if (bid.auction.winning_broker_id === brokerId) {
            won.push({ ...bid, status: "won" });
          } else {
            lost.push({ ...bid, status: "lost" });
          }
        }
      }

      setLiveBids(live);
      setWonBids(won);
      setLostBids(lost);

      // Calculate stats
      const totalBids = latestBidsByAuction.size;
      const totalWins = won.length;
      const winRate = totalBids > 0 ? Math.round((totalWins / totalBids) * 100) : 0;
      const totalBidAmount = Array.from(latestBidsByAuction.values()).reduce(
        (sum, b) => sum + b.bid_amount, 0
      );
      const avgBidAmount = totalBids > 0 ? Math.round(totalBidAmount / totalBids) : 0;

      setStats({ totalBids, totalWins, winRate, avgBidAmount });
    } catch (err) {
      console.error("Error in fetchBids:", err);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!brokerId) return;

    fetchBids();

    // Subscribe to bid changes
    const bidsChannel = supabase
      .channel(`broker-all-bids-${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_bids",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    // Subscribe to auction status changes
    const auctionsChannel = supabase
      .channel(`broker-auctions-status-${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(auctionsChannel);
    };
  }, [brokerId, fetchBids]);

  return {
    liveBids,
    wonBids,
    lostBids,
    loading,
    stats,
    refetch: fetchBids,
  };
};
