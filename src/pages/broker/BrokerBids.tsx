import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Trophy, XCircle, Clock } from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";

// Mock bid data
const MOCK_BIDS = {
  live: [
    {
      id: "bid-1",
      vehicle: { make: "TVS", model: "Apache RTR 160", year: 2023, city: "Bangalore" },
      bidAmount: 37000,
      commission: 1000,
      status: "WINNING",
      timeRemaining: 15 * 60 * 1000,
      currentHighest: 37000,
    },
    {
      id: "bid-2",
      vehicle: { make: "Bajaj", model: "Pulsar NS200", year: 2022, city: "Bangalore" },
      bidAmount: 50000,
      commission: 500,
      status: "OUTBID",
      timeRemaining: 45 * 60 * 1000,
      currentHighest: 52000,
    },
  ],
  won: [
    {
      id: "bid-3",
      vehicle: { make: "Hero", model: "Splendor Plus", year: 2021, city: "Bangalore" },
      bidAmount: 32000,
      commission: 0,
      wonAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentStatus: "completed",
      deliveryStatus: "in_transit",
    },
  ],
  lost: [
    {
      id: "bid-4",
      vehicle: { make: "Honda", model: "Activa 6G", year: 2022, city: "Mumbai" },
      bidAmount: 45000,
      commission: 500,
      lossReason: "lower_bid",
      winningBidRange: "₹47,000 - ₹48,000",
    },
  ],
};

const BrokerBids = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/broker/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !broker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/broker")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Bids</h1>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="px-4 py-4 bg-muted/50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">50</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold">30%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">₹35k</p>
            <p className="text-xs text-muted-foreground">Avg Bid</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="live" className="gap-1">
            <Clock className="w-4 h-4" />
            Live ({MOCK_BIDS.live.length})
          </TabsTrigger>
          <TabsTrigger value="won" className="gap-1">
            <Trophy className="w-4 h-4" />
            Won ({MOCK_BIDS.won.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="gap-1">
            <XCircle className="w-4 h-4" />
            Lost ({MOCK_BIDS.lost.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-3 mt-0">
          {MOCK_BIDS.live.map((bid) => (
            <div
              key={bid.id}
              className="bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50"
              onClick={() => navigate(`/broker/auction/${bid.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">
                    {bid.vehicle.make} {bid.vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bid.vehicle.year} • {bid.vehicle.city}
                  </p>
                </div>
                <Badge
                  className={
                    bid.status === "WINNING"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {bid.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Your bid</p>
                  <p className="font-semibold">
                    ₹{bid.bidAmount.toLocaleString()}
                    {bid.commission > 0 && (
                      <span className="text-amber-600 text-sm"> + ₹{bid.commission}</span>
                    )}
                  </p>
                </div>
                {bid.status === "OUTBID" && (
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Increase Bid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="won" className="space-y-3 mt-0">
          {MOCK_BIDS.won.map((bid) => (
            <div
              key={bid.id}
              className="bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">
                    {bid.vehicle.make} {bid.vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bid.vehicle.year} • {bid.vehicle.city}
                  </p>
                </div>
                <Badge className="bg-green-500 text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  WON
                </Badge>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div>
                  <p className="text-sm text-muted-foreground">Winning bid</p>
                  <p className="font-semibold text-green-600">
                    ₹{bid.bidAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {bid.deliveryStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="lost" className="space-y-3 mt-0">
          {MOCK_BIDS.lost.map((bid) => (
            <div
              key={bid.id}
              className="bg-card border rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">
                    {bid.vehicle.make} {bid.vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bid.vehicle.year} • {bid.vehicle.city}
                  </p>
                </div>
                <Badge variant="secondary">LOST</Badge>
              </div>
              <div className="bg-muted rounded-lg p-3 mt-3">
                <p className="text-sm">
                  ❌ You lost because your vehicle bid was lower.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Winning bid range: {bid.winningBidRange}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  💡 Tip: Increase your bid amount on similar vehicles.
                </p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <BrokerBottomNav activeTab="bids" />
    </div>
  );
};

export default BrokerBids;
