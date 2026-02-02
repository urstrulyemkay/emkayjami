import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Scale, Calendar, Target, MapPin, 
  Check, AlertTriangle, Clock, ChevronRight
} from "lucide-react";

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
      thumbnail: string;
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

  return (
    <div
      className="broker-card cursor-pointer group"
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
          <img
            src={auction.vehicle.thumbnail}
            alt={auction.vehicle.model}
            className="w-full h-full object-cover"
          />
          {/* Grade Badge */}
          <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
            {auction.vehicle.grade}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate leading-tight">
                {auction.vehicle.make} {auction.vehicle.model}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {auction.vehicle.year} • {auction.vehicle.kms.toLocaleString()} km
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors" />
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-1 mt-2">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{auction.vehicle.city}</span>
          </div>

          {/* Document Status - Compact */}
          <div className="flex items-center gap-1.5 mt-2">
            {auction.documents.rc && (
              <span className="inline-flex items-center gap-0.5 text-xs text-accent">
                <Check className="w-3 h-3" />RC
              </span>
            )}
            {auction.documents.insurance && (
              <span className="inline-flex items-center gap-0.5 text-xs text-accent">
                <Check className="w-3 h-3" />Ins
              </span>
            )}
            {auction.documents.challans > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-warning">
                <AlertTriangle className="w-3 h-3" />{auction.documents.challans}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Auction Status */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Auction Type */}
          <Badge 
            variant="outline"
            className="gap-1 text-xs font-medium border-border"
          >
            {getAuctionIcon()}
            {getAuctionTypeName()}
          </Badge>
          
          {/* Timer */}
          {auction.auctionType !== "one_click" && (
            <div className={`flex items-center gap-1 text-sm font-mono font-semibold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
              <Clock className={`w-3.5 h-3.5 ${isUrgent ? "animate-pulse" : ""}`} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Bid Info */}
        <div className="text-right">
          {auction.auctionType === "one_click" ? (
            <span className="text-sm font-medium text-foreground">Submit Bid →</span>
          ) : (
            <div>
              <p className="text-base font-bold text-foreground">
                ₹{auction.currentHighestBid.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Match Score Banner */}
      {auction.matchScore && auction.matchScore >= 80 && (
        <div className="px-4 py-2 bg-accent/5 border-t border-accent/10 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-accent font-medium">
            {auction.matchScore}% match
          </span>
        </div>
      )}
    </div>
  );
};

export default BrokerAuctionCard;
