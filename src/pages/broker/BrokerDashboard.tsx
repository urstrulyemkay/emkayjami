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
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [liveAuctions, setLiveAuctions] = useState<AuctionWithInspection[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionWithInspection[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  // Auction type configuration
  const auctionTypes = [
    { id: "quick", label: "Quick", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { id: "flexible", label: "Flex", icon: Scale, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { id: "extended", label: "Extended", icon: Calendar, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { id: "one_click", label: "1-Click", icon: Target, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  // Filter auctions by type
  const getFilteredAuctions = (auctions: AuctionWithInspection[]) => {
    if (!activeTypeFilter) return auctions;
    return auctions.filter(a => a.auction_type === activeTypeFilter);
  };

  // Group auctions by type for display
  const groupAuctionsByType = (auctions: AuctionWithInspection[]) => {
    return auctionTypes.map(type => ({
      ...type,
      auctions: auctions.filter(a => a.auction_type === type.id)
    })).filter(group => group.auctions.length > 0);
  };

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
      {/* Header - Professional Dark */}
      <div className="broker-header text-white">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider mb-0.5">Welcome back</p>
              <h1 className="text-xl font-semibold">{broker.owner_name || broker.business_name}</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => navigate("/broker/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-medium">{broker.coins_balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Lvl {broker.level}</span>
            </div>
            <Badge className="bg-white/20 text-white border-0">
              {levelConfig.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats - Card Style */}
      <div className="px-4 -mt-3">
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{liveAuctions.length + upcomingAuctions.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Today</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">{BROKER_STATS.winsThisMonth}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Wins</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{BROKER_STATS.disputesThisMonth}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Disputes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-5 h-12 p-1 bg-muted rounded-xl">
          <TabsTrigger value="live" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live ({liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4" />
            Upcoming ({upcomingAuctions.length})
          </TabsTrigger>
        </TabsList>

        {/* Auction Type Filters */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4">
          <Button 
            variant={activeTypeFilter === null ? "default" : "outline"} 
            size="sm" 
            className="shrink-0 rounded-full h-8"
            onClick={() => setActiveTypeFilter(null)}
          >
            All
          </Button>
          {auctionTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activeTypeFilter === type.id;
            const count = (activeTab === "live" ? liveAuctions : upcomingAuctions)
              .filter(a => a.auction_type === type.id).length;
            
            return (
              <Button
                key={type.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`shrink-0 rounded-full h-8 gap-1.5 ${!isActive ? type.bgColor : ""}`}
                onClick={() => setActiveTypeFilter(isActive ? null : type.id)}
              >
                <Icon className={`w-3.5 h-3.5 ${!isActive ? type.color : ""}`} />
                {type.label}
                {count > 0 && (
                  <span className={`text-xs ${isActive ? "opacity-80" : "text-muted-foreground"}`}>
                    ({count})
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        <TabsContent value="live" className="space-y-6 mt-0">
          {loadingAuctions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : getFilteredAuctions(liveAuctions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {activeTypeFilter ? auctionTypes.find(t => t.id === activeTypeFilter)?.label : ""} auctions live</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : activeTypeFilter ? (
            // Filtered view - flat list
            <div className="space-y-3">
              {getFilteredAuctions(liveAuctions).map((auction) => (
                <BrokerAuctionCard
                  key={auction.id}
                  auction={transformAuctionForCard(auction)}
                  onClick={() => navigate(`/broker/auction/${auction.id}`)}
                />
              ))}
            </div>
          ) : (
            // Grouped view by auction type
            groupAuctionsByType(liveAuctions).map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${group.bgColor}`}>
                      <Icon className={`w-4 h-4 ${group.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{group.label} Auctions</h3>
                    <Badge variant="secondary" className="text-xs">{group.auctions.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.auctions.map((auction) => (
                      <BrokerAuctionCard
                        key={auction.id}
                        auction={transformAuctionForCard(auction)}
                        onClick={() => navigate(`/broker/auction/${auction.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6 mt-0">
          {loadingAuctions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : getFilteredAuctions(upcomingAuctions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {activeTypeFilter ? auctionTypes.find(t => t.id === activeTypeFilter)?.label : ""} upcoming auctions</p>
            </div>
          ) : activeTypeFilter ? (
            // Filtered view
            <div className="space-y-3">
              {getFilteredAuctions(upcomingAuctions).map((auction) => {
                const startTime = new Date(auction.start_time);
                const timeUntilStart = startTime.getTime() - Date.now();
                const typeConfig = auctionTypes.find(t => t.id === auction.auction_type);
                const TypeIcon = typeConfig?.icon || Clock;
                
                return (
                  <div
                    key={auction.id}
                    className="broker-card p-4"
                    onClick={() => {}}
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                        <img
                          src="/placeholder.svg"
                          alt={auction.inspections?.vehicle_model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {auction.inspections?.vehicle_year} • {(auction.inspections?.odometer_reading || 0).toLocaleString()} km
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(timeUntilStart)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {auction.geo_targeting_city}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-3 rounded-xl">
                      <Bell className="w-4 h-4 mr-2" />
                      Remind Me
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            // Grouped view
            groupAuctionsByType(upcomingAuctions).map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${group.bgColor}`}>
                      <Icon className={`w-4 h-4 ${group.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{group.label} Auctions</h3>
                    <Badge variant="secondary" className="text-xs">{group.auctions.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.auctions.map((auction) => {
                      const startTime = new Date(auction.start_time);
                      const timeUntilStart = startTime.getTime() - Date.now();
                      
                      return (
                        <div
                          key={auction.id}
                          className="broker-card p-4"
                          onClick={() => {}}
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                              <img
                                src="/placeholder.svg"
                                alt={auction.inspections?.vehicle_model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {auction.inspections?.vehicle_year} • {(auction.inspections?.odometer_reading || 0).toLocaleString()} km
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeRemaining(timeUntilStart)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {auction.geo_targeting_city}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-3 rounded-xl">
                            <Bell className="w-4 h-4 mr-2" />
                            Remind Me
                          </Button>
                        </div>
                      );
                    })}
                  </div>
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
