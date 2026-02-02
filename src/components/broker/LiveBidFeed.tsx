import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users, Bell } from "lucide-react";
import { RealtimeBid } from "@/hooks/useRealtimeBids";
import { formatDistanceToNow } from "date-fns";

interface LiveBidFeedProps {
  bids: RealtimeBid[];
  currentHighestBid: number;
  bidCount: number;
  myBrokerId?: string;
}

const LiveBidFeed = ({ bids, currentHighestBid, bidCount, myBrokerId }: LiveBidFeedProps) => {
  const [animatedBids, setAnimatedBids] = useState<string[]>([]);
  const [newBidFlash, setNewBidFlash] = useState(false);
  const previousBidCountRef = useRef(bidCount);
  const previousHighestBidRef = useRef(currentHighestBid);

  // Animate new bids and flash on new activity
  useEffect(() => {
    if (bids.length > 0) {
      const latestBid = bids[0];
      if (!animatedBids.includes(latestBid.id)) {
        setAnimatedBids(prev => [...prev, latestBid.id]);
        
        // Flash effect for new bid
        if (previousBidCountRef.current < bidCount) {
          setNewBidFlash(true);
          setTimeout(() => setNewBidFlash(false), 500);
        }
        
        // Remove animation after 2 seconds
        setTimeout(() => {
          setAnimatedBids(prev => prev.filter(id => id !== latestBid.id));
        }, 2000);
      }
    }
    previousBidCountRef.current = bidCount;
    previousHighestBidRef.current = currentHighestBid;
  }, [bids, bidCount, currentHighestBid]);

  const formatBidTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  const getAnonymizedName = (index: number) => {
    return `Broker ${String.fromCharCode(65 + index)}`; // Broker A, B, C, etc.
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${newBidFlash ? "bg-amber-500" : "bg-green-500"}`}></div>
          <span className="text-sm font-medium">Live Bidding</span>
          {newBidFlash && (
            <Badge variant="secondary" className="animate-pulse text-xs">
              New bid!
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{bidCount} bids</span>
          </div>
        </div>
      </div>

      {/* Current Highest Bid */}
      <div className={`bg-gradient-to-r from-green-500/10 to-emerald-500/10 border rounded-xl p-4 transition-all ${newBidFlash ? "border-amber-500 ring-2 ring-amber-500/30" : "border-green-500/20"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Highest Bid</p>
            <p className={`text-2xl font-bold transition-all ${newBidFlash ? "text-amber-600 scale-105" : "text-green-600"}`}>
              ₹{currentHighestBid.toLocaleString()}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${newBidFlash ? "bg-amber-500/20" : "bg-green-500/20"}`}>
            <TrendingUp className={`w-6 h-6 ${newBidFlash ? "text-amber-600" : "text-green-600"}`} />
          </div>
        </div>
      </div>

      {/* Recent Bids */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
        {bids.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bids yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bids.slice(0, 10).map((bid, index) => {
              const isMyBid = bid.broker_id === myBrokerId;
              const isHighest = index === 0;
              const isAnimating = animatedBids.includes(bid.id);
              
              return (
                <div
                  key={bid.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-all
                    ${isMyBid ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-card"}
                    ${isAnimating ? "animate-pulse ring-2 ring-green-500/50" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${isHighest ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {isMyBid ? "You" : getAnonymizedName(index)}
                        {isHighest && (
                          <Badge className="ml-2 bg-green-500 text-white text-xs">
                            Highest
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBidTime(bid.placed_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{bid.bid_amount.toLocaleString()}</p>
                    {bid.commission_amount > 0 && (
                      <p className="text-xs text-amber-600">
                        +₹{bid.commission_amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveBidFeed;
