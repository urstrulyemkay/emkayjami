import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  Coins, Star, TrendingUp, Gavel, Clock, MapPin, 
  Filter, Bell, User, LogOut, Zap, Scale, Calendar, Target,
  Shield, ChevronRight, Gift, Award, AlertTriangle, Check
} from "lucide-react";
import BrokerAuctionCard from "@/components/broker/BrokerAuctionCard";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import {
  BROKER_STATS,
  getLevelFromScore,
  formatTimeRemaining,
  LEVELS,
  getProgressToNextLevel,
} from "@/data/brokerMockData";
import { MOCK_AUCTIONS, getVehicleImage, getAuctionById } from "@/data/mockAuctions";

// 20 upcoming auctions
const MOCK_UPCOMING_AUCTIONS = [
  { id: "u1", make: "Suzuki", model: "Access 125", year: 2023, kms: 5200, city: "Bangalore", grade: "A", auctionType: "quick", startMins: 45 },
  { id: "u2", make: "TVS", model: "Jupiter", year: 2022, kms: 18900, city: "Hyderabad", grade: "B", auctionType: "flexible", startMins: 120 },
  { id: "u3", make: "Honda", model: "Shine", year: 2023, kms: 9800, city: "Pune", grade: "A", auctionType: "one_click", startMins: 240 },
  { id: "u4", make: "Yamaha", model: "FZ-S V3", year: 2022, kms: 14500, city: "Mumbai", grade: "B", auctionType: "quick", startMins: 60 },
  { id: "u5", make: "Royal Enfield", model: "Classic 350", year: 2021, kms: 22000, city: "Delhi", grade: "B", auctionType: "extended", startMins: 180 },
  { id: "u6", make: "Bajaj", model: "Pulsar NS200", year: 2023, kms: 6500, city: "Chennai", grade: "A", auctionType: "flexible", startMins: 90 },
  { id: "u7", make: "Hero", model: "Xpulse 200", year: 2022, kms: 12000, city: "Kolkata", grade: "B", auctionType: "quick", startMins: 30 },
  { id: "u8", make: "KTM", model: "Duke 250", year: 2023, kms: 4800, city: "Ahmedabad", grade: "A", auctionType: "one_click", startMins: 300 },
  { id: "u9", make: "TVS", model: "Ntorq 125", year: 2022, kms: 16000, city: "Jaipur", grade: "B", auctionType: "flexible", startMins: 150 },
  { id: "u10", make: "Honda", model: "Activa 125", year: 2023, kms: 7200, city: "Lucknow", grade: "A", auctionType: "quick", startMins: 75 },
  { id: "u11", make: "Yamaha", model: "MT-15", year: 2022, kms: 11000, city: "Bangalore", grade: "A", auctionType: "extended", startMins: 360 },
  { id: "u12", make: "Suzuki", model: "Gixxer SF", year: 2023, kms: 5500, city: "Mumbai", grade: "A", auctionType: "flexible", startMins: 200 },
  { id: "u13", make: "Royal Enfield", model: "Hunter 350", year: 2023, kms: 3800, city: "Delhi", grade: "A", auctionType: "one_click", startMins: 420 },
  { id: "u14", make: "Bajaj", model: "Dominar 400", year: 2022, kms: 9500, city: "Chennai", grade: "B", auctionType: "quick", startMins: 55 },
  { id: "u15", make: "Hero", model: "Xtreme 160R", year: 2023, kms: 6800, city: "Hyderabad", grade: "A", auctionType: "flexible", startMins: 135 },
  { id: "u16", make: "KTM", model: "RC 390", year: 2022, kms: 8200, city: "Pune", grade: "A", auctionType: "extended", startMins: 480 },
  { id: "u17", make: "TVS", model: "Apache RTR 200", year: 2023, kms: 4500, city: "Kolkata", grade: "A", auctionType: "quick", startMins: 40 },
  { id: "u18", make: "Honda", model: "CB350", year: 2022, kms: 13500, city: "Ahmedabad", grade: "B", auctionType: "one_click", startMins: 540 },
  { id: "u19", make: "Yamaha", model: "R15 V4", year: 2023, kms: 3200, city: "Jaipur", grade: "A", auctionType: "flexible", startMins: 165 },
  { id: "u20", make: "Royal Enfield", model: "Interceptor", year: 2021, kms: 18000, city: "Lucknow", grade: "B", auctionType: "extended", startMins: 600 },
];

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
  } | null;
}

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeTab, setActiveTab] = useState("live");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [liveAuctions, setLiveAuctions] = useState<AuctionWithInspection[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionWithInspection[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  
  // Educational sheets state
  const [coinsSheetOpen, setCoinsSheetOpen] = useState(false);
  const [levelSheetOpen, setLevelSheetOpen] = useState(false);
  const [trustSheetOpen, setTrustSheetOpen] = useState(false);

  // Auction type configuration
  const auctionTypes = [
    { id: "quick", label: "Quick", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { id: "flexible", label: "Flex", icon: Scale, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { id: "extended", label: "Extended", icon: Calendar, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { id: "one_click", label: "1-Click", icon: Target, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  // Filter auctions by type and exclude expired ones
  const getFilteredAuctions = (auctions: AuctionWithInspection[]) => {
    const now = Date.now();
    let filtered = auctions.filter(a => new Date(a.end_time).getTime() > now);
    if (activeTypeFilter) {
      filtered = filtered.filter(a => a.auction_type === activeTypeFilter);
    }
    return filtered;
  };

  // Group auctions by type for display (excluding expired)
  const groupAuctionsByType = (auctions: AuctionWithInspection[]) => {
    const now = Date.now();
    const activeAuctions = auctions.filter(a => new Date(a.end_time).getTime() > now);
    return auctionTypes.map(type => ({
      ...type,
      auctions: activeAuctions.filter(a => a.auction_type === type.id)
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
        // Fetch live auctions - use LEFT JOIN (no !inner) to get auctions even if inspections are blocked by RLS
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
          console.log("Live auctions fetched:", liveData);
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
          console.log("Upcoming auctions fetched:", upcomingData);
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
  const nextLevel = LEVELS[broker.level] || LEVELS[LEVELS.length - 1];
  const progressToNext = getProgressToNextLevel(broker.trust_score, broker.level);
  // Helper to get grade from condition score
  const getGradeFromScore = (score: number | null): string => {
    if (!score) return "C";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "E";
  };

  // Transform centralized mock auctions for the card component
  const transformMockAuction = (mock: typeof MOCK_AUCTIONS[0]) => {
    return {
      id: mock.id,
      vehicle: {
        make: mock.vehicle.make,
        model: mock.vehicle.model,
        variant: mock.vehicle.variant,
        year: mock.vehicle.year,
        kms: mock.vehicle.kms,
        city: mock.vehicle.city,
        grade: mock.vehicle.grade,
        thumbnail: mock.thumbnail,
      },
      auctionType: mock.auctionType,
      timeRemaining: mock.timeRemaining,
      endTime: mock.endTime,
      currentHighestBid: mock.currentHighestBid,
      bidCount: mock.bidCount,
      matchScore: mock.matchScore,
      documents: mock.documents,
      oemTrust: "high" as const,
    };
  };

  // Transform DB auctions for the card component - hydrate from centralized mock if inspection is null/blocked
  const transformAuctionForCard = (auction: AuctionWithInspection) => {
    const endTime = new Date(auction.end_time);
    const timeRemaining = Math.max(0, endTime.getTime() - Date.now());
    
    // Get centralized mock data for this auction ID to fill in missing inspection data
    // getAuctionById handles ID-based hashing for consistent mock data even for unknown UUIDs
    const mockAuction = getAuctionById(auction.id) || MOCK_AUCTIONS[0];
    
    // Check if DB has complete inspection data - must match PDP logic exactly
    // RLS often blocks brokers from reading inspection details
    const hasCompleteDbInspection = 
      auction.inspections && 
      auction.inspections.vehicle_make && 
      auction.inspections.vehicle_model;
    
    // Use mock data when DB inspection is incomplete - ensures consistency with PDP
    const make = hasCompleteDbInspection ? auction.inspections!.vehicle_make : mockAuction.vehicle.make;
    const model = hasCompleteDbInspection ? auction.inspections!.vehicle_model : mockAuction.vehicle.model;
    const year = hasCompleteDbInspection && auction.inspections!.vehicle_year ? auction.inspections!.vehicle_year : mockAuction.vehicle.year;
    const kms = hasCompleteDbInspection && auction.inspections!.odometer_reading ? auction.inspections!.odometer_reading : mockAuction.vehicle.kms;
    const conditionScore = hasCompleteDbInspection && auction.inspections!.condition_score ? auction.inspections!.condition_score : mockAuction.conditionScore;
    const grade = getGradeFromScore(conditionScore);

    return {
      id: auction.id,
      vehicle: {
        make: make,
        model: model,
        variant: mockAuction.vehicle.variant,
        year: year,
        kms: kms,
        city: auction.geo_targeting_city || mockAuction.vehicle.city,
        grade: grade,
        thumbnail: getVehicleImage(make, auction.id),
      },
      auctionType: auction.auction_type,
      timeRemaining: timeRemaining,
      endTime: endTime,
      currentHighestBid: auction.current_highest_bid || mockAuction.currentHighestBid,
      bidCount: auction.bid_count || mockAuction.bidCount,
      matchScore: mockAuction.matchScore,
      documents: mockAuction.documents,
      oemTrust: "high" as const,
    };
  };

  // Use 100 mock auctions when database is empty
  const useMockData = liveAuctions.length === 0 && !loadingAuctions;
  const mockAuctionsForDisplay = useMockData ? MOCK_AUCTIONS : [];

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

          {/* Stats Row - Interactive */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button 
              onClick={() => setCoinsSheetOpen(true)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 hover:bg-white/20 transition-colors active:scale-95 shrink-0"
            >
              <Coins className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium whitespace-nowrap">{broker.coins_balance.toLocaleString()}</span>
              <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
            </button>
            <button 
              onClick={() => setLevelSheetOpen(true)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 hover:bg-white/20 transition-colors active:scale-95 shrink-0"
            >
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium whitespace-nowrap">Lvl {broker.level}</span>
              <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
            </button>
            <button 
              onClick={() => setTrustSheetOpen(true)}
              className="hover:opacity-80 transition-opacity active:scale-95 shrink-0"
            >
              <Badge className="bg-white/20 text-white border-0 gap-1 whitespace-nowrap">
                {levelConfig.name}
                <ChevronRight className="w-3 h-3" />
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Card Style */}
      <div className="px-4 -mt-3">
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {useMockData ? mockAuctionsForDisplay.length : liveAuctions.length + upcomingAuctions.length}
              </p>
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
            Live ({useMockData ? mockAuctionsForDisplay.filter(a => a.auctionType !== "one_click").length : liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4" />
            Upcoming ({useMockData ? mockAuctionsForDisplay.filter(a => a.auctionType === "one_click").length : upcomingAuctions.length})
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
          ) : useMockData ? (
            // Show 100 mock vehicles when database is empty
            <div className="space-y-3">
              {mockAuctionsForDisplay
                .filter(m => m.auctionType !== "one_click")
                .filter(m => !activeTypeFilter || m.auctionType === activeTypeFilter)
                .map((mock) => (
                  <BrokerAuctionCard
                    key={mock.id}
                    auction={transformMockAuction(mock)}
                    onClick={() => navigate(`/broker/auction/${mock.id}`)}
                  />
                ))}
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
          ) : useMockData ? (
            // Show mock upcoming data (one_click auctions as upcoming)
            <div className="space-y-3">
              {mockAuctionsForDisplay
                .filter(m => m.auctionType === "one_click")
                .filter(m => !activeTypeFilter || m.auctionType === activeTypeFilter)
                .map((mock) => {
                  return (
                    <div
                      key={mock.id}
                      className="broker-card p-4"
                      onClick={() => navigate(`/broker/auction/${mock.id}`)}
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                          <img
                            src={mock.thumbnail}
                            alt={mock.vehicle.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {mock.vehicle.make} {mock.vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {mock.vehicle.year} • {mock.vehicle.kms.toLocaleString()} km
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeRemaining(mock.timeRemaining)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {mock.vehicle.city}
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
                const make = auction.inspections?.vehicle_make || "Honda";
                const model = auction.inspections?.vehicle_model || "Activa 6G";
                
                return (
                  <div
                    key={auction.id}
                    className="broker-card p-4"
                    onClick={() => navigate(`/broker/auction/${auction.id}`)}
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                        <img
                          src={getVehicleImage(make, auction.id)}
                          alt={model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {make} {model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {auction.inspections?.vehicle_year || 2023} • {(auction.inspections?.odometer_reading || 12500).toLocaleString()} km
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(timeUntilStart)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {auction.geo_targeting_city || "Bangalore"}
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
          ) : upcomingAuctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming auctions</p>
            </div>
          ) : (
            // Grouped view from database
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
                      const make = auction.inspections?.vehicle_make || "Honda";
                      const model = auction.inspections?.vehicle_model || "Activa 6G";
                      
                      return (
                        <div
                          key={auction.id}
                          className="broker-card p-4"
                          onClick={() => navigate(`/broker/auction/${auction.id}`)}
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                              <img
                                src={getVehicleImage(make, auction.id)}
                                alt={model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {make} {model}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {auction.inspections?.vehicle_year || 2023} • {(auction.inspections?.odometer_reading || 12500).toLocaleString()} km
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeRemaining(timeUntilStart)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {auction.geo_targeting_city || "Bangalore"}
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

      {/* Coins Education Sheet */}
      <Sheet open={coinsSheetOpen} onOpenChange={setCoinsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
              <Coins className="w-6 h-6 text-amber-500" />
            </div>
            <SheetTitle className="text-xl">Coins Balance</SheetTitle>
            <SheetDescription>
              Earn and spend coins to unlock rewards and boost your bids
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 pb-6">
            {/* Current Balance */}
            <div className="bg-amber-500/10 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{broker.coins_balance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Available Coins</p>
            </div>

            {/* How to Earn */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent" />
                How to Earn Coins
              </h4>
              <div className="space-y-2">
                {[
                  { action: "Win an auction", coins: "+50" },
                  { action: "Complete RC transfer on time", coins: "+100" },
                  { action: "First bid of the day", coins: "+10" },
                  { action: "Refer a broker", coins: "+500" },
                  { action: "Perfect month (no strikes)", coins: "+200" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm">{item.action}</span>
                    <Badge variant="secondary" className="text-accent">{item.coins}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Spend */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                How to Spend Coins
              </h4>
              <div className="space-y-2">
                {[
                  { action: "Boost bid visibility", coins: "-25" },
                  { action: "Extend bidding time", coins: "-50" },
                  { action: "Priority support ticket", coins: "-100" },
                  { action: "Featured broker badge", coins: "-200" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <span className="text-sm">{item.action}</span>
                    <Badge variant="outline">{item.coins}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={() => navigate("/broker/wallet")}>
              Go to Wallet
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Level Education Sheet */}
      <Sheet open={levelSheetOpen} onOpenChange={setLevelSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <SheetTitle className="text-xl">Level System</SheetTitle>
            <SheetDescription>
              Level up to unlock more benefits and higher limits
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 pb-6">
            {/* Current Level */}
            <div className={`${levelConfig.bgColor} text-white rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm opacity-80">Current Level</p>
                  <p className="text-2xl font-bold">Level {broker.level} – {levelConfig.name}</p>
                </div>
                <Award className="w-10 h-10 opacity-80" />
              </div>
              {broker.level < 5 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Progress to Level {broker.level + 1}</span>
                    <span>{Math.round(progressToNext)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-2 bg-white/20" />
                </div>
              )}
            </div>

            {/* All Levels with Requirements */}
            <div>
              <h4 className="font-semibold mb-3">Level Progression</h4>
              <div className="space-y-3">
                {LEVELS.map((level, index) => {
                  const isCurrentLevel = broker.level === level.level;
                  const isNextLevel = broker.level + 1 === level.level;
                  const isPastLevel = broker.level > level.level;
                  
                  return (
                    <div 
                      key={level.level} 
                      className={`p-4 rounded-xl border ${
                        isCurrentLevel ? 'border-primary bg-primary/5' : 
                        isNextLevel ? 'border-warning/50 bg-warning/5' :
                        'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${level.bgColor} flex items-center justify-center text-white font-bold`}>
                            {level.level}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{level.name}</p>
                            <p className="text-xs text-muted-foreground">Score: {level.minScore}–{level.maxScore}</p>
                          </div>
                        </div>
                        {isCurrentLevel && (
                          <Badge className="bg-primary">Current</Badge>
                        )}
                        {isNextLevel && (
                          <Badge variant="outline" className="text-warning border-warning/50">Next</Badge>
                        )}
                        {isPastLevel && (
                          <Check className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      
                      {/* Benefits */}
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {level.benefits.map((benefit, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* How to Reach - Show for current and next levels */}
                      {(isCurrentLevel || isNextLevel) && level.howToReach && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-foreground mb-1">
                            {isCurrentLevel ? "🎯 To reach next level:" : "🚀 How to reach:"}
                          </p>
                          <p className="text-xs text-muted-foreground">{level.howToReach}</p>
                          {level.requirements && (
                            <ul className="mt-2 space-y-1">
                              {level.requirements.map((req, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Button className="w-full" onClick={() => navigate("/broker/profile")}>
              View Full Profile
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Trust Score Education Sheet */}
      <Sheet open={trustSheetOpen} onOpenChange={setTrustSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <SheetTitle className="text-xl">Trust Score</SheetTitle>
            <SheetDescription>
              Your trust score determines your level and unlocks benefits
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 pb-6">
            {/* Current Score */}
            <div className="bg-accent/10 rounded-2xl p-4 text-center">
              <p className="text-4xl font-bold text-accent">{broker.trust_score}</p>
              <p className="text-sm text-muted-foreground">out of 100</p>
              <Badge className={`${levelConfig.bgColor} text-white mt-2`}>
                {levelConfig.name}
              </Badge>
            </div>

            {/* What Affects Score */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                What Affects Your Score
              </h4>
              <div className="space-y-2">
                {[
                  { factor: "Completion ratio", impact: "High", desc: "Complete deals you win" },
                  { factor: "RC compliance", impact: "High", desc: "Transfer RC on time" },
                  { factor: "Dispute rate", impact: "Medium", desc: "Avoid disputes" },
                  { factor: "Payment timeliness", impact: "Medium", desc: "Pay on time" },
                  { factor: "Participation", impact: "Low", desc: "Bid regularly" },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.factor}</span>
                      <Badge variant={item.impact === "High" ? "default" : item.impact === "Medium" ? "secondary" : "outline"} className="text-xs">
                        {item.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="bg-destructive/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-destructive">Avoid These</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Late RC transfers (-10 to -20 points)</li>
                <li>• Dispute losses (-15 points)</li>
                <li>• Payment delays (-5 points)</li>
                <li>• Account strikes (-25 points each)</li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => navigate("/broker/profile")}>
              View Detailed Breakdown
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BrokerDashboard;
