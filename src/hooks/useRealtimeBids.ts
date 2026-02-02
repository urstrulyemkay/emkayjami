import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateEffectiveScore } from "@/data/brokerMockData";
import { toast } from "sonner";
import { playSoundIfEnabled } from "@/hooks/useSoundNotifications";

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
  lastBidTimestamp: string | null;
  wasOutbid: boolean;
}

// Import centralized mock bids generator
import { generateMockBids as generateCentralizedMockBids } from "@/data/mockAuctions";

// Generate mock bids based on auction ID for consistent demo data
const generateMockBids = (auctionId: string): RealtimeBid[] => {
  const centralizedBids = generateCentralizedMockBids(auctionId);
  return centralizedBids as RealtimeBid[];
};

// Trigger outbid notification - shows toast, plays sound, and sends push notification
const triggerOutbidNotification = async (brokerId: string, auctionId: string, newHighestBid: number) => {
  // Play outbid sound
  playSoundIfEnabled('outbid');
  
  // Show immediate toast notification
  toast.error("You've been outbid!", {
    description: `New highest bid: ₹${newHighestBid.toLocaleString()}`,
    action: {
      label: "View Auction",
      onClick: () => {
        window.location.href = `/broker/auction/${auctionId}`;
      },
    },
  });

  // Try to send push notification via edge function
  try {
    await supabase.functions.invoke("send-push-notification", {
      body: {
        broker_id: brokerId,
        title: "You've been outbid! 🔔",
        body: `Someone placed a higher bid of ₹${newHighestBid.toLocaleString()}. Act fast!`,
        data: {
          url: `/broker/auction/${auctionId}`,
          auction_id: auctionId,
        },
        tag: `outbid-${auctionId}`,
        requireInteraction: true,
      },
    });
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }
};

export const useRealtimeBids = (auctionId: string, brokerId: string | undefined) => {
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentHighestBid: 0,
    currentHighestCommission: 0,
    bidCount: 0,
    bids: [],
    myBid: null,
    isWinning: false,
    lastBidTimestamp: null,
    wasOutbid: false,
  });
  const [loading, setLoading] = useState(true);
  const previousWinningRef = useRef<boolean | null>(null);

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

      // Fetch auction state
      const { data: auction, error: auctionError } = await supabase
        .from("auctions")
        .select("current_highest_bid, current_highest_commission, bid_count")
        .eq("id", auctionId)
        .single();

      // Use mock bids if no database bids found (demo mode)
      let typedBids: RealtimeBid[] = [];
      if (bidsError || !bids || bids.length === 0) {
        typedBids = generateMockBids(auctionId);
      } else {
        typedBids = bids as RealtimeBid[];
      }

      const myBid = brokerId 
        ? typedBids.find(b => b.broker_id === brokerId) || null 
        : null;
      
      // Determine if user is winning (highest effective score)
      const highestBid = typedBids[0];
      const isWinning = myBid && highestBid ? myBid.id === highestBid.id : false;
      
      // Derive highest bid from actual bids data (source of truth)
      const actualHighestBid = highestBid?.bid_amount || 0;
      const actualHighestCommission = highestBid?.commission_amount || 0;
      
      // Check if user was outbid (had a bid, was winning, now not winning)
      const wasOutbid = previousWinningRef.current === true && !isWinning && myBid !== null;
      
      // Trigger outbid notification only for real bids
      if (wasOutbid && brokerId && bids && bids.length > 0) {
        triggerOutbidNotification(brokerId, auctionId, actualHighestBid);
      }
      
      previousWinningRef.current = isWinning;

      const latestBidTime = typedBids.length > 0 ? typedBids[0].placed_at : null;

      setAuctionState({
        currentHighestBid: actualHighestBid,
        currentHighestCommission: actualHighestCommission,
        bidCount: auction?.bid_count || typedBids.length,
        bids: typedBids,
        myBid,
        isWinning,
        lastBidTimestamp: latestBidTime,
        wasOutbid,
      });
    } catch (err) {
      console.error("Error in fetchBids:", err);
      // Fallback to mock bids on error
      const mockBids = generateMockBids(auctionId);
      const highestBid = mockBids[0];
      setAuctionState({
        currentHighestBid: highestBid?.bid_amount || 0,
        currentHighestCommission: highestBid?.commission_amount || 0,
        bidCount: mockBids.length,
        bids: mockBids,
        myBid: null,
        isWinning: false,
        lastBidTimestamp: highestBid?.placed_at || null,
        wasOutbid: false,
      });
    } finally {
      setLoading(false);
    }
  }, [auctionId, brokerId]);

  // Place a new bid
  const placeBid = useCallback(async (bidAmount: number, commission: number) => {
    if (!brokerId || !auctionId) {
      throw new Error("Broker ID and Auction ID are required");
    }

    // Note: effective_score is a generated column, don't include it in insert
    const { data, error } = await supabase
      .from("broker_bids")
      .insert({
        auction_id: auctionId,
        broker_id: brokerId,
        bid_amount: bidAmount,
        commission_amount: commission,
        // effective_score is auto-generated: (bid_amount * 0.85) + (commission_amount * 0.15)
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

    // Get current bid count
    const { data: currentAuction } = await supabase
      .from("auctions")
      .select("bid_count")
      .eq("id", auctionId)
      .single();

    // Query actual highest bid by effective_score after insert
    const { data: actualHighest } = await supabase
      .from("broker_bids")
      .select("bid_amount, commission_amount")
      .eq("auction_id", auctionId)
      .eq("status", "active")
      .order("effective_score", { ascending: false })
      .limit(1)
      .single();

    // Update auctions table with actual highest values
    await supabase
      .from("auctions")
      .update({
        current_highest_bid: actualHighest?.bid_amount || bidAmount,
        current_highest_commission: actualHighest?.commission_amount || commission,
        bid_count: (currentAuction?.bid_count || 0) + 1,
      })
      .eq("id", auctionId);

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

  // Clear the outbid flag after it's been handled
  const clearOutbid = useCallback(() => {
    setAuctionState(prev => ({ ...prev, wasOutbid: false }));
  }, []);

  return {
    ...auctionState,
    loading,
    placeBid,
    refetch: fetchBids,
    clearOutbid,
  };
};
