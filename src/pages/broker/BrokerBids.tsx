import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Trophy, XCircle, Clock, Gavel, ChevronRight, AlertTriangle } from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import { useBrokerBids } from "@/hooks/useBrokerBids";
import { useBrokerWonVehicles } from "@/hooks/useBrokerWonVehicles";
import {
  formatTimeRemaining,
  formatCurrency,
  getAuctionTypeConfig,
  calculateEffectiveScore,
} from "@/data/brokerMockData";

const BrokerBids = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeTab, setActiveTab] = useState("live");

  // Real-time bids hook
  const { liveBids, wonBids, lostBids, loading, stats } = useBrokerBids(broker?.id);
  
  // Won vehicles with service tracking
  const { wonVehicles, loading: wonVehiclesLoading, urgentCount } = useBrokerWonVehicles(broker?.id);

  // Helper to get won vehicle data for a bid
  const getWonVehicleForBid = (auctionId: string) => {
    return wonVehicles.find((wv) => wv.auction_id === auctionId);
  };

  // Calculate service progress percentage
  const getServiceProgress = (wv: typeof wonVehicles[0]) => {
    const stages = [
      wv.payment_status === "completed",
      wv.pickup_status === "completed",
      wv.delivery_status === "completed" || wv.delivery_status === "delivered",
      wv.rc_transfer_status === "completed",
      wv.name_transfer_status === "completed",
    ];
    return Math.round((stages.filter(Boolean).length / stages.length) * 100);
  };

  // Calculate remaining days for RC deadline
  const getRemainingDays = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    return Math.max(0, end - Date.now());
  };

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

      {/* Analytics Summary - Using real data */}
      <div className="px-4 py-4 bg-muted/50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.totalBids}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.totalWins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.avgBidAmount)}</p>
            <p className="text-xs text-muted-foreground">Avg Bid</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="live" className="gap-1">
            <Clock className="w-4 h-4" />
            Live ({liveBids.length})
          </TabsTrigger>
          <TabsTrigger value="won" className="gap-1">
            <Trophy className="w-4 h-4" />
            Won ({wonBids.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="gap-1">
            <XCircle className="w-4 h-4" />
            Lost ({lostBids.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-3 mt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : liveBids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active bids</p>
              <p className="text-sm">Browse auctions to start bidding!</p>
              <Button className="mt-4" onClick={() => navigate("/broker")}>
                View Auctions
              </Button>
            </div>
          ) : (
            liveBids.map((bid) => {
              const timeRemaining = bid.auction ? getTimeRemaining(bid.auction.end_time) : 0;
              const auctionType = bid.auction?.auction_type || "flexible";
              const config = getAuctionTypeConfig(auctionType as any);
              const effectiveScore = calculateEffectiveScore(bid.bid_amount, bid.commission_amount);

              return (
                <div
                  key={bid.id}
                  className="bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50"
                  onClick={() => navigate(`/broker/auction/${bid.auction_id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {bid.auction?.inspections?.vehicle_year}
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
                    <span>{formatTimeRemaining(timeRemaining)} remaining</span>
                    <Badge variant="outline" className="text-xs">
                      {config.icon} {config.name}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Your bid</p>
                      <p className="font-semibold">
                        ₹{bid.bid_amount.toLocaleString()}
                        {bid.commission_amount > 0 && (
                          <span className="text-amber-600 text-sm"> + ₹{bid.commission_amount.toLocaleString()}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Effective: {effectiveScore.toFixed(0)}
                      </p>
                    </div>
                    {bid.status === "outbid" && bid.auction && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Current highest</p>
                        <p className="text-sm font-medium text-red-600">
                          ₹{(bid.auction.current_highest_bid || 0).toLocaleString()}
                        </p>
                        <Button size="sm" className="mt-1 bg-amber-500 hover:bg-amber-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Increase
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="won" className="space-y-3 mt-0">
          {/* Urgent banner */}
          {urgentCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {urgentCount} vehicle{urgentCount > 1 ? "s" : ""} need{urgentCount === 1 ? "s" : ""} RC transfer soon
                </p>
                <p className="text-xs text-amber-600">Complete before deadline to avoid penalties</p>
              </div>
            </div>
          )}

          {loading || wonVehiclesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : wonBids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No wins yet</p>
              <p className="text-sm">Keep bidding to win auctions!</p>
            </div>
          ) : (
            wonBids.map((bid) => {
              const wonVehicle = getWonVehicleForBid(bid.auction_id);
              const serviceProgress = wonVehicle ? getServiceProgress(wonVehicle) : 0;
              const remainingDays = wonVehicle ? getRemainingDays(wonVehicle.rc_transfer_deadline) : 180;
              const isUrgent = remainingDays <= 30 && wonVehicle?.rc_transfer_status !== "completed";
              
              return (
                <div
                  key={bid.id}
                  className="bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => wonVehicle && navigate(`/broker/won/${wonVehicle.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {bid.auction?.inspections?.vehicle_year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {remainingDays}d left
                        </Badge>
                      )}
                      <Badge className="bg-green-500 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        WON
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Service Progress */}
                  {wonVehicle && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted-foreground">Service Progress</span>
                        <span className={serviceProgress === 100 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                          {serviceProgress}%
                        </span>
                      </div>
                      <Progress value={serviceProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Winning bid</p>
                      <p className="font-semibold text-green-600">
                        ₹{bid.bid_amount.toLocaleString()}
                        {bid.commission_amount > 0 && (
                          <span className="text-amber-600 text-sm"> + ₹{bid.commission_amount.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {wonVehicle ? (
                        serviceProgress === 100 ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )
                      ) : (
                        <Badge variant="secondary">Processing</Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="lost" className="space-y-3 mt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : lostBids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No lost bids</p>
              <p className="text-sm">Great job on your bidding strategy!</p>
            </div>
          ) : (
            lostBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-card border rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">
                      {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {bid.auction?.inspections?.vehicle_year}
                    </p>
                  </div>
                  <Badge variant="secondary">LOST</Badge>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Your bid</p>
                  <p className="font-semibold">
                    ₹{bid.bid_amount.toLocaleString()}
                    {bid.commission_amount > 0 && (
                      <span className="text-amber-600 text-sm"> + ₹{bid.commission_amount.toLocaleString()}</span>
                    )}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    ❌ Your bid was lower than the winning bid.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    💡 Tip: Increase your bid amount or commission on similar vehicles.
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <BrokerBottomNav activeTab="bids" />
    </div>
  );
};

export default BrokerBids;
