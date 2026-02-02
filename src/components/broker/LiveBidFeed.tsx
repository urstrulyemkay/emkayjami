import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users } from "lucide-react";
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

  // Animate new bids
  useEffect(() => {
    if (bids.length > 0) {
      const latestBid = bids[0];
      if (!animatedBids.includes(latestBid.id)) {
        setAnimatedBids(prev => [...prev, latestBid.id]);
        
        if (previousBidCountRef.current < bidCount) {
          setNewBidFlash(true);
          setTimeout(() => setNewBidFlash(false), 600);
        }
        
        setTimeout(() => {
          setAnimatedBids(prev => prev.filter(id => id !== latestBid.id));
        }, 2000);
      }
    }
    previousBidCountRef.current = bidCount;
  }, [bids, bidCount, animatedBids]);

  const formatBidTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  const getAnonymizedName = (index: number) => {
    return `Broker ${String.fromCharCode(65 + index)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${newBidFlash ? "bg-accent" : "bg-accent"} animate-pulse`} />
          <span className="text-sm font-medium text-foreground">Live Bidding</span>
          {newBidFlash && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              New!
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{bidCount}</span>
        </div>
      </div>

      {/* Current Highest Bid Card */}
      <div className={`rounded-xl p-4 transition-all duration-300 ${
        newBidFlash 
          ? "bg-accent/10 border border-accent/30 ring-2 ring-accent/20" 
          : "bg-muted/50 border border-border"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Highest Bid</p>
            <p className={`text-2xl font-bold transition-all duration-300 ${
              newBidFlash ? "text-accent scale-105" : "text-foreground"
            }`}>
              ₹{currentHighestBid.toLocaleString()}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            newBidFlash ? "bg-accent/20" : "bg-muted"
          }`}>
            <TrendingUp className={`w-5 h-5 ${newBidFlash ? "text-accent" : "text-muted-foreground"}`} />
          </div>
        </div>
      </div>

      {/* Recent Bids List */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activity</h4>
        
        {bids.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No bids yet</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Be the first to bid</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bids.slice(0, 8).map((bid, index) => {
              const isMyBid = bid.broker_id === myBrokerId;
              const isHighest = index === 0;
              const isAnimating = animatedBids.includes(bid.id);
              
              return (
                <div
                  key={bid.id}
                  className={`
                    flex items-center justify-between p-3 rounded-xl transition-all duration-200
                    ${isMyBid 
                      ? "bg-primary/5 border border-primary/10" 
                      : "bg-card border border-border"
                    }
                    ${isAnimating ? "ring-2 ring-accent/30 bg-accent/5" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                      ${isHighest 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* Bidder Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {isMyBid ? "You" : getAnonymizedName(index)}
                        </p>
                        {isHighest && (
                          <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                            Leading
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatBidTime(bid.placed_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bid Amount */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ₹{bid.bid_amount.toLocaleString()}
                    </p>
                    {bid.commission_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
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
