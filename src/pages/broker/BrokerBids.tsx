import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Trophy, XCircle, Clock, Gavel, ChevronRight, AlertTriangle, MapPin } from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import { useBrokerBids } from "@/hooks/useBrokerBids";
import { useBrokerWonVehicles } from "@/hooks/useBrokerWonVehicles";
import {
  formatTimeRemaining,
  formatCurrency,
  getAuctionTypeConfig,
  calculateEffectiveScore,
} from "@/data/brokerMockData";

// Vehicle thumbnails by make
const BIKE_THUMBNAILS: Record<string, string> = {
  "Honda": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "TVS": "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop",
  "Bajaj": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop",
  "Royal Enfield": "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=300&fit=crop",
  "Yamaha": "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=400&h=300&fit=crop",
  "Hero": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop",
  "Suzuki": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop",
  "default": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
};

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
              const make = bid.auction?.inspections?.vehicle_make || "Honda";
              const thumbnail = BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"];

              return (
                <div
                  key={bid.id}
                  className="bg-card border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/broker/auction/${bid.auction_id}`)}
                >
                  <div className="flex gap-3 p-3">
                    {/* Vehicle Image */}
                    <div className="relative w-20 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img
                        src={thumbnail}
                        alt={bid.auction?.inspections?.vehicle_model || "Vehicle"}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-0.5 right-0.5 text-[10px] px-1.5 py-0 h-4 ${
                          bid.status === "winning"
                            ? "bg-accent text-accent-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {bid.status === "winning" ? "WIN" : "OUT"}
                      </Badge>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className={`text-xs font-medium ${timeRemaining < 5 * 60 * 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                            {formatTimeRemaining(timeRemaining)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {bid.auction?.inspections?.vehicle_year} • {(bid.auction?.inspections?.odometer_reading || 0).toLocaleString()} km
                      </p>
                      
                      {/* Bid info row */}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            ₹{bid.bid_amount.toLocaleString()}
                          </span>
                          {bid.commission_amount > 0 && (
                            <span className="text-warning text-xs">+₹{bid.commission_amount.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {config.icon} {config.name}
                          </Badge>
                          {bid.status === "outbid" && (
                            <Button size="sm" className="h-6 px-2 text-xs bg-warning text-warning-foreground hover:bg-warning/90">
                              <TrendingUp className="w-3 h-3 mr-0.5" />
                              Raise
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="won" className="space-y-3 mt-0">
          {/* Urgent banner */}
          {urgentCount > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {urgentCount} vehicle{urgentCount > 1 ? "s" : ""} need{urgentCount === 1 ? "s" : ""} RC transfer soon
                </p>
                <p className="text-xs text-muted-foreground">Complete before deadline to avoid penalties</p>
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
              const make = bid.auction?.inspections?.vehicle_make || "Honda";
              const thumbnail = BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"];
              
              return (
                <div
                  key={bid.id}
                  className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => wonVehicle && navigate(`/broker/won/${wonVehicle.id}`)}
                >
                  <div className="flex gap-4 p-4">
                    {/* Vehicle Image */}
                    <div className="relative w-24 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                      <img
                        src={thumbnail}
                        alt={bid.auction?.inspections?.vehicle_model || "Vehicle"}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-1 right-1 text-xs bg-accent text-accent-foreground">
                        <Trophy className="w-3 h-3 mr-1" />
                        WON
                      </Badge>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">
                            {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {bid.auction?.inspections?.vehicle_year} • {(bid.auction?.inspections?.odometer_reading || 0).toLocaleString()} km
                          </p>
                        </div>
                        {isUrgent && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {remainingDays}d
                          </Badge>
                        )}
                      </div>
                      
                      {/* Service Progress */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground">Service</span>
                          <span className={serviceProgress === 100 ? "text-accent font-medium" : "text-muted-foreground"}>
                            {serviceProgress}%
                          </span>
                        </div>
                        <Progress value={serviceProgress} className="h-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t bg-muted/30 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Winning bid</p>
                      <p className="font-semibold text-accent">
                        ₹{bid.bid_amount.toLocaleString()}
                        {bid.commission_amount > 0 && (
                          <span className="text-warning text-sm"> + ₹{bid.commission_amount.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {serviceProgress === 100 ? (
                        <Badge variant="outline" className="text-accent border-accent/20">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Progress</Badge>
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
            lostBids.map((bid) => {
              const make = bid.auction?.inspections?.vehicle_make || "Honda";
              const thumbnail = BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"];
              const winningBid = bid.auction?.current_highest_bid || 0;
              const difference = winningBid - bid.bid_amount;
              
              return (
                <div
                  key={bid.id}
                  className="bg-card border rounded-xl overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {/* Vehicle Image */}
                    <div className="relative w-24 h-20 bg-muted rounded-xl overflow-hidden shrink-0 grayscale opacity-75">
                      <img
                        src={thumbnail}
                        alt={bid.auction?.inspections?.vehicle_model || "Vehicle"}
                        className="w-full h-full object-cover"
                      />
                      <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                        LOST
                      </Badge>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {bid.auction?.inspections?.vehicle_make} {bid.auction?.inspections?.vehicle_model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {bid.auction?.inspections?.vehicle_year} • {(bid.auction?.inspections?.odometer_reading || 0).toLocaleString()} km
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Your bid: </span>
                          <span className="font-medium">₹{bid.bid_amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Winning: </span>
                          <span className="font-medium text-accent">₹{winningBid.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Footer */}
                  <div className="px-4 py-3 border-t bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      ❌ Lost by <span className="font-medium text-foreground">₹{difference.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-warning mt-1">
                      💡 Consider adding commission to boost your effective score
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <BrokerBottomNav activeTab="bids" />
    </div>
  );
};

export default BrokerBids;
