import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, ChevronRight, Trophy, AlertTriangle, 
  TrendingUp, Zap, Scale, Calendar, Target, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

// Reliable bike thumbnail URLs - same as BrokerAuctionCard for consistency
export const BIKE_THUMBNAILS: Record<string, string> = {
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

export interface VehicleInfo {
  make: string;
  model: string;
  year: number | null;
  kms: number | null;
  color?: string | null;
  registration?: string | null;
  city?: string | null;
  grade?: string;
}

export interface CardStatus {
  type: "live" | "won" | "lost" | "upcoming";
  bidAmount?: number;
  commission?: number;
  timeRemaining?: number;
  auctionType?: string;
  serviceProgress?: number;
  remainingDays?: number;
  isUrgent?: boolean;
  winningBid?: number;
  bidDifference?: number;
}

interface VehicleCardProps {
  vehicle: VehicleInfo;
  status: CardStatus;
  onClick?: () => void;
  className?: string;
}

// Format price to compact form
const formatPrice = (amount: number) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}k`;
};

// Get auction type config
const getAuctionConfig = (type?: string) => {
  const configs: Record<string, { icon: React.ReactNode; name: string }> = {
    quick: { icon: <Zap className="w-3 h-3" />, name: "Quick" },
    flexible: { icon: <Scale className="w-3 h-3" />, name: "Flex" },
    extended: { icon: <Calendar className="w-3 h-3" />, name: "Extended" },
    one_click: { icon: <Target className="w-3 h-3" />, name: "1-Click" },
    standard: { icon: <Zap className="w-3 h-3" />, name: "Standard" },
  };
  return type ? configs[type] || configs.standard : null;
};

// Get grade color config
const getGradeConfig = (grade?: string) => {
  const configs: Record<string, { bg: string; text: string }> = {
    A: { bg: "bg-accent", text: "text-accent-foreground" },
    B: { bg: "bg-info", text: "text-info-foreground" },
    C: { bg: "bg-warning", text: "text-warning-foreground" },
    D: { bg: "bg-muted", text: "text-foreground" },
    E: { bg: "bg-destructive", text: "text-destructive-foreground" },
  };
  return grade ? configs[grade] || configs.C : configs.C;
};

const VehicleCard = ({ vehicle, status, onClick, className }: VehicleCardProps) => {
  const thumbnail = BIKE_THUMBNAILS[vehicle.make] || BIKE_THUMBNAILS["default"];
  
  // Real-time countdown state
  const [timeLeft, setTimeLeft] = useState(status.timeRemaining || 0);
  
  // Update countdown every second
  useEffect(() => {
    if (status.type !== "live" || status.timeRemaining === undefined) return;
    
    setTimeLeft(status.timeRemaining);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status.type, status.timeRemaining]);
  
  const formatTime = (ms: number) => {
    if (ms <= 0) return "Ended";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isUrgentTime = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(vehicle.grade);
  const auctionConfig = getAuctionConfig(status.auctionType);

  // Ensure we always have valid values
  const displayYear = vehicle.year || 2023;
  const displayKms = vehicle.kms || 15000;
  const displayCity = vehicle.city || "Bangalore";
  const displayGrade = vehicle.grade || "B";

  return (
    <div
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-lg active:scale-[0.99]",
        status.type === "lost" && "opacity-60",
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail with Grade */}
        <div className={cn(
          "relative w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0",
          status.type === "lost" && "grayscale"
        )}>
          <img
            src={thumbnail}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Grade Badge - bottom left */}
          <div className={cn(
            "absolute bottom-2 left-2 text-[11px] px-2 py-0.5 rounded-md font-bold",
            gradeConfig.bg, gradeConfig.text
          )}>
            {displayGrade}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Row 1: Title + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground leading-tight">
                {vehicle.make} {vehicle.model}
              </h3>
            </div>
            
            {/* Status Indicator */}
            <div className="shrink-0">
              {/* Live: Timer */}
              {status.type === "live" && status.timeRemaining !== undefined && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                  isUrgentTime 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <Clock className={cn("w-3.5 h-3.5", isUrgentTime && "animate-pulse")} />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
              
              {/* Won: Badge */}
              {status.type === "won" && (
                <Badge className="bg-accent/10 text-accent border-0 gap-1 text-xs px-2.5 py-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Won
                </Badge>
              )}
              
              {/* Lost: Badge */}
              {status.type === "lost" && (
                <Badge variant="secondary" className="text-xs px-2.5 py-1">
                  Lost
                </Badge>
              )}
            </div>
          </div>

          {/* Row 2: Specs */}
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
            <span>{displayYear}</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{(displayKms / 1000).toFixed(0)}k km</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {displayCity}
            </span>
          </p>
          
          {/* Row 3: Price + Actions */}
          <div className="flex items-center justify-between mt-3">
            {/* Price Section */}
            <div className="flex items-baseline gap-2">
              {/* Live bids */}
              {status.type === "live" && status.bidAmount !== undefined && status.bidAmount > 0 && (
                <>
                  <span className={cn(
                    "font-bold text-xl",
                    status.bidDifference !== undefined && status.bidDifference >= 0 
                      ? "text-accent" 
                      : "text-foreground"
                  )}>
                    {formatPrice(status.bidAmount)}
                  </span>
                  {status.commission !== undefined && status.commission > 0 && (
                    <span className="text-sm text-warning font-medium">
                      +{formatPrice(status.commission)}
                    </span>
                  )}
                </>
              )}
              
              {/* Won bids */}
              {status.type === "won" && status.bidAmount !== undefined && (
                <>
                  <span className="font-bold text-xl text-foreground">
                    {formatPrice(status.bidAmount)}
                  </span>
                  {status.commission !== undefined && status.commission > 0 && (
                    <span className="text-sm text-warning font-medium">
                      +{formatPrice(status.commission)}
                    </span>
                  )}
                </>
              )}
              
              {/* Lost bids */}
              {status.type === "lost" && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    You: <span className="font-medium text-foreground">{formatPrice(status.bidAmount || 0)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Won: <span className="font-medium text-accent">{formatPrice(status.winningBid || 0)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live: Bid status or Raise */}
              {status.type === "live" && (
                <>
                  {status.bidDifference !== undefined && status.bidDifference >= 0 ? (
                    <Badge className="bg-accent/10 text-accent border-0 text-xs px-2.5 py-1">
                      Winning
                    </Badge>
                  ) : status.bidDifference !== undefined && status.bidDifference < 0 ? (
                    <button className="h-7 px-3 text-xs bg-warning text-warning-foreground hover:bg-warning/90 rounded-lg flex items-center gap-1.5 font-medium transition-colors">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Raise
                    </button>
                  ) : null}
                  
                  {auctionConfig && (
                    <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
                      {auctionConfig.icon}
                      {auctionConfig.name}
                    </Badge>
                  )}
                </>
              )}

              {/* Won: Urgent warning or Progress */}
              {status.type === "won" && (
                <>
                  {status.isUrgent && status.remainingDays !== undefined && (
                    <Badge variant="destructive" className="text-xs gap-1 px-2.5 py-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {status.remainingDays}d
                    </Badge>
                  )}
                  
                  {status.serviceProgress !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-14">
                        <Progress value={status.serviceProgress} className="h-1.5" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        status.serviceProgress === 100 ? "text-accent" : "text-muted-foreground"
                      )}>
                        {status.serviceProgress}%
                      </span>
                    </div>
                  )}
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                </>
              )}

              {/* Lost: Show difference */}
              {status.type === "lost" && status.bidDifference !== undefined && (
                <span className="text-xs text-destructive font-medium">
                  -{formatPrice(Math.abs(status.bidDifference))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;