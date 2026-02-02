import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Scale, Calendar, Target, MapPin, 
  Check, AlertTriangle, Clock, ChevronRight
} from "lucide-react";
import { BIKE_THUMBNAILS } from "./VehicleCard";

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
    if (ms <= 0) return "00:00";
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

  const getGradeConfig = (grade: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      A: { bg: "bg-accent", text: "text-accent-foreground" },
      B: { bg: "bg-info", text: "text-info-foreground" },
      C: { bg: "bg-warning", text: "text-warning-foreground" },
      D: { bg: "bg-muted", text: "text-foreground" },
      E: { bg: "bg-destructive", text: "text-destructive-foreground" },
    };
    return configs[grade] || { bg: "bg-muted", text: "text-foreground" };
  };

  const getAuctionIcon = () => {
    switch (auction.auctionType) {
      case "quick":
        return <Zap className="w-3 h-3" />;
      case "flexible":
        return <Scale className="w-3 h-3" />;
      case "extended":
        return <Calendar className="w-3 h-3" />;
      case "one_click":
        return <Target className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getAuctionTypeName = () => {
    switch (auction.auctionType) {
      case "quick":
        return "Quick";
      case "flexible":
        return "Flex";
      case "extended":
        return "Extended";
      case "one_click":
        return "1-Click";
      default:
        return "Auction";
    }
  };

  const isUrgent = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(auction.vehicle.grade);
  const thumbnail = auction.vehicle.thumbnail || BIKE_THUMBNAILS[auction.vehicle.make] || BIKE_THUMBNAILS["default"];

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail - larger and clearer */}
        <div className="relative w-24 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
          <img
            src={thumbnail}
            alt={auction.vehicle.model}
            className="w-full h-full object-cover"
          />
          {/* Grade Badge - more prominent */}
          <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[11px] font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
            Grade {auction.vehicle.grade}
          </div>
        </div>

        {/* Vehicle Info - better hierarchy */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Top: Title + Timer */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">
                {auction.vehicle.make} {auction.vehicle.model}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                <span>{auction.vehicle.year}</span>
                <span className="text-border">•</span>
                <span>{auction.vehicle.kms.toLocaleString()} km</span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {auction.vehicle.city}
                </span>
              </div>
            </div>
            
            {/* Timer - more visible */}
            {auction.auctionType !== "one_click" && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0 ${
                isUrgent ? "bg-destructive/10" : "bg-muted"
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
                <span className={`text-sm font-mono font-medium ${isUrgent ? "text-destructive" : "text-foreground"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          
          {/* Bottom: Bid Info + Actions */}
          <div className="flex items-center justify-between mt-2 gap-3">
            {/* Bid Info */}
            {auction.auctionType === "one_click" ? (
              <span className="text-sm font-medium text-primary">Submit your bid →</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg text-foreground">
                  ₹{auction.currentHighestBid.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {auction.bidCount} bids
                </span>
              </div>
            )}

            {/* Right side badges */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Auction Type */}
              <Badge variant="secondary" className="text-xs px-2 py-0.5 gap-1">
                {getAuctionIcon()}
                {getAuctionTypeName()}
              </Badge>
              
              {/* Document status */}
              {auction.documents.rc && auction.documents.insurance && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 gap-1 text-accent border-accent/30">
                  <Check className="w-3 h-3" />
                  Docs Ready
                </Badge>
              )}
              
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerAuctionCard;
