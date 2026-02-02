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

// Mock auction data for demo
const MOCK_AUCTIONS = [
  {
    id: "auction-1",
    vehicle: {
      make: "TVS",
      model: "Apache RTR 160",
      variant: "4V BS6",
      year: 2023,
      kms: 12450,
      city: "Bangalore",
      grade: "B",
      thumbnail: "/placeholder.svg",
    },
    auctionType: "quick",
    timeRemaining: 18 * 60 * 1000, // 18 minutes
    endTime: new Date(Date.now() + 18 * 60 * 1000),
    currentHighestBid: 36500,
    bidCount: 4,
    matchScore: 85,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
  {
    id: "auction-2",
    vehicle: {
      make: "Bajaj",
      model: "Pulsar NS200",
      variant: "ABS",
      year: 2022,
      kms: 18200,
      city: "Bangalore",
      grade: "A",
      thumbnail: "/placeholder.svg",
    },
    auctionType: "flexible",
    timeRemaining: 2.25 * 60 * 60 * 1000, // 2h 15m
    endTime: new Date(Date.now() + 2.25 * 60 * 60 * 1000),
    currentHighestBid: 52000,
    bidCount: 6,
    matchScore: 92,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
  {
    id: "auction-3",
    vehicle: {
      make: "Hero",
      model: "Splendor Plus",
      variant: "i3S",
      year: 2021,
      kms: 28500,
      city: "Bangalore",
      grade: "C",
      thumbnail: "/placeholder.svg",
    },
    auctionType: "extended",
    timeRemaining: 2 * 24 * 60 * 60 * 1000, // 2 days
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    currentHighestBid: 28000,
    bidCount: 8,
    matchScore: 70,
    documents: { rc: true, insurance: false, puc: true, challans: 2, loan: false },
    oemTrust: "medium",
  },
  {
    id: "auction-4",
    vehicle: {
      make: "Yamaha",
      model: "FZ-S V3",
      variant: "FI",
      year: 2023,
      kms: 8500,
      city: "Bangalore",
      grade: "A",
      thumbnail: "/placeholder.svg",
    },
    auctionType: "one_click",
    timeRemaining: 0,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    currentHighestBid: 0,
    bidCount: 0,
    matchScore: 95,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
];

const UPCOMING_AUCTIONS = [
  {
    id: "upcoming-1",
    vehicle: {
      make: "Royal Enfield",
      model: "Classic 350",
      variant: "Signals",
      year: 2022,
      kms: 15000,
      city: "Bangalore",
      grade: "B",
      thumbnail: "/placeholder.svg",
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    auctionType: "flexible",
    estimatedPrice: 125000,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
];

const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading, logout } = useBrokerAuth();
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/broker/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  const getLevelName = (level: number) => {
    const levels = ["New", "Active", "Preferred", "Trusted", "Elite"];
    return levels[Math.min(level - 1, 4)];
  };

  const getLevelColor = (level: number) => {
    const colors = ["bg-gray-500", "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-purple-500"];
    return colors[Math.min(level - 1, 4)];
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
          <Badge className={`${getLevelColor(broker.level)} text-white`}>
            {getLevelName(broker.level)}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 bg-muted/50 border-b">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Auctions Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">3</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">Disputes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="live" className="gap-2">
            <Zap className="w-4 h-4" />
            Live ({MOCK_AUCTIONS.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="w-4 h-4" />
            Upcoming ({UPCOMING_AUCTIONS.length})
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
          {MOCK_AUCTIONS.map((auction) => (
            <BrokerAuctionCard
              key={auction.id}
              auction={auction}
              onClick={() => navigate(`/broker/auction/${auction.id}`)}
            />
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-0">
          {UPCOMING_AUCTIONS.map((auction) => (
            <div
              key={auction.id}
              className="bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {}}
            >
              <div className="flex gap-4">
                <div className="w-24 h-20 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={auction.vehicle.thumbnail}
                    alt={auction.vehicle.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {auction.vehicle.make} {auction.vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {auction.vehicle.year} • {auction.vehicle.kms.toLocaleString()} km
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Starts in 2h
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Est. ₹{(auction.estimatedPrice / 1000).toFixed(0)}k
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                <Bell className="w-4 h-4 mr-2" />
                Remind Me
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <BrokerBottomNav activeTab="home" />
    </div>
  );
};

export default BrokerDashboard;
