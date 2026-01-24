import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, Gavel, Timer, TrendingUp, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Auction {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  status: "live" | "completed" | "cancelled";
  auctionType: string;
  startTime: Date;
  endTime?: Date;
  currentBid?: number;
  winningBid?: number;
  totalBids: number;
  brokersInvited: number;
}

// Mock data for auctions
const MOCK_LIVE_AUCTIONS: Auction[] = [
  {
    id: "auc-001",
    vehicle: { make: "Honda", model: "Activa 6G", year: 2023, registration: "KA-01-AB-1234" },
    status: "live",
    auctionType: "Quick Auction",
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 mins ago
    currentBid: 42000,
    totalBids: 8,
    brokersInvited: 12,
  },
  {
    id: "auc-002",
    vehicle: { make: "TVS", model: "Jupiter", year: 2022, registration: "KA-02-CD-5678" },
    status: "live",
    auctionType: "Flexible Auction",
    startTime: new Date(Date.now() - 5 * 60 * 1000), // Started 5 mins ago
    currentBid: 38500,
    totalBids: 4,
    brokersInvited: 8,
  },
];

const MOCK_PAST_AUCTIONS: Auction[] = [
  {
    id: "auc-101",
    vehicle: { make: "Bajaj", model: "Pulsar 150", year: 2021, registration: "KA-03-EF-9012" },
    status: "completed",
    auctionType: "Quick Auction",
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    winningBid: 65000,
    totalBids: 15,
    brokersInvited: 20,
  },
  {
    id: "auc-102",
    vehicle: { make: "Hero", model: "Splendor Plus", year: 2020, registration: "KA-04-GH-3456" },
    status: "completed",
    auctionType: "Extended Auction",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    winningBid: 45000,
    totalBids: 22,
    brokersInvited: 25,
  },
  {
    id: "auc-103",
    vehicle: { make: "Royal Enfield", model: "Classic 350", year: 2022, registration: "KA-05-IJ-7890" },
    status: "completed",
    auctionType: "Flexible Auction",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    winningBid: 125000,
    totalBids: 18,
    brokersInvited: 15,
  },
  {
    id: "auc-104",
    vehicle: { make: "Suzuki", model: "Access 125", year: 2021, registration: "KA-06-KL-2345" },
    status: "cancelled",
    auctionType: "Quick Auction",
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    totalBids: 0,
    brokersInvited: 10,
  },
];

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const formatElapsedTime = (startTime: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AuctionsList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"live" | "past">("live");

  const handleViewLiveAuction = (auction: Auction) => {
    // Navigate to live auction view
    navigate("/auction/live", {
      state: {
        vehicle: auction.vehicle,
        auctionType: auction.auctionType.toLowerCase().replace(" ", "_"),
        resuming: true,
        auctionId: auction.id,
      },
    });
  };

  const handleViewPastAuction = (auction: Auction) => {
    // Navigate to auction result view
    navigate("/auction/result", {
      state: {
        vehicle: auction.vehicle,
        winningBid: auction.winningBid ? {
          amount: auction.winningBid,
          brokerId: "broker-1",
          brokerName: "Auto Traders",
          incentive: Math.round(auction.winningBid * 0.02),
          timestamp: auction.endTime,
        } : null,
        totalBids: auction.totalBids,
        averageBid: auction.winningBid ? auction.winningBid * 0.9 : 0,
        slaMetTime: auction.endTime,
        auctionType: auction.auctionType,
      },
    });
  };

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
          <h1 className="text-xl font-semibold text-foreground">My Auctions</h1>
          <p className="text-sm text-muted-foreground">
            {MOCK_LIVE_AUCTIONS.length} live • {MOCK_PAST_AUCTIONS.length} completed
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "live" | "past")}>
          <TabsList className="w-full">
            <TabsTrigger value="live" className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Live ({MOCK_LIVE_AUCTIONS.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Past ({MOCK_PAST_AUCTIONS.length})
            </TabsTrigger>
          </TabsList>

          {/* Live Auctions */}
          <TabsContent value="live" className="mt-4 space-y-3">
            {MOCK_LIVE_AUCTIONS.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No live auctions</p>
                <Button 
                  onClick={() => navigate("/inspection/new")} 
                  className="mt-4"
                >
                  Start New Inspection
                </Button>
              </div>
            ) : (
              MOCK_LIVE_AUCTIONS.map((auction) => (
                <button
                  key={auction.id}
                  onClick={() => handleViewLiveAuction(auction)}
                  className="w-full p-4 rounded-xl border border-primary/50 bg-primary/5 text-left transition-all hover:bg-primary/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {auction.vehicle.make} {auction.vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {auction.vehicle.registration} • {auction.vehicle.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="font-bold text-lg text-foreground">
                          ₹{auction.currentBid?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Bids</p>
                        <p className="font-semibold text-foreground">{auction.totalBids}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Elapsed</p>
                        <p className="font-mono text-foreground">
                          {formatElapsedTime(auction.startTime)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {auction.auctionType} • {auction.brokersInvited} brokers
                    </span>
                    <span className="text-xs text-primary font-medium">View Auction →</span>
                  </div>
                </button>
              ))
            )}
          </TabsContent>

          {/* Past Auctions */}
          <TabsContent value="past" className="mt-4 space-y-3">
            {MOCK_PAST_AUCTIONS.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No past auctions</p>
              </div>
            ) : (
              MOCK_PAST_AUCTIONS.map((auction) => (
                <button
                  key={auction.id}
                  onClick={() => handleViewPastAuction(auction)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    auction.status === "completed"
                      ? "border-border bg-card hover:bg-secondary/50"
                      : "border-destructive/30 bg-destructive/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {auction.vehicle.make} {auction.vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {auction.vehicle.registration} • {auction.vehicle.year}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      auction.status === "completed"
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                    )}>
                      {auction.status === "completed" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          SOLD
                        </>
                      ) : (
                        "CANCELLED"
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {auction.status === "completed" && auction.winningBid && (
                        <div>
                          <p className="text-xs text-muted-foreground">Winning Bid</p>
                          <p className="font-bold text-lg text-success">
                            ₹{auction.winningBid.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total Bids</p>
                        <p className="font-semibold text-foreground">{auction.totalBids}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">When</p>
                        <p className="text-foreground text-sm">
                          {formatTimeAgo(auction.startTime)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {auction.auctionType} • {auction.brokersInvited} brokers invited
                    </span>
                    <span className="text-xs text-primary font-medium">View Details →</span>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-6 mt-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h3 className="font-medium text-foreground mb-3">This Month</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {MOCK_PAST_AUCTIONS.filter(a => a.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-success">
                ₹{(MOCK_PAST_AUCTIONS
                  .filter(a => a.winningBid)
                  .reduce((sum, a) => sum + (a.winningBid || 0), 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {Math.round(MOCK_PAST_AUCTIONS.reduce((sum, a) => sum + a.totalBids, 0) / MOCK_PAST_AUCTIONS.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Bids</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionsList;
