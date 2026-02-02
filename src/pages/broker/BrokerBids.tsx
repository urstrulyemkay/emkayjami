import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Trophy, XCircle, Clock } from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import {
  LIVE_BIDS,
  WON_BIDS,
  LOST_BIDS,
  BROKER_STATS,
  formatTimeRemaining,
  formatCurrency,
  getLossReasonText,
  getLossTip,
  getAuctionTypeConfig,
} from "@/data/brokerMockData";

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

  // Calculate consistent analytics from BROKER_STATS
  const totalBids = BROKER_STATS.totalBidsPlaced;
  const wins = BROKER_STATS.totalWins;
  const winRate = BROKER_STATS.winRate;
  const avgBid = formatCurrency(BROKER_STATS.avgBidAmount);

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

      {/* Analytics Summary - Using consistent data */}
      <div className="px-4 py-4 bg-muted/50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{totalBids}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{avgBid}</p>
            <p className="text-xs text-muted-foreground">Avg Bid</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="live" className="gap-1">
            <Clock className="w-4 h-4" />
            Live ({LIVE_BIDS.length})
          </TabsTrigger>
          <TabsTrigger value="won" className="gap-1">
            <Trophy className="w-4 h-4" />
            Won ({WON_BIDS.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="gap-1">
            <XCircle className="w-4 h-4" />
            Lost ({LOST_BIDS.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-3 mt-0">
          {LIVE_BIDS.map((bid) => (
            <div
              key={bid.id}
              className="bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50"
              onClick={() => navigate(`/broker/auction/${bid.auctionId}`)}
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
                    bid.status === "winning"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }
                >
                  {bid.status.toUpperCase()}
                </Badge>
              </div>
              
              {/* Time remaining */}
              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimeRemaining(bid.timeRemaining || 0)} remaining</span>
                <Badge variant="outline" className="text-xs">
                  {getAuctionTypeConfig(bid.auctionType).icon} {getAuctionTypeConfig(bid.auctionType).name}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Your bid</p>
                  <p className="font-semibold">
                    ₹{bid.bidAmount.toLocaleString()}
                    {bid.commission > 0 && (
                      <span className="text-amber-600 text-sm"> + ₹{bid.commission.toLocaleString()}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Effective: {bid.effectiveScore.toFixed(0)}
                  </p>
                </div>
                {bid.status === "outbid" && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current highest</p>
                    <p className="text-sm font-medium text-red-600">₹{bid.currentHighestBid?.toLocaleString()}</p>
                    <Button size="sm" className="mt-1 bg-amber-500 hover:bg-amber-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Increase
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="won" className="space-y-3 mt-0">
          {WON_BIDS.map((bid) => (
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
                    {bid.commission > 0 && (
                      <span className="text-amber-600 text-sm"> + ₹{bid.commission.toLocaleString()}</span>
                    )}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="capitalize">
                    {bid.deliveryStatus?.replace(/_/g, " ")}
                  </Badge>
                  {bid.rcTransferStatus && (
                    <p className="text-xs text-muted-foreground">
                      RC: {bid.rcTransferStatus.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="lost" className="space-y-3 mt-0">
          {LOST_BIDS.map((bid) => (
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
              
              <div className="mb-3">
                <p className="text-sm text-muted-foreground">Your bid</p>
                <p className="font-semibold">
                  ₹{bid.bidAmount.toLocaleString()}
                  {bid.commission > 0 && (
                    <span className="text-amber-600 text-sm"> + ₹{bid.commission.toLocaleString()}</span>
                  )}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">
                  ❌ {getLossReasonText(bid.lossReason || "")}
                </p>
                {bid.winningBidRange && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Winning bid range: {bid.winningBidRange}
                  </p>
                )}
                <p className="text-xs text-amber-600 mt-2">
                  {getLossTip(bid.lossReason || "")}
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
