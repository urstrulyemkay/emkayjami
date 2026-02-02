import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Scale, Calendar, Target, 
  Clock, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Local vehicle images from database
const BIKE_IMAGES: Record<string, string[]> = {
  "Honda": ["/vehicles/activa1.jpg", "/vehicles/activa2.jpg", "/vehicles/activa4.jpg"],
  "TVS": ["/vehicles/pulsar5.jpg"],
  "Bajaj": ["/vehicles/pulsar2.jpg", "/vehicles/pulsar4.jpg", "/vehicles/pulsar5.jpg"],
  "Royal Enfield": ["/vehicles/royalenfield3.jpg", "/vehicles/royalenfield4.jpg"],
  "Yamaha": ["/vehicles/pulsar5.jpg"],
  "Hero": ["/vehicles/activa2.jpg"],
  "Suzuki": ["/vehicles/pulsar5.jpg"],
  "KTM": ["/vehicles/duke390_1.jpg", "/vehicles/duke390_5.jpg"],
  "default": ["/vehicles/activa1.jpg", "/vehicles/royalenfield3.jpg", "/vehicles/pulsar2.jpg"],
};

const getRandomImage = (make: string, id: string): string => {
  const images = BIKE_IMAGES[make] || BIKE_IMAGES["default"];
  // Use id to deterministically pick an image
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % images.length;
  return images[index];
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
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
    const configs: Record<string, { icon: React.ReactNode; name: string }> = {
      quick: { icon: <Zap className="w-3 h-3" />, name: "Quick" },
      flexible: { icon: <Scale className="w-3 h-3" />, name: "Flex" },
      extended: { icon: <Calendar className="w-3 h-3" />, name: "Extended" },
      one_click: { icon: <Target className="w-3 h-3" />, name: "1-Click" },
    };
    return configs[type] || configs.quick;
  };

  const isUrgent = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(auction.vehicle.grade);
  const auctionConfig = getAuctionConfig(auction.auctionType);
  const thumbnail = getRandomImage(auction.vehicle.make, auction.id);

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-[72px] h-[72px] bg-muted rounded-lg overflow-hidden shrink-0">
          <img
            src={thumbnail}
            alt={`${auction.vehicle.make} ${auction.vehicle.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className={cn(
            "absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded font-bold",
            gradeConfig.bg, gradeConfig.text
          )}>
            {auction.vehicle.grade}
          </div>
        </div>

        {/* Content - compact 3 rows */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Row 1: Title + Timer */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {auction.vehicle.make} {auction.vehicle.model}
            </h3>
            {auction.auctionType !== "one_click" && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shrink-0",
                isUrgent 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted/80 text-muted-foreground"
              )}>
                <Clock className={cn("w-3 h-3", isUrgent && "animate-pulse")} />
                <span className="font-mono tabular-nums">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Row 2: Specs - single line */}
          <p className="text-xs text-muted-foreground truncate">
            {auction.vehicle.year} · {(auction.vehicle.kms / 1000).toFixed(0)}k km · {auction.vehicle.city}
          </p>
          
          {/* Row 3: Price + Type */}
          <div className="flex items-center justify-between gap-2">
            {auction.auctionType === "one_click" ? (
              <span className="text-xs font-medium text-primary">Submit Bid →</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-foreground">
                  {formatPrice(auction.currentHighestBid)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  · {auction.bidCount} bids
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5 py-0 h-5 font-medium">
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