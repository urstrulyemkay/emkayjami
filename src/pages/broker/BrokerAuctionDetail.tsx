import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, MapPin, Clock, Zap, Check, AlertTriangle,
  Play, Image as ImageIcon, Info, Heart, Shield, Bike, Mic,
  Share2, TrendingUp, Scale, Calendar, Target, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useRealtimeBids } from "@/hooks/useRealtimeBids";
import LiveBidFeed from "@/components/broker/LiveBidFeed";
import { calculateEffectiveScore } from "@/data/brokerMockData";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";
import { getAuctionById, getVehicleGallery, generateMockDefects, getDistanceBetweenCities, getLocalityForCity } from "@/data/mockAuctions";
import { maskRegistration } from "@/lib/maskRegistration";

interface CapturedImage {
  id: string;
  uri: string;
  angle: string;
  captured_at: string;
}

interface CapturedVideo {
  id: string;
  uri: string;
  video_type: string;
  duration: number;
  captured_at: string;
}

interface Defect {
  id: string;
  category: string;
  severity: string;
  description: string;
  extracted_from: string;
  confidence: number | null;
}

interface VoiceRecording {
  id: string;
  category: string;
  transcript: string;
  duration: number;
}

interface AuctionData {
  id: string;
  auction_type: string;
  status: string;
  start_time: string;
  end_time: string;
  current_highest_bid: number | null;
  current_highest_commission: number | null;
  bid_count: number | null;
  minimum_bid_increment: number | null;
  geo_targeting_city: string | null;
  inspections: {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number | null;
    odometer_reading: number | null;
    vehicle_color: string | null;
    condition_score: number | null;
    vehicle_registration: string | null;
    engine_cc: number | null;
    vehicle_vin: string | null;
    ai_confidence: number | null;
    created_at: string;
    consented_at: string | null;
    captured_images: CapturedImage[];
    captured_videos: CapturedVideo[];
    defects: Defect[];
    voice_recordings: VoiceRecording[];
  } | null;
}

// Convert centralized mock auction to PDP format
const convertMockToPDPFormat = (mock: ReturnType<typeof getAuctionById>, id: string): AuctionData => {
  if (!mock) {
    // Fallback for undefined
    return {
      id,
      auction_type: "quick",
      status: "live",
      start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      current_highest_bid: 50000,
      current_highest_commission: 2000,
      bid_count: 5,
      minimum_bid_increment: 500,
      geo_targeting_city: "Bangalore",
      inspections: {
        id: `insp-${id}`,
        vehicle_make: "Honda",
        vehicle_model: "Activa 6G",
        vehicle_year: 2023,
        odometer_reading: 12000,
        vehicle_color: "White",
        condition_score: 80,
        vehicle_registration: "KA-01-AB-1234",
        engine_cc: 110,
        vehicle_vin: "VIN123456789",
        ai_confidence: 90,
        created_at: new Date().toISOString(),
        consented_at: new Date().toISOString(),
        captured_images: getVehicleGallery("Honda", id),
        captured_videos: [],
        defects: generateMockDefects(id),
        voice_recordings: [],
      },
    };
  }

  return {
    id,
    auction_type: mock.auctionType,
    status: "live",
    start_time: mock.startTime.toISOString(),
    end_time: mock.endTime.toISOString(),
    current_highest_bid: mock.currentHighestBid,
    current_highest_commission: mock.currentHighestCommission,
    bid_count: mock.bidCount,
    minimum_bid_increment: mock.minimumBidIncrement,
    geo_targeting_city: mock.vehicle.city,
    inspections: {
      id: `insp-${id}`,
      vehicle_make: mock.vehicle.make,
      vehicle_model: mock.vehicle.model,
      vehicle_year: mock.vehicle.year,
      odometer_reading: mock.vehicle.kms,
      vehicle_color: mock.vehicle.color,
      condition_score: mock.conditionScore,
      vehicle_registration: mock.vehicle.registration,
      engine_cc: mock.vehicle.engineCC,
      vehicle_vin: mock.vehicle.vin,
      ai_confidence: 88 + (id.charCodeAt(0) % 10),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      captured_images: getVehicleGallery(mock.vehicle.make, id),
      captured_videos: [],
      defects: generateMockDefects(id),
      voice_recordings: [
        {
          id: `vr-${id}`,
          category: "overall",
          transcript: `Vehicle is in ${mock.conditionScore >= 80 ? "excellent" : mock.conditionScore >= 60 ? "good" : "fair"} condition. ${mock.vehicle.make} ${mock.vehicle.model} with ${mock.vehicle.kms.toLocaleString()} km on the odometer.`,
          duration: 12,
        },
      ],
    },
  };
};

const BrokerAuctionDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { broker, isAuthenticated } = useBrokerAuth();
  const { toast } = useToast();

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidSheetOpen, setBidSheetOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [commission, setCommission] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image viewer state
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Sound notifications
  const { playSound } = useSoundNotifications();
  // Real-time bids hook
  const {
    currentHighestBid,
    currentHighestCommission,
    bidCount,
    bids,
    myBid,
    isWinning,
    wasOutbid,
    placeBid,
    clearOutbid,
    loading: bidsLoading,
  } = useRealtimeBids(slug || "", broker?.id);

  // Show toast when outbid
  useEffect(() => {
    if (wasOutbid) {
      toast({
        title: "⚠️ You've been outbid!",
        description: `Current highest bid is now ₹${currentHighestBid.toLocaleString()}. Place a higher bid to win.`,
        variant: "destructive",
      });
      clearOutbid();
    }
  }, [wasOutbid, currentHighestBid, toast, clearOutbid]);

  // Fetch auction details
  useEffect(() => {
    const fetchAuction = async () => {
      if (!slug) return;

      // Try fetching from database first
      const { data, error } = await supabase
        .from("auctions")
        .select(`
          id, auction_type, status, start_time, end_time,
          current_highest_bid, current_highest_commission, bid_count,
          minimum_bid_increment, geo_targeting_city,
          inspections (
            id, vehicle_make, vehicle_model, vehicle_year,
            odometer_reading, vehicle_color, condition_score,
            vehicle_registration, engine_cc, vehicle_vin,
            ai_confidence, created_at, consented_at,
            captured_images (id, uri, angle, captured_at),
            captured_videos (id, uri, video_type, duration, captured_at),
            defects (id, category, severity, description, extracted_from, confidence),
            voice_recordings (id, category, transcript, duration)
          )
        `)
        .eq("id", slug)
        .single();

      if (error || !data) {
        // Always fallback to mock data for demo using centralized mock data
        const mockAuction = getAuctionById(slug);
        const auctionData = convertMockToPDPFormat(mockAuction, slug);
        setAuction(auctionData);
        setBidAmount((auctionData.current_highest_bid || 0) + (auctionData.minimum_bid_increment || 500));
        setLoading(false);
        return;
      }
      // Get consistent mock data for this auction slug - ensures PDP matches listing
      const mockAuction = getAuctionById(slug);
      const mockPdp = convertMockToPDPFormat(mockAuction, slug);
      
      const auctionData = data as unknown as AuctionData;

      // Check if DB has complete inspection data that the broker can actually read
      // RLS often blocks brokers from reading inspection details, so we need to fall back to mock
      const hasCompleteDbInspection = 
        auctionData.inspections &&
        auctionData.inspections.vehicle_make &&
        auctionData.inspections.vehicle_model &&
        auctionData.inspections.vehicle_registration;

      if (!hasCompleteDbInspection) {
        // Use 100% mock data for inspection to match what listing shows
        auctionData.inspections = mockPdp.inspections;
      } else {
        // DB has complete data - use it but still fill images if missing
        if (!auctionData.inspections.captured_images || auctionData.inspections.captured_images.length === 0) {
          auctionData.inspections.captured_images = getVehicleGallery(auctionData.inspections.vehicle_make, slug);
        }
        // Fill missing optional fields
        if (!auctionData.inspections.defects || auctionData.inspections.defects.length === 0) {
          auctionData.inspections.defects = mockPdp.inspections.defects;
        }
        if (!auctionData.inspections.voice_recordings || auctionData.inspections.voice_recordings.length === 0) {
          auctionData.inspections.voice_recordings = mockPdp.inspections.voice_recordings;
        }
      }
      
      // Also use mock auction-level data if DB is missing it
      if (!auctionData.geo_targeting_city) {
        auctionData.geo_targeting_city = mockPdp.geo_targeting_city;
      }

      setAuction(auctionData);
      setBidAmount((data.current_highest_bid || 0) + (data.minimum_bid_increment || 500));
      setLoading(false);
    };

    fetchAuction();
  }, [slug]);

  // Update timer
  useEffect(() => {
    if (!auction || auction.auction_type === "one_click") return;

    const interval = setInterval(() => {
      const endTime = new Date(auction.end_time);
      const remaining = endTime.getTime() - Date.now();
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Update bid amount when highest bid changes
  useEffect(() => {
    if (currentHighestBid > 0 && !myBid) {
      setBidAmount(currentHighestBid + 500);
    }
  }, [currentHighestBid, myBid]);

  // Image viewer functions
  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const navigateImage = (direction: "prev" | "next") => {
    const images = auction?.inspections?.captured_images || [];
    if (direction === "next") {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageViewerOpen) return;
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
      if (e.key === "Escape") setImageViewerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageViewerOpen]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getGradeFromScore = (score: number | null): string => {
    if (!score) return "C";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "E";
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-500",
    };
    return colors[grade] || "bg-gray-500";
  };

  const getAuctionTypeIcon = (type: string) => {
    switch (type) {
      case "quick": return <Zap className="w-3 h-3" />;
      case "flexible": return <Scale className="w-3 h-3" />;
      case "extended": return <Calendar className="w-3 h-3" />;
      case "one_click": return <Target className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getAuctionTypeName = (type: string) => {
    const names: Record<string, string> = {
      quick: "Quick Auction",
      flexible: "Flexible Auction",
      extended: "Extended Auction",
      one_click: "One-Click Buy",
    };
    return names[type] || "Auction";
  };

  // Calculate effective score and ranking
  const effectiveScore = calculateEffectiveScore(bidAmount, commission);
  const currentHighestEffective = calculateEffectiveScore(currentHighestBid, currentHighestCommission);
  const bidRanking = effectiveScore > currentHighestEffective ? "HIGH" : 
                     effectiveScore > currentHighestEffective * 0.95 ? "MEDIUM" : "LOW";

  const handlePlaceBid = () => {
    if (bidAmount <= currentHighestBid) {
      toast({
        title: "Invalid bid",
        description: `Bid must be higher than ₹${currentHighestBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmBid = async () => {
    setIsSubmitting(true);
    try {
      await placeBid(bidAmount, commission);
      setConfirmDialogOpen(false);
      setBidSheetOpen(false);
      playSound('success');
      toast({
        title: "✓ Bid placed successfully!",
        description: `₹${bidAmount.toLocaleString()} + ₹${commission.toLocaleString()} commission`,
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      playSound('error');
      toast({
        title: "Failed to place bid",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Auction not found</p>
        <Button onClick={() => navigate("/broker")}>Back to Dashboard</Button>
      </div>
    );
  }

  const grade = getGradeFromScore(auction.inspections?.condition_score);
  const minBidIncrement = auction.minimum_bid_increment || 500;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">
              {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {auction.geo_targeting_city || "Bangalore"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsWatchlisted(!isWatchlisted)}
          >
            <Heart className={`w-5 h-5 ${isWatchlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="relative aspect-video bg-muted">
        {auction.inspections?.captured_images && auction.inspections.captured_images.length > 0 ? (
          <img
            src={auction.inspections.captured_images[0].uri}
            alt={auction.inspections?.vehicle_model || "Vehicle"}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openImageViewer(0)}
          />
        ) : (
          <img
            src="/placeholder.svg"
            alt={auction.inspections?.vehicle_model || "Vehicle"}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Badge className="bg-black/70 text-white gap-1">
            <ImageIcon className="w-3 h-3" />
            {auction.inspections?.captured_images?.length || 0}
          </Badge>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {auction.inspections?.captured_images && auction.inspections.captured_images.length > 1 && (
        <div className="p-2 border-b overflow-x-auto">
          <div className="flex gap-2">
            {auction.inspections.captured_images.slice(0, 6).map((img) => (
              <div
                key={img.id}
                className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted"
              >
                <img
                  src={img.uri}
                  alt={img.angle}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    const index = auction.inspections!.captured_images.findIndex(i => i.id === img.id);
                    openImageViewer(index);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">
              {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
            </h2>
            <p className="text-muted-foreground">
              {auction.inspections?.vehicle_year}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {(auction.inspections?.odometer_reading || 0).toLocaleString()} km
            </p>
          </div>
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-center">
            <span className="text-2xl font-bold">{grade}</span>
          </div>
        </div>

        {/* My Bid Status */}
        {myBid && (
          <div className={`rounded-xl p-4 mb-4 border ${isWinning ? "bg-accent/5 border-accent/20" : "bg-warning/5 border-warning/20"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Bid</p>
                <p className="text-xl font-bold text-foreground">
                  ₹{myBid.bid_amount.toLocaleString()}
                  {myBid.commission_amount > 0 && (
                    <span className="text-muted-foreground text-sm font-normal"> +₹{myBid.commission_amount.toLocaleString()}</span>
                  )}
                </p>
              </div>
              <Badge className={isWinning ? "bg-accent text-accent-foreground" : "bg-warning text-warning-foreground"}>
                {isWinning ? "LEADING" : "OUTBID"}
              </Badge>
            </div>
          </div>
        )}

        {/* Documentation Status */}
        {(() => {
          const mockAuction = getAuctionById(slug || "");
          const docs = mockAuction?.documents;
          if (!docs) return null;
          return (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Documentation</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={docs.rc ? "default" : "outline"} 
                  className={
                    docs.rc 
                      ? "bg-accent/80 text-accent-foreground text-xs" 
                      : "text-muted-foreground border-dashed text-xs"
                  }
                >
                  RC {docs.rc ? "✓" : "✗"}
                </Badge>
                <Badge 
                  variant={docs.insurance ? "default" : "outline"} 
                  className={
                    docs.insurance 
                      ? "bg-accent/80 text-accent-foreground text-xs" 
                      : "text-muted-foreground border-dashed text-xs"
                  }
                >
                  Insurance {docs.insurance ? "✓" : "✗"}
                </Badge>
                <Badge 
                  variant={docs.puc ? "default" : "outline"} 
                  className={
                    docs.puc 
                      ? "bg-accent/80 text-accent-foreground text-xs" 
                      : "text-muted-foreground border-dashed text-xs"
                  }
                >
                  PUC {docs.puc ? "✓" : "✗"}
                </Badge>
                {docs.loan && (
                  <Badge variant="outline" className="text-xs text-warning border-warning/50">
                    Loan Active
                  </Badge>
                )}
                {docs.challans > 0 && (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive/50">
                    Challans ₹{docs.challans.toLocaleString("en-IN")}
                  </Badge>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Live Bid Feed */}
      <div className="p-4 border-b">
        <LiveBidFeed
          bids={bids}
          currentHighestBid={currentHighestBid}
          bidCount={bidCount}
          myBrokerId={broker?.id}
          endTime={auction.end_time}
          auctionType={auction.auction_type}
        />
      </div>

      {/* Auction Status */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Auction Details</h3>
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="gap-1">
              {getAuctionTypeIcon(auction.auction_type)}
              {getAuctionTypeName(auction.auction_type)}
            </Badge>
            {auction.auction_type !== "one_click" && (
              <span className={`text-lg font-mono font-bold ${timeLeft < 5 * 60 * 1000 ? "text-red-500" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Highest</p>
              <p className="text-2xl font-bold text-primary">
                ₹{currentHighestBid.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bids</p>
              <p className="text-lg font-semibold">{bidCount} brokers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Inspection Report */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Inspection Report</h3>
          {auction.inspections?.ai_confidence && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="w-3 h-3" />
              {auction.inspections.ai_confidence}% AI Verified
            </Badge>
          )}
        </div>

        {/* Condition Score Card */}
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Condition Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-foreground">
                  {auction.inspections?.condition_score || "N/A"}
                </span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
              (auction.inspections?.condition_score || 0) >= 85 ? "bg-accent/20 text-accent" :
              (auction.inspections?.condition_score || 0) >= 70 ? "bg-info/20 text-info" :
              (auction.inspections?.condition_score || 0) >= 55 ? "bg-warning/20 text-warning" :
              "bg-destructive/20 text-destructive"
            }`}>
              {grade}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span>{auction.inspections?.captured_images?.length || 0} photos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Play className="w-4 h-4 text-muted-foreground" />
              <span>{auction.inspections?.captured_videos?.length || 0} videos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span>{auction.inspections?.defects?.length || 0} issues</span>
            </div>
          </div>
        </div>

        {/* Vehicle Specifications Grid */}
        <Accordion type="single" collapsible defaultValue="specs" className="space-y-2">
          <AccordionItem value="specs" className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Vehicle Specifications</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Registration</p>
                  <p className="font-medium text-foreground">{maskRegistration(auction.inspections?.vehicle_registration)}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="font-medium text-foreground">{auction.inspections?.vehicle_year || "N/A"}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Engine</p>
                  <p className="font-medium text-foreground">{auction.inspections?.engine_cc ? `${auction.inspections.engine_cc}cc` : "N/A"}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="font-medium text-foreground">{auction.inspections?.vehicle_color || "N/A"}</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Odometer</p>
                  <p className="font-medium text-foreground">{auction.inspections?.odometer_reading ? `${auction.inspections.odometer_reading.toLocaleString()} km` : "N/A"}</p>
                </div>
                {/* Ownership */}
                {(() => {
                  const mockAuction = getAuctionById(slug || "");
                  const ownership = mockAuction?.vehicle.ownership || 1;
                  const ownershipText = ownership === 1 ? "1st Owner" : ownership === 2 ? "2nd Owner" : `${ownership}${ownership === 3 ? "rd" : "th"} Owner`;
                  return (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Ownership</p>
                      <p className="font-medium text-foreground">{ownershipText}</p>
                    </div>
                  );
                })()}
                {/* Location - vague locality */}
                {(() => {
                  const mockAuction = getAuctionById(slug || "");
                  const vehicleCity = auction.geo_targeting_city || mockAuction?.vehicle.city || "Bangalore";
                  const vehicleLocality = mockAuction?.vehicle.locality || getLocalityForCity(vehicleCity, (slug || "").split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
                  return (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{vehicleLocality}</p>
                    </div>
                  );
                })()}
                {/* Distance from Broker */}
                {(() => {
                  const mockAuction = getAuctionById(slug || "");
                  const vehicleCity = auction.geo_targeting_city || mockAuction?.vehicle.city || "Bangalore";
                  const brokerCity = broker?.city || "Bangalore";
                  const distance = getDistanceBetweenCities(brokerCity, vehicleCity);
                  const distanceText = distance < 50 
                    ? `~${distance} km` 
                    : distance < 100 
                      ? "Within 100 km" 
                      : `~${Math.round(distance / 10) * 10} km`;
                  return (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Distance from You</p>
                      <p className="font-medium text-foreground">{distanceText}</p>
                    </div>
                  );
                })()}
              </div>
              {auction.inspections?.consented_at && (
                <div className="mt-3 flex items-center gap-2 text-xs text-accent">
                  <Check className="w-3 h-3" />
                  <span>Customer verified on {new Date(auction.inspections.consented_at).toLocaleDateString()}</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Photo Evidence */}
          {auction.inspections?.captured_images && auction.inspections.captured_images.length > 0 && (
            <AccordionItem value="photos" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Photo Evidence ({auction.inspections.captured_images.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {auction.inspections.captured_images.map((image) => (
                    <div 
                      key={image.id} 
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                      onClick={() => {
                        const index = auction.inspections!.captured_images.findIndex(i => i.id === image.id);
                        openImageViewer(index);
                      }}
                    >
                      <img
                        src={image.uri}
                        alt={image.angle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                        <p className="text-[10px] text-white capitalize">{image.angle.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Video Evidence */}
          {auction.inspections?.captured_videos && auction.inspections.captured_videos.length > 0 && (
            <AccordionItem value="videos" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Video Evidence ({auction.inspections.captured_videos.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  {auction.inspections.captured_videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground capitalize">
                            {video.video_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {video.duration}s duration
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        Play
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Defects / Issues */}
          {auction.inspections?.defects && auction.inspections.defects.length > 0 && (
            <AccordionItem value="defects" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="font-medium">Reported Issues ({auction.inspections.defects.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  {auction.inspections.defects.map((defect) => (
                    <div
                      key={defect.id}
                      className={`rounded-xl p-3 border ${
                        defect.severity === "major" || defect.severity === "critical"
                          ? "bg-destructive/5 border-destructive/20"
                          : defect.severity === "moderate"
                          ? "bg-warning/5 border-warning/20"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground capitalize">{defect.category}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              defect.severity === "major" || defect.severity === "critical"
                                ? "border-destructive/30 text-destructive"
                                : defect.severity === "moderate"
                                ? "border-warning/30 text-warning"
                                : "border-border text-muted-foreground"
                            }
                          >
                            {defect.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{defect.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">Source: {defect.extracted_from}</span>
                        {defect.confidence && (
                          <span>{Math.round(defect.confidence * 100)}% confidence</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Defect Summary */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-foreground mb-2">Issue Summary</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-destructive"></span>
                      <span className="text-muted-foreground">
                        {auction.inspections.defects.filter(d => d.severity === "major" || d.severity === "critical").length} Major
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-warning"></span>
                      <span className="text-muted-foreground">
                        {auction.inspections.defects.filter(d => d.severity === "moderate").length} Moderate
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                      <span className="text-muted-foreground">
                        {auction.inspections.defects.filter(d => d.severity === "minor").length} Minor
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Voice Notes */}
          {auction.inspections?.voice_recordings && auction.inspections.voice_recordings.length > 0 && (
            <AccordionItem value="voice" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Inspector Notes ({auction.inspections.voice_recordings.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  {auction.inspections.voice_recordings.map((recording) => (
                    <div key={recording.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {recording.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{recording.duration}s</span>
                      </div>
                      <p className="text-sm text-foreground italic">"{recording.transcript}"</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Inspection Metadata */}
        {auction.inspections?.created_at && (
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Inspected: {new Date(auction.inspections.created_at).toLocaleDateString()}</span>
            <span>ID: {auction.inspections.id.slice(0, 8)}</span>
          </div>
        )}
      </div>

      {/* RC Transfer Warning */}
      <div className="p-4 border-b bg-warning/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              RC Transfer Obligation
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Within 6 months of purchase. Failure: -500 coins, -10 trust score
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-20">
        <Button
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
          onClick={() => setBidSheetOpen(true)}
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          {myBid ? "Increase Bid" : "Place Bid"}
        </Button>
      </div>

      {/* Bid Sheet */}
      <Sheet open={bidSheetOpen} onOpenChange={setBidSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{myBid ? "Increase Your Bid" : "Place Your Bid"}</SheetTitle>
            <SheetDescription>
              Current highest: ₹{currentHighestBid.toLocaleString()} • Min: ₹{(currentHighestBid + minBidIncrement).toLocaleString()}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Bid Amount */}
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your bid amount (₹) *</Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="h-12 text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least ₹{(currentHighestBid + minBidIncrement).toLocaleString()}
              </p>
            </div>

            {/* Commission Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Commission to sales executive (₹)</Label>
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Optional</span>
                </div>
              </div>
              <Slider
                value={[commission]}
                onValueChange={(values) => setCommission(values[0])}
                max={2000}
                step={100}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">₹0</span>
                <span className="text-lg font-semibold text-foreground">
                  ₹{commission.toLocaleString()}
                </span>
                <span className="text-muted-foreground">₹2,000</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher commission can improve your bid ranking with OEM sales team.
              </p>
            </div>

            {/* Bid Summary */}
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle bid</span>
                <span className="font-semibold text-foreground">₹{bidAmount.toLocaleString()}</span>
              </div>
              {commission > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="font-semibold text-foreground">₹{commission.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-3 flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">₹{(bidAmount + commission).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Ranking</span>
                <Badge className={
                  bidRanking === "HIGH" ? "bg-accent text-accent-foreground" :
                  bidRanking === "MEDIUM" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"
                }>
                  {bidRanking}
                </Badge>
              </div>
            </div>

            {/* Place Bid Button */}
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              onClick={handlePlaceBid}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing..." : `Place Bid ₹${bidAmount.toLocaleString()}`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Bid</DialogTitle>
            <DialogDescription>
              Please review your bid details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Vehicle bid</span>
              <span className="font-semibold text-foreground">₹{bidAmount.toLocaleString()}</span>
            </div>
            {commission > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-semibold text-foreground">₹{commission.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-3 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₹{(bidAmount + commission).toLocaleString()}</span>
            </div>
            <div className="bg-muted rounded-lg p-3 mt-3">
              <p className="text-sm text-muted-foreground">
                ⚠️ This bid cannot be edited, but you can place higher bids later.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={confirmBid}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming..." : "Confirm Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none">
          {auction?.inspections?.captured_images && auction.inspections.captured_images.length > 0 && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setImageViewerOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Image Counter */}
              <div className="absolute top-4 left-4 z-50 text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
                {selectedImageIndex + 1} of {auction.inspections.captured_images.length}
              </div>

              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
                onClick={() => navigateImage("prev")}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              {/* Main Image */}
              <img
                src={auction.inspections.captured_images[selectedImageIndex]?.uri}
                alt={auction.inspections.captured_images[selectedImageIndex]?.angle}
                className="max-w-full max-h-full object-contain"
              />

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 w-12 h-12"
                onClick={() => navigateImage("next")}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              {/* Caption */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white text-center">
                <p className="text-lg font-medium capitalize">
                  {auction.inspections.captured_images[selectedImageIndex]?.angle.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerAuctionDetail;
