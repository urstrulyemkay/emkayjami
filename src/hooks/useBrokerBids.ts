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

// Mock data for when database is empty
const MOCK_LIVE_BIDS: BrokerBidWithAuction[] = [
  {
    id: "mock-live-1", auction_id: "mock-auction-1", broker_id: "mock-broker",
    bid_amount: 48000, commission_amount: 2000, effective_score: 48300, placed_at: new Date().toISOString(),
    status: "winning", bid_type: "competitive",
    auction: {
      id: "mock-auction-1", auction_type: "quick", status: "live",
      start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
      current_highest_bid: 48000, current_highest_commission: 2000, winning_broker_id: "mock-broker",
      inspections: { id: "insp-1", vehicle_make: "Honda", vehicle_model: "Activa 6G", vehicle_year: 2023, odometer_reading: 12450, vehicle_color: "White", condition_score: 85 }
    }
  },
  {
    id: "mock-live-2", auction_id: "mock-auction-2", broker_id: "mock-broker",
    bid_amount: 52000, commission_amount: 1500, effective_score: 52225, placed_at: new Date().toISOString(),
    status: "outbid", bid_type: "initial",
    auction: {
      id: "mock-auction-2", auction_type: "flexible", status: "live",
      start_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 95 * 60 * 1000).toISOString(),
      current_highest_bid: 55000, current_highest_commission: 2500, winning_broker_id: null,
      inspections: { id: "insp-2", vehicle_make: "TVS", vehicle_model: "Apache RTR 160", vehicle_year: 2022, odometer_reading: 18200, vehicle_color: "Black", condition_score: 78 }
    }
  },
  {
    id: "mock-live-3", auction_id: "mock-auction-3", broker_id: "mock-broker",
    bid_amount: 125000, commission_amount: 5000, effective_score: 125750, placed_at: new Date().toISOString(),
    status: "winning", bid_type: "aggressive",
    auction: {
      id: "mock-auction-3", auction_type: "extended", status: "live",
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 125000, current_highest_commission: 5000, winning_broker_id: "mock-broker",
      inspections: { id: "insp-3", vehicle_make: "Royal Enfield", vehicle_model: "Classic 350", vehicle_year: 2021, odometer_reading: 24500, vehicle_color: "Gunmetal Grey", condition_score: 72 }
    }
  },
];

const MOCK_WON_BIDS: BrokerBidWithAuction[] = [
  {
    id: "mock-won-1", auction_id: "mock-auction-won-1", broker_id: "mock-broker",
    bid_amount: 45000, commission_amount: 1800, effective_score: 45270, placed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "won", bid_type: "competitive",
    auction: {
      id: "mock-auction-won-1", auction_type: "quick", status: "ended",
      start_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 45000, current_highest_commission: 1800, winning_broker_id: "mock-broker",
      inspections: { id: "insp-won-1", vehicle_make: "Bajaj", vehicle_model: "Pulsar NS200", vehicle_year: 2023, odometer_reading: 8500, vehicle_color: "Red", condition_score: 88 }
    }
  },
  {
    id: "mock-won-2", auction_id: "mock-auction-won-2", broker_id: "mock-broker",
    bid_amount: 38000, commission_amount: 1500, effective_score: 38225, placed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "won", bid_type: "initial",
    auction: {
      id: "mock-auction-won-2", auction_type: "flexible", status: "ended",
      start_time: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 38000, current_highest_commission: 1500, winning_broker_id: "mock-broker",
      inspections: { id: "insp-won-2", vehicle_make: "Yamaha", vehicle_model: "FZ-S V3", vehicle_year: 2022, odometer_reading: 15800, vehicle_color: "Blue", condition_score: 75 }
    }
  },
  {
    id: "mock-won-3", auction_id: "mock-auction-won-3", broker_id: "mock-broker",
    bid_amount: 28000, commission_amount: 1200, effective_score: 28180, placed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "won", bid_type: "competitive",
    auction: {
      id: "mock-auction-won-3", auction_type: "quick", status: "ended",
      start_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 28000, current_highest_commission: 1200, winning_broker_id: "mock-broker",
      inspections: { id: "insp-won-3", vehicle_make: "Hero", vehicle_model: "Splendor Plus", vehicle_year: 2021, odometer_reading: 32000, vehicle_color: "Black", condition_score: 68 }
    }
  },
  {
    id: "mock-won-4", auction_id: "mock-auction-won-4", broker_id: "mock-broker",
    bid_amount: 42000, commission_amount: 2000, effective_score: 42300, placed_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: "won", bid_type: "aggressive",
    auction: {
      id: "mock-auction-won-4", auction_type: "extended", status: "ended",
      start_time: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 42000, current_highest_commission: 2000, winning_broker_id: "mock-broker",
      inspections: { id: "insp-won-4", vehicle_make: "Suzuki", vehicle_model: "Access 125", vehicle_year: 2023, odometer_reading: 5200, vehicle_color: "Pearl White", condition_score: 90 }
    }
  },
];

const MOCK_LOST_BIDS: BrokerBidWithAuction[] = [
  {
    id: "mock-lost-1", auction_id: "mock-auction-lost-1", broker_id: "mock-broker",
    bid_amount: 40000, commission_amount: 1500, effective_score: 40225, placed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "lost", bid_type: "initial",
    auction: {
      id: "mock-auction-lost-1", auction_type: "quick", status: "ended",
      start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 44000, current_highest_commission: 2000, winning_broker_id: "other-broker",
      inspections: { id: "insp-lost-1", vehicle_make: "TVS", vehicle_model: "Jupiter", vehicle_year: 2022, odometer_reading: 18900, vehicle_color: "Grey", condition_score: 76 }
    }
  },
  {
    id: "mock-lost-2", auction_id: "mock-auction-lost-2", broker_id: "mock-broker",
    bid_amount: 55000, commission_amount: 2000, effective_score: 55300, placed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "lost", bid_type: "competitive",
    auction: {
      id: "mock-auction-lost-2", auction_type: "flexible", status: "ended",
      start_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 58000, current_highest_commission: 3000, winning_broker_id: "other-broker",
      inspections: { id: "insp-lost-2", vehicle_make: "Honda", vehicle_model: "Shine", vehicle_year: 2023, odometer_reading: 9800, vehicle_color: "Silver", condition_score: 82 }
    }
  },
  {
    id: "mock-lost-3", auction_id: "mock-auction-lost-3", broker_id: "mock-broker",
    bid_amount: 72000, commission_amount: 2500, effective_score: 72375, placed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "lost", bid_type: "aggressive",
    auction: {
      id: "mock-auction-lost-3", auction_type: "extended", status: "ended",
      start_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      current_highest_bid: 78000, current_highest_commission: 4000, winning_broker_id: "other-broker",
      inspections: { id: "insp-lost-3", vehicle_make: "Bajaj", vehicle_model: "Dominar 400", vehicle_year: 2021, odometer_reading: 22000, vehicle_color: "Black", condition_score: 70 }
    }
  },
];

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

      // Use mock data if database is empty
      const useMock = live.length === 0 && won.length === 0 && lost.length === 0;
      
      if (useMock) {
        setLiveBids(MOCK_LIVE_BIDS);
        setWonBids(MOCK_WON_BIDS);
        setLostBids(MOCK_LOST_BIDS);
        
        // Calculate mock stats
        const mockTotalBids = MOCK_LIVE_BIDS.length + MOCK_WON_BIDS.length + MOCK_LOST_BIDS.length;
        const mockTotalWins = MOCK_WON_BIDS.length;
        const mockWinRate = Math.round((mockTotalWins / mockTotalBids) * 100);
        const mockAvgBid = Math.round(
          [...MOCK_LIVE_BIDS, ...MOCK_WON_BIDS, ...MOCK_LOST_BIDS].reduce((sum, b) => sum + b.bid_amount, 0) / mockTotalBids
        );
        setStats({ totalBids: mockTotalBids, totalWins: mockTotalWins, winRate: mockWinRate, avgBidAmount: mockAvgBid });
      } else {
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
      }
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
