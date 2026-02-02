import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Scale, Calendar, Target, 
  Clock, ChevronRight, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

// Reliable bike thumbnail URLs
const BIKE_IMAGES: Record<string, string> = {
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

interface AuctionCardProps {
  auction: {
    id: string;
    vehicle: {
      make: string;
      model: string;
      variant?: string;
      year: number;
      kms: number;
      city: string;
      grade: string;
      thumbnail?: string;
    };
    auctionType: string;
    timeRemaining: number;
    endTime: Date;
    currentHighestBid: number;
    bidCount: number;
    matchScore?: number;
    documents: {
      rc: boolean;
      insurance: boolean;
      puc: boolean;
      challans: number;
      loan: boolean;
    };
    oemTrust?: string;
  };
  onClick: () => void;
}

const BrokerAuctionCard = ({ auction, onClick }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState(auction.timeRemaining);

  useEffect(() => {
    if (auction.auctionType === "one_click") return;

    const interval = setInterval(() => {
      const remaining = auction.endTime.getTime() - Date.now();
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime, auction.auctionType]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "Ended";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatPrice = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}k`;
  };

  const getGradeConfig = (grade: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      A: { bg: "bg-accent", text: "text-accent-foreground" },
      B: { bg: "bg-info", text: "text-info-foreground" },
      C: { bg: "bg-warning", text: "text-warning-foreground" },
      D: { bg: "bg-muted", text: "text-foreground" },
      E: { bg: "bg-destructive", text: "text-destructive-foreground" },
    };
    return configs[grade] || configs.C;
  };

  const getAuctionConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
      quick: { icon: <Zap className="w-3 h-3" />, name: "Quick", color: "text-amber-600" },
      flexible: { icon: <Scale className="w-3 h-3" />, name: "Flex", color: "text-blue-600" },
      extended: { icon: <Calendar className="w-3 h-3" />, name: "Extended", color: "text-purple-600" },
      one_click: { icon: <Target className="w-3 h-3" />, name: "1-Click", color: "text-accent" },
    };
    return configs[type] || configs.quick;
  };

  const isUrgent = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(auction.vehicle.grade);
  const auctionConfig = getAuctionConfig(auction.auctionType);
  
  // Use reliable image - never use placeholder.svg
  const thumbnail = BIKE_IMAGES[auction.vehicle.make] || BIKE_IMAGES["default"];

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail with Grade */}
        <div className="relative w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
          <img
            src={thumbnail}
            alt={`${auction.vehicle.make} ${auction.vehicle.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Grade Badge - bottom left */}
          <div className={cn(
            "absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold",
            gradeConfig.bg, gradeConfig.text
          )}>
            {auction.vehicle.grade}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Row 1: Title + Timer */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[15px] text-foreground leading-tight truncate">
                {auction.vehicle.make} {auction.vehicle.model}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <span>{auction.vehicle.year}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{(auction.vehicle.kms / 1000).toFixed(0)}k km</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {auction.vehicle.city}
                </span>
              </p>
            </div>
            
            {/* Timer Pill */}
            {auction.auctionType !== "one_click" && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0",
                isUrgent 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted text-muted-foreground"
              )}>
                <Clock className={cn("w-3.5 h-3.5", isUrgent && "animate-pulse")} />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          {/* Row 2: Price + Meta */}
          <div className="flex items-center justify-between mt-3">
            {/* Price Section */}
            {auction.auctionType === "one_click" ? (
              <span className="text-sm font-medium text-primary">Submit Best Bid →</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg text-foreground">
                  {formatPrice(auction.currentHighestBid)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {auction.bidCount} bids
                </span>
              </div>
            )}

            {/* Auction Type + Arrow */}
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={cn(
                "text-[10px] gap-1 px-2 py-0.5 font-medium border-muted-foreground/20",
                auctionConfig.color
              )}>
                {auctionConfig.icon}
                {auctionConfig.name}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerAuctionCard;