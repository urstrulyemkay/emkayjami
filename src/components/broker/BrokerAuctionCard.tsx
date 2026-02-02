import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, Scale, Calendar, Target, MapPin, 
  Check, AlertTriangle, Lock, FileText
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

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500 text-white",
      B: "bg-blue-500 text-white",
      C: "bg-yellow-500 text-black",
      D: "bg-orange-500 text-white",
      E: "bg-red-500 text-white",
    };
    return colors[grade] || "bg-gray-500 text-white";
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
        return "Flexible";
      case "extended":
        return "Extended";
      case "one_click":
        return "One-Click";
      default:
        return "Auction";
    }
  };

  const getOemTrustBadge = () => {
    if (auction.oemTrust === "high") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
          High-trust OEM
        </Badge>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-card rounded-xl border overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
      onClick={onClick}
    >
      {/* Top Section - Thumbnail + Info */}
      <div className="flex gap-3 p-3">
        <div className="relative w-28 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
          <img
            src={auction.vehicle.thumbnail}
            alt={auction.vehicle.model}
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-1 left-1 px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(auction.vehicle.grade)}`}>
            {auction.vehicle.grade}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {auction.vehicle.make} {auction.vehicle.model}
          </h3>
          <p className="text-xs text-muted-foreground">
            {auction.vehicle.variant} • {auction.vehicle.year}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {auction.vehicle.kms.toLocaleString()} km
          </p>
          
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{auction.vehicle.city}</span>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
        {auction.documents.rc && (
          <Badge variant="outline" className="text-xs gap-1 h-5">
            <Check className="w-3 h-3 text-green-500" />
            RC
          </Badge>
        )}
        {auction.documents.insurance && (
          <Badge variant="outline" className="text-xs gap-1 h-5">
            <Check className="w-3 h-3 text-green-500" />
            Ins
          </Badge>
        )}
        {auction.documents.puc && (
          <Badge variant="outline" className="text-xs gap-1 h-5">
            <Check className="w-3 h-3 text-green-500" />
            PUC
          </Badge>
        )}
        {auction.documents.challans > 0 && (
          <Badge variant="outline" className="text-xs gap-1 h-5 border-orange-300">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            {auction.documents.challans} Challans
          </Badge>
        )}
        {auction.documents.loan && (
          <Badge variant="outline" className="text-xs gap-1 h-5 border-red-300">
            <Lock className="w-3 h-3 text-red-500" />
            Loan
          </Badge>
        )}
        {getOemTrustBadge()}
      </div>

      {/* Bottom Section - Auction Info */}
      <div className="px-3 pb-3 pt-1 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Auction Type + Time */}
          <div className="flex items-center gap-1.5">
            <Badge 
              variant={auction.auctionType === "one_click" ? "default" : "secondary"}
              className="gap-1 text-xs"
            >
              {getAuctionIcon()}
              {getAuctionTypeName()}
            </Badge>
            {auction.auctionType !== "one_click" && (
              <span className={`text-sm font-mono font-semibold ${timeLeft < 5 * 60 * 1000 ? "text-red-500" : "text-foreground"}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          {auction.auctionType === "one_click" ? (
            <p className="text-xs text-muted-foreground">Submit best bid</p>
          ) : (
            <>
              <p className="text-sm font-bold text-primary">
                ₹{auction.currentHighestBid.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {auction.bidCount} bids
              </p>
            </>
          )}
        </div>
      </div>

      {/* Match Score (optional) */}
      {auction.matchScore && auction.matchScore >= 80 && (
        <div className="px-3 pb-3">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-800 dark:text-amber-200 font-medium">
              {auction.matchScore}% match to your preferences
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerAuctionCard;
