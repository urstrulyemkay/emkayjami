import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, ChevronRight, MapPin, Trophy, AlertTriangle, 
  TrendingUp, Zap, Scale, Calendar, Target 
} from "lucide-react";
import { cn } from "@/lib/utils";
// Shared bike thumbnails
export const BIKE_THUMBNAILS: Record<string, string> = {
  "Honda": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "TVS": "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&h=300&fit=crop",
  "Bajaj": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop",
  "Royal Enfield": "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&h=300&fit=crop",
  "Yamaha": "https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=400&h=300&fit=crop",
  "Hero": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop",
  "Suzuki": "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop",
  "KTM": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "default": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
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
    if (ms <= 0) return "00:00";
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

  const getAuctionTypeConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; name: string }> = {
      quick: { icon: <Zap className="w-3 h-3" />, name: "Quick" },
      flexible: { icon: <Scale className="w-3 h-3" />, name: "Flex" },
      extended: { icon: <Calendar className="w-3 h-3" />, name: "Extended" },
      one_click: { icon: <Target className="w-3 h-3" />, name: "1-Click" },
      standard: { icon: <Zap className="w-3 h-3" />, name: "Standard" },
    };
    return configs[type] || configs.standard;
  };

  const getGradeConfig = (grade?: string) => {
    if (!grade) return null;
    const configs: Record<string, { bg: string; text: string }> = {
      A: { bg: "bg-accent", text: "text-accent-foreground" },
      B: { bg: "bg-info", text: "text-info-foreground" },
      C: { bg: "bg-warning", text: "text-warning-foreground" },
      D: { bg: "bg-muted", text: "text-foreground" },
      E: { bg: "bg-destructive", text: "text-destructive-foreground" },
    };
    return configs[grade];
  };

  const isUrgentTime = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(vehicle.grade);
  const auctionConfig = status.auctionType ? getAuctionTypeConfig(status.auctionType) : null;

  const getStatusBadge = () => {
    switch (status.type) {
      case "live":
        return status.bidAmount && status.bidAmount > 0 ? (
          <Badge className={`text-[10px] px-1.5 py-0 h-4 ${
            status.bidDifference && status.bidDifference >= 0 
              ? "bg-accent text-accent-foreground" 
              : "bg-destructive text-destructive-foreground"
          }`}>
            {status.bidDifference && status.bidDifference >= 0 ? "WIN" : "OUT"}
          </Badge>
        ) : null;
      case "won":
        return (
          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-accent text-accent-foreground">
            <Trophy className="w-3 h-3 mr-0.5" />
            WON
          </Badge>
        );
      case "lost":
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            LOST
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            <Clock className="w-3 h-3 mr-0.5" />
            SOON
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "bg-card border rounded-lg overflow-hidden transition-colors",
        onClick && "cursor-pointer hover:border-primary/50",
        status.type === "lost" && "opacity-75",
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail - taller */}
        <div className={cn(
          "relative w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0",
          status.type === "lost" && "grayscale"
        )}>
          <img
            src={thumbnail}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
          {/* Grade Badge */}
          {gradeConfig && (
            <div className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
              {vehicle.grade}
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-1.5 right-1.5">
            {getStatusBadge()}
          </div>
        </div>

        {/* Vehicle Info - vertically centered */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
          {/* Title & Specs */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground leading-tight">
                {vehicle.make} {vehicle.model}
              </h3>
              {/* Timer for live */}
              {status.type === "live" && status.timeRemaining !== undefined && (
                <div className={`flex items-center gap-1 shrink-0 text-xs font-medium ${isUrgentTime ? "text-destructive" : "text-muted-foreground"}`}>
                  <Clock className="w-3 h-3" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {vehicle.year || "2023"} · {((vehicle.kms || 0) / 1000).toFixed(0)}k km{vehicle.city && ` · ${vehicle.city}`}
            </p>
          </div>
          
          {/* Bottom row - price & actions */}
          <div className="flex items-center justify-between">
            {/* Bid amount */}
            {status.bidAmount !== undefined && status.bidAmount > 0 && status.type !== "lost" && (
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-base ${status.type === "won" ? "text-accent" : "text-foreground"}`}>
                  ₹{(status.bidAmount / 1000).toFixed(0)}k
                </span>
                {status.commission !== undefined && status.commission > 0 && (
                  <span className="text-warning text-xs">+₹{(status.commission / 1000).toFixed(1)}k</span>
                )}
              </div>
            )}

            {/* Lost comparison - simplified */}
            {status.type === "lost" && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  You: <span className="font-medium text-foreground">₹{((status.bidAmount || 0) / 1000).toFixed(0)}k</span>
                </span>
                <span className="text-muted-foreground">
                  Won: <span className="font-medium text-accent">₹{((status.winningBid || 0) / 1000).toFixed(0)}k</span>
                </span>
              </div>
            )}

            {/* Right side actions/info */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Auction type badge for live */}
              {status.type === "live" && auctionConfig && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 gap-0.5">
                  {auctionConfig.icon} {auctionConfig.name}
                </Badge>
              )}
              
              {/* Raise button for outbid */}
              {status.type === "live" && status.bidDifference !== undefined && status.bidDifference < 0 && (
                <button className="h-6 px-2.5 text-xs bg-warning text-warning-foreground hover:bg-warning/90 rounded-md flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Raise
                </button>
              )}

              {/* Urgent days for won */}
              {status.type === "won" && status.isUrgent && status.remainingDays !== undefined && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-5 shrink-0">
                  <AlertTriangle className="w-3 h-3 mr-0.5" />
                  {status.remainingDays}d left
                </Badge>
              )}

              {/* Service progress for won */}
              {status.type === "won" && status.serviceProgress !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-14">
                    <Progress value={status.serviceProgress} className="h-1.5" />
                  </div>
                  <span className={`text-xs ${status.serviceProgress === 100 ? "text-accent font-medium" : "text-muted-foreground"}`}>
                    {status.serviceProgress}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* Lost difference */}
              {status.type === "lost" && status.bidDifference !== undefined && (
                <span className="text-xs text-destructive font-medium">-₹{(Math.abs(status.bidDifference) / 1000).toFixed(0)}k</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
