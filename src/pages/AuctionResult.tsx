import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Trophy, Check, Users, Timer, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bid } from "@/data/auctionTypes";

interface ResultState {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  winningBid: Bid | null;
  totalBids: number;
  averageBid: number;
  slaMetTime: Date | null;
  auctionType: string;
}

const AuctionResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  
  const resultState = location.state as ResultState | null;

  if (!resultState || !resultState.winningBid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No auction results available.</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { vehicle, winningBid, totalBids, averageBid, slaMetTime } = resultState;

  const nextActions = [
    { id: "1", text: "Customer approved quotation" },
    { id: "2", text: "Confirm sale with winning broker" },
    { id: "3", text: "Schedule pickup and parking" },
    { id: "4", text: "Collect documents from customer" },
  ];

  const toggleAction = (actionId: string) => {
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  const allActionsCompleted = completedActions.size === nextActions.length;

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
        <h1 className="text-xl font-semibold text-foreground">Auction Results</h1>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Success Card */}
        <div className="p-6 rounded-2xl bg-success/10 border border-success text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Auction Complete!</h2>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} • {vehicle.registration}
          </p>
        </div>

        {/* Winning Bid Card */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Winning Bid</p>
            <p className="text-5xl font-bold text-foreground">
              ₹{winningBid.amount.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-success">
                +₹{winningBid.incentive.toLocaleString()} incentive
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalBids}</p>
              <p className="text-xs text-muted-foreground">Total Bids</p>
            </div>
            <div className="text-center border-x border-border">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-foreground">
                ₹{(averageBid / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Timer className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-success">
                {slaMetTime ? "✓" : "—"}
              </p>
              <p className="text-xs text-muted-foreground">SLA Met</p>
            </div>
          </div>
        </div>

        {/* Broker Info */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Winning Broker</p>
              <p className="font-medium text-foreground">{winningBid.brokerName}</p>
            </div>
            <div className="px-2 py-1 rounded-full bg-secondary text-xs text-foreground">
              Level 4
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Broker ID: {winningBid.brokerId} • Won at {winningBid.timestamp.toLocaleTimeString()}
          </p>
        </div>

        {/* Next Actions */}
        <section>
          <h2 className="font-medium text-foreground mb-3">Next Actions</h2>
          <div className="space-y-2">
            {nextActions.map((action) => {
              const isDone = completedActions.has(action.id);
              return (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border bg-card text-left transition-all ${
                    isDone ? "border-success bg-success/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone ? "bg-success border-success" : "border-muted-foreground"
                  }`}>
                    {isDone && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`flex-1 ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {action.text}
                  </span>
                  {!isDone && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Coin Reward */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning">
          <span className="text-3xl">💰</span>
          <div>
            <p className="font-medium text-foreground">+150 Coins Earned!</p>
            <p className="text-sm text-muted-foreground">
              Quick sale bonus + SLA achievement
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/inspection/consent", { state: { vehicle, winningBid } })}
            className="w-full h-14 text-base font-medium"
            size="lg"
          >
            Proceed to Customer Approval
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuctionResult;
