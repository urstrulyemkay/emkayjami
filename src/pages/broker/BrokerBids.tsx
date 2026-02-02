import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, XCircle, Clock, Gavel, AlertTriangle } from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import VehicleCard from "@/components/broker/VehicleCard";
import { useBrokerBids } from "@/hooks/useBrokerBids";
import { useBrokerWonVehicles } from "@/hooks/useBrokerWonVehicles";
import { formatCurrency } from "@/data/brokerMockData";

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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Bids</h1>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="px-4 py-4 bg-muted/50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.totalBids}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{stats.totalWins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{formatCurrency(stats.avgBidAmount)}</p>
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

        {/* Live Bids Tab */}
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
              const highestBid = bid.auction?.current_highest_bid || 0;
              const bidDifference = bid.bid_amount - highestBid;
              
              return (
                <VehicleCard
                  key={bid.id}
                  vehicle={{
                    make: bid.auction?.inspections?.vehicle_make || "Honda",
                    model: bid.auction?.inspections?.vehicle_model || "Activa 6G",
                    year: bid.auction?.inspections?.vehicle_year || 2023,
                    kms: bid.auction?.inspections?.odometer_reading || 12000,
                    color: bid.auction?.inspections?.vehicle_color,
                    city: "Bangalore",
                  }}
                  status={{
                    type: "live",
                    bidAmount: bid.bid_amount,
                    commission: bid.commission_amount,
                    timeRemaining,
                    auctionType: bid.auction?.auction_type || "flexible",
                    bidDifference,
                  }}
                  onClick={() => navigate(`/broker/auction/${bid.auction_id}`)}
                />
              );
            })
          )}
        </TabsContent>

        {/* Won Bids Tab */}
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
              
              return (
                <VehicleCard
                  key={bid.id}
                  vehicle={{
                    make: bid.auction?.inspections?.vehicle_make || "Honda",
                    model: bid.auction?.inspections?.vehicle_model || "Activa 6G",
                    year: bid.auction?.inspections?.vehicle_year || 2023,
                    kms: bid.auction?.inspections?.odometer_reading || 12000,
                    color: bid.auction?.inspections?.vehicle_color,
                  }}
                  status={{
                    type: "won",
                    bidAmount: bid.bid_amount,
                    commission: bid.commission_amount,
                    serviceProgress,
                    remainingDays,
                    isUrgent,
                  }}
                  onClick={() => wonVehicle && navigate(`/broker/won/${wonVehicle.id}`)}
                />
              );
            })
          )}
        </TabsContent>

        {/* Lost Bids Tab */}
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
              const winningBid = bid.auction?.current_highest_bid || 0;
              const difference = winningBid - bid.bid_amount;
              
              return (
                <VehicleCard
                  key={bid.id}
                  vehicle={{
                    make: bid.auction?.inspections?.vehicle_make || "Honda",
                    model: bid.auction?.inspections?.vehicle_model || "Activa 6G",
                    year: bid.auction?.inspections?.vehicle_year || 2023,
                    kms: bid.auction?.inspections?.odometer_reading || 12000,
                    color: bid.auction?.inspections?.vehicle_color,
                  }}
                  status={{
                    type: "lost",
                    bidAmount: bid.bid_amount,
                    winningBid,
                    bidDifference: difference,
                  }}
                />
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
