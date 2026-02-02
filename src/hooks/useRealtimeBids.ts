import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateEffectiveScore } from "@/data/brokerMockData";

export interface RealtimeBid {
  id: string;
  auction_id: string;
  broker_id: string;
  bid_amount: number;
  commission_amount: number;
  effective_score: number | null;
  placed_at: string;
  status: string;
  bid_type: string | null;
}

export interface AuctionState {
  currentHighestBid: number;
  currentHighestCommission: number;
  bidCount: number;
  bids: RealtimeBid[];
  myBid: RealtimeBid | null;
  isWinning: boolean;
}

export const useRealtimeBids = (auctionId: string, brokerId: string | undefined) => {
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentHighestBid: 0,
    currentHighestCommission: 0,
    bidCount: 0,
    bids: [],
    myBid: null,
    isWinning: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial bids
  const fetchBids = useCallback(async () => {
    if (!auctionId) return;

    try {
      // Fetch all bids for this auction
      const { data: bids, error: bidsError } = await supabase
        .from("broker_bids")
        .select("*")
        .eq("auction_id", auctionId)
        .eq("status", "active")
        .order("effective_score", { ascending: false });

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        return;
      }

      // Fetch auction state
      const { data: auction, error: auctionError } = await supabase
        .from("auctions")
        .select("current_highest_bid, current_highest_commission, bid_count")
        .eq("id", auctionId)
        .single();

      if (auctionError) {
        console.error("Error fetching auction:", auctionError);
      }

      const typedBids = (bids || []) as RealtimeBid[];
      const myBid = brokerId 
        ? typedBids.find(b => b.broker_id === brokerId) || null 
        : null;
      
      // Determine if user is winning (highest effective score)
      const highestBid = typedBids[0];
      const isWinning = myBid && highestBid ? myBid.id === highestBid.id : false;

      setAuctionState({
        currentHighestBid: auction?.current_highest_bid || 0,
        currentHighestCommission: auction?.current_highest_commission || 0,
        bidCount: auction?.bid_count || typedBids.length,
        bids: typedBids,
        myBid,
        isWinning,
      });
    } catch (err) {
      console.error("Error in fetchBids:", err);
    } finally {
      setLoading(false);
    }
  }, [auctionId, brokerId]);

  // Place a new bid
  const placeBid = useCallback(async (bidAmount: number, commission: number) => {
    if (!brokerId || !auctionId) {
      throw new Error("Broker ID and Auction ID are required");
    }

    const effectiveScore = calculateEffectiveScore(bidAmount, commission);

    const { data, error } = await supabase
      .from("broker_bids")
      .insert({
        auction_id: auctionId,
        broker_id: brokerId,
        bid_amount: bidAmount,
        commission_amount: commission,
        effective_score: effectiveScore,
        bid_type: auctionState.myBid ? "revision" : "initial",
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error placing bid:", error);
      throw error;
    }

    // If this is a revision, mark old bid as superseded
    if (auctionState.myBid) {
      await supabase
        .from("broker_bids")
        .update({ status: "superseded" })
        .eq("id", auctionState.myBid.id);
    }

    // Update auction highest bid if this is the new highest
    const { data: currentAuction } = await supabase
      .from("auctions")
      .select("current_highest_bid, current_highest_commission, bid_count")
      .eq("id", auctionId)
      .single();

    const currentHighestEffective = calculateEffectiveScore(
      currentAuction?.current_highest_bid || 0,
      currentAuction?.current_highest_commission || 0
    );

    if (effectiveScore > currentHighestEffective) {
      await supabase
        .from("auctions")
        .update({
          current_highest_bid: bidAmount,
          current_highest_commission: commission,
          bid_count: (currentAuction?.bid_count || 0) + 1,
        })
        .eq("id", auctionId);
    } else {
      await supabase
        .from("auctions")
        .update({
          bid_count: (currentAuction?.bid_count || 0) + 1,
        })
        .eq("id", auctionId);
    }

    return data;
  }, [auctionId, brokerId, auctionState.myBid]);

  // Set up realtime subscription
  useEffect(() => {
    if (!auctionId) return;

    fetchBids();

    // Subscribe to bid changes
    const bidsChannel = supabase
      .channel(`auction-bids-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_bids",
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          console.log("Bid change received:", payload);
          fetchBids(); // Refetch to get updated state
        }
      )
      .subscribe();

    // Subscribe to auction changes (for highest bid updates)
    const auctionChannel = supabase
      .channel(`auction-state-${auctionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          console.log("Auction update received:", payload);
          const newData = payload.new as {
            current_highest_bid: number;
            current_highest_commission: number;
            bid_count: number;
          };
          setAuctionState(prev => ({
            ...prev,
            currentHighestBid: newData.current_highest_bid || prev.currentHighestBid,
            currentHighestCommission: newData.current_highest_commission || prev.currentHighestCommission,
            bidCount: newData.bid_count || prev.bidCount,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(auctionChannel);
    };
  }, [auctionId, fetchBids]);

  return {
    ...auctionState,
    loading,
    placeBid,
    refetch: fetchBids,
  };
};
