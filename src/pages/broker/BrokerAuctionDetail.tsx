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
  Play, Image as ImageIcon, Info, Heart, Shield, Car, Mic,
  Share2, TrendingUp, Scale, Calendar, Target, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useRealtimeBids } from "@/hooks/useRealtimeBids";
import LiveBidFeed from "@/components/broker/LiveBidFeed";
import { calculateEffectiveScore } from "@/data/brokerMockData";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";

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

// Image mapping by vehicle make
const VEHICLE_IMAGES: Record<string, string[]> = {
  "Honda": ["/vehicles/activa1.jpg", "/vehicles/activa2.jpg", "/vehicles/activa3.jpg", "/vehicles/activa4.jpg", "/vehicles/activa6.jpg", "/vehicles/activa7.jpg"],
  "TVS": ["/vehicles/pulsar5.jpg", "/vehicles/activa7.jpg"],
  "Bajaj": ["/vehicles/pulsar2.jpg", "/vehicles/pulsar4.jpg", "/vehicles/pulsar5.jpg"],
  "Royal Enfield": ["/vehicles/royalenfield1.jpg", "/vehicles/royalenfield2.jpg", "/vehicles/royalenfield3.jpg", "/vehicles/royalenfield4.jpg", "/vehicles/royalenfield5.jpg"],
  "Yamaha": ["/vehicles/pulsar5.jpg", "/vehicles/duke390.jpg"],
  "Hero": ["/vehicles/activa2.jpg", "/vehicles/activa7.jpg"],
  "Suzuki": ["/vehicles/pulsar5.jpg", "/vehicles/activa7.jpg"],
  "KTM": ["/vehicles/duke390.jpg", "/vehicles/duke390_1.jpg", "/vehicles/duke390_2.jpg", "/vehicles/duke390_3.jpg", "/vehicles/duke390_4.jpg", "/vehicles/duke390_5.jpg"],
};

const getImagesForMake = (make: string): CapturedImage[] => {
  const images = VEHICLE_IMAGES[make] || VEHICLE_IMAGES["Honda"];
  return images.map((uri, index) => ({
    id: `img-${index}`,
    uri,
    angle: ["front_right", "rear_left", "dashboard", "engine", "side_profile", "exhaust"][index % 6],
    captured_at: new Date().toISOString(),
  }));
};

// Mock auctions with complete data for demo mode
const MOCK_AUCTIONS: Record<string, AuctionData> = {
  "mock-auction-1": {
    id: "mock-auction-1", auction_type: "quick", status: "live",
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    current_highest_bid: 48000, current_highest_commission: 2000, bid_count: 8, minimum_bid_increment: 500,
    geo_targeting_city: "Bangalore",
    inspections: {
      id: "insp-1", vehicle_make: "Honda", vehicle_model: "Activa 6G", vehicle_year: 2023, odometer_reading: 12450,
      vehicle_color: "Pearl White", condition_score: 85, vehicle_registration: "KA-01-AB-1234", engine_cc: 110,
      vehicle_vin: "ME4JF502LNM123456", ai_confidence: 92, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      captured_images: [
        { id: "img-1", uri: "/vehicles/activa1.jpg", angle: "front_right", captured_at: new Date().toISOString() },
        { id: "img-2", uri: "/vehicles/activa2.jpg", angle: "rear_left", captured_at: new Date().toISOString() },
        { id: "img-3", uri: "/vehicles/activa3.jpg", angle: "dashboard", captured_at: new Date().toISOString() },
        { id: "img-4", uri: "/vehicles/activa4.jpg", angle: "engine", captured_at: new Date().toISOString() },
      ],
      captured_videos: [{ id: "vid-1", uri: "/mock/walkaround.mp4", video_type: "walkaround", duration: 45, captured_at: new Date().toISOString() }],
      defects: [{ id: "def-1", category: "Body", severity: "minor", description: "Small scratch on front panel", extracted_from: "visual", confidence: 85 }],
      voice_recordings: [{ id: "vr-1", category: "overall", transcript: "Vehicle in good condition, minor wear on front panel", duration: 15 }]
    }
  },
  "mock-auction-2": {
    id: "mock-auction-2", auction_type: "flexible", status: "live",
    start_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 95 * 60 * 1000).toISOString(),
    current_highest_bid: 55000, current_highest_commission: 2500, bid_count: 12, minimum_bid_increment: 500,
    geo_targeting_city: "Mumbai",
    inspections: {
      id: "insp-2", vehicle_make: "TVS", vehicle_model: "Apache RTR 160", vehicle_year: 2022, odometer_reading: 18200,
      vehicle_color: "Racing Red", condition_score: 78, vehicle_registration: "MH-02-CD-5678", engine_cc: 160,
      vehicle_vin: "MD2A19ED8NWC45678", ai_confidence: 88, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      captured_images: [
        { id: "img-5", uri: "/vehicles/pulsar2.jpg", angle: "front_right", captured_at: new Date().toISOString() },
        { id: "img-6", uri: "/vehicles/pulsar4.jpg", angle: "rear_left", captured_at: new Date().toISOString() },
        { id: "img-7", uri: "/vehicles/pulsar5.jpg", angle: "side_profile", captured_at: new Date().toISOString() },
      ],
      captured_videos: [], defects: [], voice_recordings: []
    }
  },
  "mock-auction-3": {
    id: "mock-auction-3", auction_type: "extended", status: "live",
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    current_highest_bid: 125000, current_highest_commission: 5000, bid_count: 24, minimum_bid_increment: 1000,
    geo_targeting_city: "Delhi",
    inspections: {
      id: "insp-3", vehicle_make: "Royal Enfield", vehicle_model: "Classic 350", vehicle_year: 2021, odometer_reading: 24500,
      vehicle_color: "Gunmetal Grey", condition_score: 72, vehicle_registration: "DL-03-EF-9012", engine_cc: 350,
      vehicle_vin: "ME3RC4CA6LC789012", ai_confidence: 85, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      captured_images: [
        { id: "img-8", uri: "/vehicles/royalenfield1.jpg", angle: "front_right", captured_at: new Date().toISOString() },
        { id: "img-9", uri: "/vehicles/royalenfield2.jpg", angle: "rear_left", captured_at: new Date().toISOString() },
        { id: "img-10", uri: "/vehicles/royalenfield3.jpg", angle: "engine", captured_at: new Date().toISOString() },
        { id: "img-11", uri: "/vehicles/royalenfield4.jpg", angle: "dashboard", captured_at: new Date().toISOString() },
        { id: "img-12", uri: "/vehicles/royalenfield5.jpg", angle: "side_profile", captured_at: new Date().toISOString() },
      ],
      captured_videos: [], defects: [
        { id: "def-2", category: "Engine", severity: "minor", description: "Slight oil seepage near gasket", extracted_from: "visual", confidence: 78 },
        { id: "def-3", category: "Electrical", severity: "info", description: "Battery replaced 6 months ago", extracted_from: "voice", confidence: 95 }
      ], voice_recordings: []
    }
  },
  "mock-auction-4": {
    id: "mock-auction-4", auction_type: "quick", status: "live",
    start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    current_highest_bid: 185000, current_highest_commission: 7500, bid_count: 15, minimum_bid_increment: 1000,
    geo_targeting_city: "Pune",
    inspections: {
      id: "insp-4", vehicle_make: "KTM", vehicle_model: "Duke 390", vehicle_year: 2023, odometer_reading: 8500,
      vehicle_color: "Orange", condition_score: 92, vehicle_registration: "MH-12-GH-3456", engine_cc: 390,
      vehicle_vin: "VBKJFD4078M345678", ai_confidence: 95, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      captured_images: [
        { id: "img-13", uri: "/vehicles/duke390.jpg", angle: "front_right", captured_at: new Date().toISOString() },
        { id: "img-14", uri: "/vehicles/duke390_1.jpg", angle: "rear_left", captured_at: new Date().toISOString() },
        { id: "img-15", uri: "/vehicles/duke390_2.jpg", angle: "engine", captured_at: new Date().toISOString() },
        { id: "img-16", uri: "/vehicles/duke390_3.jpg", angle: "dashboard", captured_at: new Date().toISOString() },
        { id: "img-17", uri: "/vehicles/duke390_4.jpg", angle: "side_profile", captured_at: new Date().toISOString() },
        { id: "img-18", uri: "/vehicles/duke390_5.jpg", angle: "exhaust", captured_at: new Date().toISOString() },
      ],
      captured_videos: [], defects: [], voice_recordings: []
    }
  },
  "mock-auction-5": {
    id: "mock-auction-5", auction_type: "flexible", status: "live",
    start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    current_highest_bid: 42000, current_highest_commission: 1800, bid_count: 6, minimum_bid_increment: 500,
    geo_targeting_city: "Chennai",
    inspections: {
      id: "insp-5", vehicle_make: "Bajaj", vehicle_model: "Pulsar NS200", vehicle_year: 2022, odometer_reading: 22000,
      vehicle_color: "Neon Green", condition_score: 75, vehicle_registration: "TN-04-IJ-7890", engine_cc: 200,
      vehicle_vin: "MD2A27EYDNWB56789", ai_confidence: 82, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      consented_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      captured_images: [
        { id: "img-19", uri: "/vehicles/pulsar2.jpg", angle: "front_right", captured_at: new Date().toISOString() },
        { id: "img-20", uri: "/vehicles/pulsar4.jpg", angle: "rear_left", captured_at: new Date().toISOString() },
        { id: "img-21", uri: "/vehicles/pulsar5.jpg", angle: "side_profile", captured_at: new Date().toISOString() },
      ],
      captured_videos: [], defects: [], voice_recordings: []
    }
  },
};

const BrokerAuctionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  } = useRealtimeBids(id || "", broker?.id);

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
      if (!id) return;

      // Check if this is a mock auction ID first
      if (id.startsWith("mock-") || id.startsWith("auction-")) {
        const mockAuction = MOCK_AUCTIONS[id] || MOCK_AUCTIONS["mock-auction-1"];
        setAuction({ ...mockAuction, id });
        setBidAmount((mockAuction.current_highest_bid || 0) + (mockAuction.minimum_bid_increment || 500));
        setLoading(false);
        return;
      }

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
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching auction:", error);
        // Fallback to mock data
        const mockAuction = MOCK_AUCTIONS["mock-auction-1"];
        setAuction({ ...mockAuction, id: id || "mock-auction-1" });
        setBidAmount((mockAuction.current_highest_bid || 0) + 500);
        setLoading(false);
        return;
      }

      // Inject images from our local database if no captured images exist
      const auctionData = data as unknown as AuctionData;
      if (auctionData.inspections && (!auctionData.inspections.captured_images || auctionData.inspections.captured_images.length === 0)) {
        auctionData.inspections.captured_images = getImagesForMake(auctionData.inspections.vehicle_make);
      }

      setAuction(auctionData);
      setBidAmount((data.current_highest_bid || 0) + (data.minimum_bid_increment || 500));
      setLoading(false);
    };

    fetchAuction();
  }, [id]);

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
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/broker");
              }
            }}
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
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Vehicle Specifications</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Registration</p>
                  <p className="font-medium text-foreground">{auction.inspections?.vehicle_registration || "N/A"}</p>
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
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">VIN/Chassis</p>
                  <p className="font-medium text-foreground text-xs">{auction.inspections?.vehicle_vin || "N/A"}</p>
                </div>
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
