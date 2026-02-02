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

// Reliable bike thumbnail URLs
const BIKE_THUMBNAILS: Record<string, string> = {
  "Honda": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
  "TVS": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=400&fit=crop&q=80",
  "Bajaj": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop&q=80",
  "Royal Enfield": "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=400&fit=crop&q=80",
  "Yamaha": "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=400&h=400&fit=crop&q=80",
  "Hero": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
  "Suzuki": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=400&fit=crop&q=80",
  "KTM": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=400&fit=crop&q=80",
  "default": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
};

// Model variants for common bikes
const BIKE_VARIANTS: Record<string, string> = {
  "Apache RTR 160": "4V BS6",
  "Pulsar NS200": "ABS",
  "Splendor Plus": "i3S",
  "FZ-S V3": "FI",
  "Classic 350": "Signals",
  "Activa 6G": "DLX",
  "Access 125": "SE",
  "Jupiter": "ZX",
  "Shine": "125 CBS",
};

// Extensive mock auctions - 40 live auctions
const MOCK_LIVE_AUCTIONS = [
  { id: "m1", make: "Honda", model: "Activa 6G", year: 2023, kms: 12450, city: "Bangalore", grade: "A", auctionType: "quick", bid: 42500, bidCount: 6, endMins: 8 },
  { id: "m2", make: "TVS", model: "Apache RTR 160", year: 2022, kms: 18200, city: "Mumbai", grade: "B", auctionType: "flexible", bid: 56000, bidCount: 8, endMins: 95 },
  { id: "m3", make: "Royal Enfield", model: "Classic 350", year: 2021, kms: 24500, city: "Delhi", grade: "B", auctionType: "extended", bid: 128000, bidCount: 12, endMins: 2880 },
  { id: "m4", make: "Bajaj", model: "Pulsar NS200", year: 2023, kms: 8500, city: "Chennai", grade: "A", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m5", make: "Yamaha", model: "FZ-S V3", year: 2022, kms: 15800, city: "Hyderabad", grade: "B", auctionType: "quick", bid: 48000, bidCount: 4, endMins: 12 },
  { id: "m6", make: "Hero", model: "Splendor Plus", year: 2021, kms: 32000, city: "Pune", grade: "C", auctionType: "flexible", bid: 28500, bidCount: 5, endMins: 180 },
  { id: "m7", make: "Honda", model: "Shine", year: 2023, kms: 9800, city: "Kolkata", grade: "A", auctionType: "quick", bid: 38000, bidCount: 7, endMins: 15 },
  { id: "m8", make: "Suzuki", model: "Access 125", year: 2022, kms: 14500, city: "Ahmedabad", grade: "B", auctionType: "flexible", bid: 42000, bidCount: 6, endMins: 120 },
  { id: "m9", make: "TVS", model: "Jupiter", year: 2021, kms: 28000, city: "Jaipur", grade: "C", auctionType: "extended", bid: 32000, bidCount: 9, endMins: 4320 },
  { id: "m10", make: "Bajaj", model: "Pulsar 150", year: 2022, kms: 22000, city: "Lucknow", grade: "B", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m11", make: "Yamaha", model: "R15 V4", year: 2023, kms: 5200, city: "Bangalore", grade: "A", auctionType: "quick", bid: 145000, bidCount: 11, endMins: 6 },
  { id: "m12", make: "KTM", model: "Duke 200", year: 2022, kms: 12800, city: "Mumbai", grade: "A", auctionType: "flexible", bid: 125000, bidCount: 8, endMins: 90 },
  { id: "m13", make: "Royal Enfield", model: "Hunter 350", year: 2023, kms: 8500, city: "Delhi", grade: "A", auctionType: "extended", bid: 142000, bidCount: 15, endMins: 1440 },
  { id: "m14", make: "Honda", model: "CB350", year: 2022, kms: 15000, city: "Chennai", grade: "B", auctionType: "flexible", bid: 165000, bidCount: 10, endMins: 150 },
  { id: "m15", make: "TVS", model: "Ntorq 125", year: 2023, kms: 7500, city: "Hyderabad", grade: "A", auctionType: "quick", bid: 68000, bidCount: 5, endMins: 22 },
  { id: "m16", make: "Hero", model: "Xpulse 200", year: 2022, kms: 18000, city: "Pune", grade: "B", auctionType: "extended", bid: 98000, bidCount: 7, endMins: 2160 },
  { id: "m17", make: "Suzuki", model: "Gixxer 150", year: 2021, kms: 25000, city: "Kolkata", grade: "C", auctionType: "flexible", bid: 72000, bidCount: 6, endMins: 240 },
  { id: "m18", make: "Bajaj", model: "Dominar 400", year: 2022, kms: 12000, city: "Ahmedabad", grade: "A", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m19", make: "Yamaha", model: "MT-15", year: 2023, kms: 6500, city: "Jaipur", grade: "A", auctionType: "quick", bid: 138000, bidCount: 9, endMins: 18 },
  { id: "m20", make: "Honda", model: "Unicorn", year: 2022, kms: 19000, city: "Lucknow", grade: "B", auctionType: "flexible", bid: 75000, bidCount: 5, endMins: 105 },
  { id: "m21", make: "TVS", model: "Raider 125", year: 2023, kms: 4500, city: "Bangalore", grade: "A", auctionType: "quick", bid: 82000, bidCount: 4, endMins: 9 },
  { id: "m22", make: "Royal Enfield", model: "Meteor 350", year: 2022, kms: 16000, city: "Mumbai", grade: "B", auctionType: "extended", bid: 168000, bidCount: 14, endMins: 3600 },
  { id: "m23", make: "Bajaj", model: "CT 125X", year: 2021, kms: 35000, city: "Delhi", grade: "C", auctionType: "flexible", bid: 45000, bidCount: 6, endMins: 200 },
  { id: "m24", make: "Hero", model: "Glamour", year: 2022, kms: 21000, city: "Chennai", grade: "B", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m25", make: "Suzuki", model: "Burgman Street", year: 2023, kms: 8000, city: "Hyderabad", grade: "A", auctionType: "quick", bid: 95000, bidCount: 7, endMins: 14 },
  { id: "m26", make: "KTM", model: "Duke 390", year: 2022, kms: 11000, city: "Pune", grade: "A", auctionType: "flexible", bid: 245000, bidCount: 12, endMins: 130 },
  { id: "m27", make: "Yamaha", model: "Fascino 125", year: 2023, kms: 6000, city: "Kolkata", grade: "A", auctionType: "extended", bid: 72000, bidCount: 8, endMins: 1800 },
  { id: "m28", make: "Honda", model: "SP 125", year: 2022, kms: 17000, city: "Ahmedabad", grade: "B", auctionType: "quick", bid: 65000, bidCount: 5, endMins: 25 },
  { id: "m29", make: "TVS", model: "Star City+", year: 2021, kms: 42000, city: "Jaipur", grade: "C", auctionType: "flexible", bid: 38000, bidCount: 4, endMins: 160 },
  { id: "m30", make: "Royal Enfield", model: "Bullet 350", year: 2020, kms: 32000, city: "Lucknow", grade: "C", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m31", make: "Hero", model: "Passion Pro", year: 2022, kms: 24000, city: "Bangalore", grade: "B", auctionType: "quick", bid: 52000, bidCount: 6, endMins: 11 },
  { id: "m32", make: "Bajaj", model: "Pulsar RS200", year: 2021, kms: 19000, city: "Mumbai", grade: "B", auctionType: "extended", bid: 115000, bidCount: 9, endMins: 2520 },
  { id: "m33", make: "Suzuki", model: "Avenis", year: 2023, kms: 5500, city: "Delhi", grade: "A", auctionType: "flexible", bid: 88000, bidCount: 7, endMins: 85 },
  { id: "m34", make: "KTM", model: "RC 200", year: 2022, kms: 14000, city: "Chennai", grade: "B", auctionType: "quick", bid: 142000, bidCount: 8, endMins: 19 },
  { id: "m35", make: "Honda", model: "Hornet 2.0", year: 2023, kms: 7800, city: "Hyderabad", grade: "A", auctionType: "one_click", bid: 0, bidCount: 0, endMins: 1440 },
  { id: "m36", make: "TVS", model: "Apache RTR 200", year: 2022, kms: 16500, city: "Pune", grade: "B", auctionType: "extended", bid: 108000, bidCount: 10, endMins: 1920 },
  { id: "m37", make: "Yamaha", model: "Ray ZR 125", year: 2023, kms: 4200, city: "Kolkata", grade: "A", auctionType: "flexible", bid: 78000, bidCount: 5, endMins: 140 },
  { id: "m38", make: "Hero", model: "Destini 125", year: 2022, kms: 20000, city: "Ahmedabad", grade: "B", auctionType: "quick", bid: 58000, bidCount: 4, endMins: 7 },
  { id: "m39", make: "Royal Enfield", model: "Continental GT", year: 2021, kms: 12500, city: "Jaipur", grade: "A", auctionType: "flexible", bid: 265000, bidCount: 11, endMins: 110 },
  { id: "m40", make: "Bajaj", model: "Platina 110", year: 2020, kms: 48000, city: "Lucknow", grade: "D", auctionType: "extended", bid: 28000, bidCount: 3, endMins: 4800 },
];

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

  // Transform mock auctions for the card component
  const transformMockAuctionForCard = (mock: typeof MOCK_LIVE_AUCTIONS[0]) => {
    const endTime = new Date(Date.now() + mock.endMins * 60 * 1000);
    const timeRemaining = mock.endMins * 60 * 1000;

    return {
      id: mock.id,
      vehicle: {
        make: mock.make,
        model: mock.model,
        variant: BIKE_VARIANTS[mock.model] || "",
        year: mock.year,
        kms: mock.kms,
        city: mock.city,
        grade: mock.grade,
        thumbnail: BIKE_THUMBNAILS[mock.make] || BIKE_THUMBNAILS["default"],
      },
      auctionType: mock.auctionType,
      timeRemaining: timeRemaining,
      endTime: endTime,
      currentHighestBid: mock.bid,
      bidCount: mock.bidCount,
      matchScore: Math.floor(Math.random() * 20) + 75,
      documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
      oemTrust: "high" as const,
    };
  };

  // Transform DB auctions for the card component
  const transformAuctionForCard = (auction: AuctionWithInspection) => {
    const endTime = new Date(auction.end_time);
    const timeRemaining = Math.max(0, endTime.getTime() - Date.now());
    const grade = getGradeFromScore(auction.inspections?.condition_score);
    const make = auction.inspections?.vehicle_make || "Honda";
    const model = auction.inspections?.vehicle_model || "Activa 6G";

    return {
      id: auction.id,
      vehicle: {
        make: make,
        model: model,
        variant: BIKE_VARIANTS[model] || "",
        year: auction.inspections?.vehicle_year || 2023,
        kms: auction.inspections?.odometer_reading || 12500,
        city: auction.geo_targeting_city || "Bangalore",
        grade: grade,
        thumbnail: BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"],
      },
      auctionType: auction.auction_type,
      timeRemaining: timeRemaining,
      endTime: endTime,
      currentHighestBid: auction.current_highest_bid || 35000,
      bidCount: auction.bid_count || 4,
      matchScore: Math.floor(Math.random() * 20) + 75,
      documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
      oemTrust: "high" as const,
    };
  };

  // Use mock data when database is empty
  const displayLiveAuctions = liveAuctions.length > 0 ? liveAuctions : [];
  const displayUpcomingAuctions = upcomingAuctions.length > 0 ? upcomingAuctions : [];
  const useMockData = liveAuctions.length === 0 && upcomingAuctions.length === 0 && !loadingAuctions;

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
                {useMockData ? MOCK_LIVE_AUCTIONS.length + MOCK_UPCOMING_AUCTIONS.length : liveAuctions.length + upcomingAuctions.length}
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
            Live ({useMockData ? MOCK_LIVE_AUCTIONS.length : liveAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4" />
            Upcoming ({useMockData ? MOCK_UPCOMING_AUCTIONS.length : upcomingAuctions.length})
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
            // Show mock data when database is empty
            <div className="space-y-3">
              {MOCK_LIVE_AUCTIONS.filter(m => !activeTypeFilter || m.auctionType === activeTypeFilter).map((mock) => (
                <BrokerAuctionCard
                  key={mock.id}
                  auction={transformMockAuctionForCard(mock)}
                  onClick={() => navigate(`/broker/auction/${mock.id}`)}
                />
              ))}
            </div>
          ) : getFilteredAuctions(displayLiveAuctions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gavel className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {activeTypeFilter ? auctionTypes.find(t => t.id === activeTypeFilter)?.label : ""} auctions live</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : activeTypeFilter ? (
            // Filtered view - flat list
            <div className="space-y-3">
              {getFilteredAuctions(displayLiveAuctions).map((auction) => (
                <BrokerAuctionCard
                  key={auction.id}
                  auction={transformAuctionForCard(auction)}
                  onClick={() => navigate(`/broker/auction/${auction.id}`)}
                />
              ))}
            </div>
          ) : (
            // Grouped view by auction type
            groupAuctionsByType(displayLiveAuctions).map((group) => {
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
            // Show mock upcoming data
            <div className="space-y-3">
              {MOCK_UPCOMING_AUCTIONS.filter(m => !activeTypeFilter || m.auctionType === activeTypeFilter).map((mock) => {
                const startTime = new Date(Date.now() + mock.startMins * 60 * 1000);
                const timeUntilStart = mock.startMins * 60 * 1000;
                const typeConfig = auctionTypes.find(t => t.id === mock.auctionType);
                const TypeIcon = typeConfig?.icon || Clock;
                
                return (
                  <div
                    key={mock.id}
                    className="broker-card p-4"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                        <img
                          src={BIKE_THUMBNAILS[mock.make] || BIKE_THUMBNAILS["default"]}
                          alt={mock.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {mock.make} {mock.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {mock.year} • {mock.kms.toLocaleString()} km
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeRemaining(timeUntilStart)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {mock.city}
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
          ) : getFilteredAuctions(displayUpcomingAuctions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {activeTypeFilter ? auctionTypes.find(t => t.id === activeTypeFilter)?.label : ""} upcoming auctions</p>
            </div>
          ) : activeTypeFilter ? (
            // Filtered view
            <div className="space-y-3">
              {getFilteredAuctions(displayUpcomingAuctions).map((auction) => {
                const startTime = new Date(auction.start_time);
                const timeUntilStart = startTime.getTime() - Date.now();
                const typeConfig = auctionTypes.find(t => t.id === auction.auction_type);
                const TypeIcon = typeConfig?.icon || Clock;
                const make = auction.inspections?.vehicle_make || "Honda";
                const model = auction.inspections?.vehicle_model || "Activa 6G";
                
                return (
                  <div
                    key={auction.id}
                    className="broker-card p-4"
                    onClick={() => {}}
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-20 bg-muted rounded-xl overflow-hidden">
                        <img
                          src={BIKE_THUMBNAILS[make] || BIKE_THUMBNAILS["default"]}
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
