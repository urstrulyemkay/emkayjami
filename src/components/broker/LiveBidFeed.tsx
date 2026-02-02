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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestBidRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to latest bid when new bid comes in
  useEffect(() => {
    if (newBidFlash && latestBidRef.current) {
      setTimeout(() => {
        latestBidRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "end"
        });
      }, 100);
    }
  }, [newBidFlash]);

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

      {/* Horizontal Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bid Timeline</h4>
        
        {bids.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No bids yet</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Be the first to bid</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline container */}
            <div ref={scrollContainerRef} className="overflow-x-auto pb-4 scrollbar-thin">
              <div className="flex items-center gap-0 min-w-max px-2 py-4">
                {/* Render bids in chronological order (oldest first, so reverse) */}
                {[...bids].reverse().map((bid, index, arr) => {
                  const isMyBid = bid.broker_id === myBrokerId;
                  const isHighest = bid.id === bids[0]?.id; // bids[0] is highest
                  const isAnimating = animatedBids.includes(bid.id);
                  const isLast = index === arr.length - 1;
                  
                  return (
                    <div key={bid.id} className="flex items-center" ref={isLast ? latestBidRef : null}>
                      {/* Bid Node */}
                      <div className="relative flex flex-col items-center">
                        {/* Connector line (before node, except first) */}
                        {index > 0 && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 w-8 h-0.5 bg-border" />
                        )}
                        
                        {/* Node */}
                        <div
                          className={`
                            relative w-12 h-12 rounded-full flex items-center justify-center
                            transition-all duration-300 cursor-pointer group
                            ${isHighest 
                              ? "bg-accent text-accent-foreground ring-2 ring-accent/30 ring-offset-2 ring-offset-background" 
                              : isMyBid
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }
                            ${isAnimating ? "scale-110 ring-4 ring-accent/40" : "hover:scale-105"}
                          `}
                        >
                          <span className="text-xs font-bold">
                            {isMyBid ? "You" : String.fromCharCode(65 + (arr.length - 1 - index))}
                          </span>
                          
                          {/* Highest indicator */}
                          {isHighest && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                              <TrendingUp className="w-2.5 h-2.5 text-accent-foreground" />
                            </div>
                          )}
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-popover text-popover-foreground border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                              <p className="text-sm font-semibold">₹{bid.bid_amount.toLocaleString()}</p>
                              {bid.commission_amount > 0 && (
                                <p className="text-xs text-muted-foreground">+₹{bid.commission_amount.toLocaleString()} comm.</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{formatBidTime(bid.placed_at)}</p>
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                          </div>
                        </div>
                        
                        {/* Amount label below node */}
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-medium ${isHighest ? "text-accent" : "text-foreground"}`}>
                            ₹{(bid.bid_amount / 1000).toFixed(0)}K
                          </p>
                        </div>
                        
                        {/* Connector line (after node, except last) */}
                        {!isLast && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-0.5 bg-border" />
                        )}
                      </div>
                      
                      {/* Spacer between nodes */}
                      {!isLast && <div className="w-8" />}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Timeline legend */}
            <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">Highest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Your bid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">Others</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveBidFeed;
