import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, Star, TrendingUp, Gavel, Clock, MapPin, 
  Filter, Bell, User, LogOut, Zap, Scale, Calendar, Target
} from "lucide-react";
import BrokerAuctionCard from "@/components/broker/BrokerAuctionCard";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import {
  BROKER_STATS,
  getLevelFromScore,
  formatTimeRemaining,
} from "@/data/brokerMockData";

interface AuctionWithInspection {
  id: string;
  auction_type: string;
  status: string;
  start_time: string;
  end_time: string;
  current_highest_bid: number | null;
  current_highest_commission: number | null;
  bid_count: number | null;
  geo_targeting_city: string | null;
  inspections: {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number | null;
    odometer_reading: number | null;
    vehicle_color: string | null;
    condition_score: number | null;
  };
}

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeTab, setActiveTab] = useState("live");
  const [liveAuctions, setLiveAuctions] = useState<AuctionWithInspection[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionWithInspection[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/broker/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch auctions from database
  useEffect(() => {
    const fetchAuctions = async () => {
      if (!broker) return;

      try {
        // Fetch live auctions
        const { data: liveData, error: liveError } = await supabase
          .from("auctions")
          .select(`
            id, auction_type, status, start_time, end_time,
            current_highest_bid, current_highest_commission, bid_count,
            geo_targeting_city,
            inspections (
              id, vehicle_make, vehicle_model, vehicle_year,
              odometer_reading, vehicle_color, condition_score
            )
          `)
          .eq("status", "live")
          .order("end_time", { ascending: true });

        if (liveError) {
          console.error("Error fetching live auctions:", liveError);
        } else {
          setLiveAuctions((liveData as unknown as AuctionWithInspection[]) || []);
        }

        // Fetch upcoming/scheduled auctions
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("auctions")
          .select(`
            id, auction_type, status, start_time, end_time,
            current_highest_bid, current_highest_commission, bid_count,
            geo_targeting_city,
            inspections (
              id, vehicle_make, vehicle_model, vehicle_year,
              odometer_reading, vehicle_color, condition_score
            )
          `)
          .eq("status", "scheduled")
          .order("start_time", { ascending: true });

        if (upcomingError) {
          console.error("Error fetching upcoming auctions:", upcomingError);
        } else {
          setUpcomingAuctions((upcomingData as unknown as AuctionWithInspection[]) || []);
        }
      } catch (err) {
        console.error("Error fetching auctions:", err);
      } finally {
        setLoadingAuctions(false);
      }
    };

    fetchAuctions();

    // Set up realtime subscription for live auctions
    const channel = supabase
      .channel("auctions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auctions",
        },
        () => {
          // Refetch on any change
          fetchAuctions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broker]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!broker) {
    return null;
  }

  const levelConfig = getLevelFromScore(broker.trust_score);

  // Helper to get grade from condition score
  const getGradeFromScore = (score: number | null): string => {
    if (!score) return "C";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "E";
  };

  // Transform DB auctions for the card component
  const transformAuctionForCard = (auction: AuctionWithInspection) => {
    const endTime = new Date(auction.end_time);
    const timeRemaining = Math.max(0, endTime.getTime() - Date.now());
    const grade = getGradeFromScore(auction.inspections?.condition_score);

    return {
      id: auction.id,
      vehicle: {
        make: auction.inspections?.vehicle_make || "Unknown",
        model: auction.inspections?.vehicle_model || "Vehicle",
        variant: "",
        year: auction.inspections?.vehicle_year || 2023,
        kms: auction.inspections?.odometer_reading || 0,
        city: auction.geo_targeting_city || "Bangalore",
        grade: grade,
        thumbnail: "/placeholder.svg",
      },
      auctionType: auction.auction_type,
      timeRemaining: timeRemaining,
      endTime: endTime,
      currentHighestBid: auction.current_highest_bid || 0,
      bidCount: auction.bid_count || 0,
      matchScore: Math.floor(Math.random() * 20) + 75, // Random match score 75-95
      documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
      oemTrust: "high" as const,
    };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold">DriveX Broker</h1>
            <p className="text-sm opacity-90">{broker.city}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/broker/profile")}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Coins className="w-4 h-4" />
            <span className="font-semibold">{broker.coins_balance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Star className="w-4 h-4" />
            <span className="font-semibold">Level {broker.level}</span>
          </div>
          <Badge className={`${levelConfig.bgColor} text-white`}>
            {levelConfig.name}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-muted/50 border-b">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{liveAuctions.length + upcomingAuctions.length}</p>
            <p className="text-xs text-muted-foreground">Auctions Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{BROKER_STATS.winsThisMonth}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{BROKER_STATS.disputesThisMonth}</p>
            <p className="text-xs text-muted-foreground">Disputes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="live" className="gap-2">
            <Zap className="w-4 h-4" />
            Live ({liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="w-4 h-4" />
            Upcoming ({upcomingAuctions.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Badge variant="secondary" className="shrink-0 cursor-pointer hover:bg-secondary/80">
            All Cities
          </Badge>
          <Badge variant="secondary" className="shrink-0 cursor-pointer hover:bg-secondary/80">
            ₹20k-₹50k
          </Badge>
          <Badge variant="secondary" className="shrink-0 cursor-pointer hover:bg-secondary/80">
            Grade A-B
          </Badge>
        </div>

        <TabsContent value="live" className="space-y-4 mt-0">
          {loadingAuctions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : liveAuctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No live auctions at the moment</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : (
            liveAuctions.map((auction) => (
              <BrokerAuctionCard
                key={auction.id}
                auction={transformAuctionForCard(auction)}
                onClick={() => navigate(`/broker/auction/${auction.id}`)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-0">
          {loadingAuctions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : upcomingAuctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming auctions scheduled</p>
            </div>
          ) : (
            upcomingAuctions.map((auction) => {
              const startTime = new Date(auction.start_time);
              const timeUntilStart = startTime.getTime() - Date.now();
              
              return (
                <div
                  key={auction.id}
                  className="bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {}}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-20 bg-muted rounded-lg overflow-hidden">
                      <img
                        src="/placeholder.svg"
                        alt={auction.inspections?.vehicle_model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {auction.inspections?.vehicle_year} • {(auction.inspections?.odometer_reading || 0).toLocaleString()} km
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Starts in {formatTimeRemaining(timeUntilStart)}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {auction.geo_targeting_city}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Bell className="w-4 h-4 mr-2" />
                    Remind Me
                  </Button>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <BrokerBottomNav activeTab="home" />
    </div>
  );
};

export default BrokerDashboard;
