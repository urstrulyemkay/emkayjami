import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Timer, TrendingUp, Users, Check, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bid,
  generateMockBid,
  formatTimeRemaining,
  AUCTION_TYPES,
} from "@/data/auctionTypes";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AuctionState {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  auctionType: string;
  duration: number;
  brokerNetwork: string;
  selectedBrokers: string[];
  estimatedPrice: number;
}

const AuctionLive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const auctionState = location.state as AuctionState | null;

  const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");
  const [bids, setBids] = useState<Bid[]>([]);
  const [highestBid, setHighestBid] = useState<Bid | null>(null);
  const [slaMetTime, setSlaMetTime] = useState<Date | null>(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [phase, setPhase] = useState<"early" | "active" | "closing">("early");

  const auctionConfig = AUCTION_TYPES.find((t) => t.type === auctionState?.auctionType);
  const basePrice = auctionState?.estimatedPrice || 35000;

  // Calculate end time
  const endTime = new Date(Date.now() + (auctionState?.duration || 30) * 60 * 1000);

  // Timer countdown
  useEffect(() => {
    if (auctionEnded) return;

    const interval = setInterval(() => {
      const remaining = formatTimeRemaining(endTime);
      setTimeRemaining(remaining);

      // Check phase based on time remaining
      const now = Date.now();
      const totalDuration = (auctionState?.duration || 30) * 60 * 1000;
      const elapsed = totalDuration - (endTime.getTime() - now);
      const progress = elapsed / totalDuration;

      if (progress < 0.2) setPhase("early");
      else if (progress < 0.8) setPhase("active");
      else setPhase("closing");

      if (remaining === "00:00:00") {
        setAuctionEnded(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionEnded, endTime, auctionState?.duration]);

  // Simulate incoming bids
  useEffect(() => {
    if (auctionEnded) return;

    // First bid comes quickly (within SLA target)
    const firstBidTimeout = setTimeout(() => {
      const newBid = generateMockBid("auction-1", basePrice, 1);
      newBid.isHighest = true;
      setBids([newBid]);
      setHighestBid(newBid);
      setSlaMetTime(new Date());
      toast({
        title: "First bid received!",
        description: `₹${newBid.amount.toLocaleString()} within SLA target`,
      });
    }, 3000 + Math.random() * 4000); // 3-7 seconds

    return () => clearTimeout(firstBidTimeout);
  }, [basePrice, toast, auctionEnded]);

  // Continue simulating bids
  useEffect(() => {
    if (auctionEnded || bids.length === 0) return;

    const bidInterval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance of new bid every interval
        const newBid = generateMockBid("auction-1", basePrice, bids.length + 1);
        
        setBids((prev) => {
          const updated = prev.map((b) => ({ ...b, isHighest: false }));
          const highest = updated.reduce((max, b) => (b.amount > max.amount ? b : max), updated[0]);
          
          if (newBid.amount > highest.amount) {
            newBid.isHighest = true;
            setHighestBid(newBid);
            toast({
              title: "New highest bid!",
              description: `₹${newBid.amount.toLocaleString()}`,
            });
          }
          
          return [newBid, ...updated];
        });
      }
    }, 5000 + Math.random() * 10000); // Every 5-15 seconds

    return () => clearInterval(bidInterval);
  }, [bids.length, basePrice, toast, auctionEnded]);

  const handleEndEarly = () => {
    setAuctionEnded(true);
  };

  const handleViewResults = () => {
    navigate("/auction/result", {
      state: {
        vehicle: auctionState?.vehicle,
        winningBid: highestBid,
        totalBids: bids.length,
        averageBid: bids.length > 0 
          ? Math.round(bids.reduce((sum, b) => sum + b.amount, 0) / bids.length)
          : 0,
        slaMetTime,
        auctionType: auctionState?.auctionType,
      },
    });
  };

  if (!auctionState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No auction data. Please set up an auction first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            {auctionState.vehicle.make} {auctionState.vehicle.model}
          </h1>
          <p className="text-sm text-muted-foreground">
            {auctionState.vehicle.registration}
          </p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          auctionEnded ? "bg-secondary text-foreground" : "bg-success/10 text-success"
        )}>
          {auctionEnded ? "Ended" : "Live"}
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Timer Card */}
        <div className="p-6 rounded-2xl bg-card border border-border text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time Remaining</span>
          </div>
          <p className={cn(
            "text-4xl font-mono font-bold",
            auctionEnded ? "text-muted-foreground" : "text-foreground"
          )}>
            {auctionEnded ? "00:00:00" : timeRemaining}
          </p>
          <div className="mt-4">
            <Progress 
              value={phase === "early" ? 20 : phase === "active" ? 50 : 90} 
              className="h-2"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={phase === "early" ? "text-primary font-medium" : ""}>Early</span>
              <span className={phase === "active" ? "text-primary font-medium" : ""}>Active</span>
              <span className={phase === "closing" ? "text-primary font-medium" : ""}>Closing</span>
            </div>
          </div>
        </div>

        {/* Highest Bid Card */}
        <div className="p-6 rounded-2xl bg-primary text-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-80">Current Highest Bid</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">{bids.length} bids</span>
            </div>
          </div>
          <p className="text-4xl font-bold">
            ₹{highestBid ? highestBid.amount.toLocaleString() : "—"}
          </p>
          {highestBid && (
            <p className="text-sm opacity-80 mt-1">
              +₹{highestBid.incentive.toLocaleString()} incentive
            </p>
          )}
        </div>

        {/* SLA Status */}
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          slaMetTime 
            ? "bg-success/10 border-success" 
            : "bg-warning/10 border-warning"
        )}>
          {slaMetTime ? (
            <>
              <Check className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium text-foreground">SLA Met ✓</p>
                <p className="text-sm text-muted-foreground">
                  First quote received in {Math.round((slaMetTime.getTime() - Date.now() + (auctionState.duration * 60 * 1000)) / 1000 / 60)} min
                </p>
              </div>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">Waiting for first bid...</p>
                <p className="text-sm text-muted-foreground">
                  Target: {auctionConfig?.slaMins} min
                </p>
              </div>
            </>
          )}
        </div>

        {/* Live Bid Feed */}
        <section>
          <h2 className="font-medium text-foreground mb-3">Bid History</h2>
          {bids.length === 0 ? (
            <div className="p-8 rounded-xl border border-border bg-card text-center">
              <p className="text-muted-foreground">No bids yet. Brokers are reviewing...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bids.slice(0, 10).map((bid, index) => (
                <div
                  key={bid.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    bid.isHighest 
                      ? "border-success bg-success/5" 
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      bid.isHighest ? "bg-success text-white" : "bg-secondary text-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {bid.brokerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bid.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      bid.isHighest ? "text-success" : "text-foreground"
                    )}>
                      ₹{bid.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +₹{bid.incentive.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        {!auctionEnded ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleEndEarly}
              className="w-full"
              disabled={bids.length === 0}
            >
              End Auction Early
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleViewResults}
            className="w-full h-14 text-base font-medium"
            size="lg"
          >
            View Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default AuctionLive;
