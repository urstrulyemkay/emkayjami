import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Scale, Calendar, Target, 
  Clock, ChevronRight
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

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-accent text-accent-foreground",
      B: "bg-info text-info-foreground",
      C: "bg-warning text-warning-foreground",
      D: "bg-muted text-foreground",
      E: "bg-destructive text-destructive-foreground",
    };
    return colors[grade] || "bg-muted text-foreground";
  };

  const getAuctionIcon = () => {
    switch (auction.auctionType) {
      case "quick": return <Zap className="w-3.5 h-3.5" />;
      case "flexible": return <Scale className="w-3.5 h-3.5" />;
      case "extended": return <Calendar className="w-3.5 h-3.5" />;
      case "one_click": return <Target className="w-3.5 h-3.5" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  const getAuctionTypeName = () => {
    switch (auction.auctionType) {
      case "quick": return "Quick";
      case "flexible": return "Flex";
      case "extended": return "Extended";
      case "one_click": return "1-Click";
      default: return "Auction";
    }
  };

  const isUrgent = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const thumbnail = auction.vehicle.thumbnail || BIKE_THUMBNAILS[auction.vehicle.make] || BIKE_THUMBNAILS["default"];

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-[88px] h-[88px] bg-muted rounded-xl overflow-hidden shrink-0">
          <img
            src={thumbnail}
            alt={auction.vehicle.model}
            className="w-full h-full object-cover"
          />
          {/* Grade Badge */}
          <div className={`absolute bottom-2 left-2 text-[11px] px-2 py-0.5 rounded-md font-bold ${getGradeColor(auction.vehicle.grade)}`}>
            {auction.vehicle.grade}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Top: Title + Timer */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-[15px] text-foreground leading-snug truncate">
                {auction.vehicle.make} {auction.vehicle.model}
              </h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {auction.vehicle.year} · {(auction.vehicle.kms / 1000).toFixed(0)}k km
              </p>
            </div>
            
            {/* Timer - right aligned */}
            {auction.auctionType !== "one_click" && (
              <div className={`flex items-center gap-1.5 shrink-0 ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                <Clock className={`w-4 h-4 ${isUrgent ? "animate-pulse" : ""}`} />
                <span className="text-sm font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          {/* Bottom: Price + Type */}
          <div className="flex items-center justify-between mt-2">
            {auction.auctionType === "one_click" ? (
              <span className="text-sm font-medium text-primary">Place Bid →</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-xl text-foreground">
                  ₹{(auction.currentHighestBid / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-muted-foreground">
                  {auction.bidCount} bids
                </span>
              </div>
            )}

            {/* Auction Type */}
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs gap-1 px-2 py-0.5 font-medium">
                {getAuctionIcon()}
                {getAuctionTypeName()}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerAuctionCard;
