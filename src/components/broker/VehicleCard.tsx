import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Clock, ChevronRight, Trophy, AlertTriangle, 
  TrendingUp, Zap, Scale, Calendar, Target, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVehicleImage, VEHICLE_IMAGES } from "@/data/mockAuctions";
import LostBidInsight from "./LostBidInsight";

// Export for backwards compatibility
export const BIKE_THUMBNAILS = VEHICLE_IMAGES;

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
  showInsight?: boolean;
  showServicesCTA?: boolean; // Show "Get Services" CTA for won vehicles
  onServicesClick?: () => void; // Callback when services CTA is clicked
}

interface VehicleCardProps {
  vehicle: VehicleInfo;
  status: CardStatus;
  onClick?: () => void;
  className?: string;
}

const formatPrice = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}k`;
};

const getAuctionConfig = (type?: string) => {
  const configs: Record<string, { icon: React.ReactNode; name: string }> = {
    quick: { icon: <Zap className="w-3 h-3" />, name: "Quick" },
    flexible: { icon: <Scale className="w-3 h-3" />, name: "Flex" },
    extended: { icon: <Calendar className="w-3 h-3" />, name: "Extended" },
    one_click: { icon: <Target className="w-3 h-3" />, name: "1-Click" },
  };
  return type ? configs[type] : null;
};

const getGradeConfig = (grade?: string) => {
  const configs: Record<string, { bg: string; text: string }> = {
    A: { bg: "bg-accent", text: "text-accent-foreground" },
    B: { bg: "bg-info", text: "text-info-foreground" },
    C: { bg: "bg-warning", text: "text-warning-foreground" },
    D: { bg: "bg-muted", text: "text-foreground" },
    E: { bg: "bg-destructive", text: "text-destructive-foreground" },
  };
  return grade ? configs[grade] || configs.B : configs.B;
};

const VehicleCard = ({ vehicle, status, onClick, className }: VehicleCardProps) => {
  const thumbnail = getVehicleImage(vehicle.make, vehicle.model);
  const [timeLeft, setTimeLeft] = useState(status.timeRemaining || 0);
  
  useEffect(() => {
    if (status.type !== "live" || !status.timeRemaining) return;
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
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isUrgentTime = timeLeft < 5 * 60 * 1000 && timeLeft > 0;
  const gradeConfig = getGradeConfig(vehicle.grade);
  const auctionConfig = getAuctionConfig(status.auctionType);
  const displayYear = vehicle.year || 2023;
  const displayKms = vehicle.kms || 15000;
  const displayCity = vehicle.city || "Bangalore";
  const displayGrade = vehicle.grade || "B";

  return (
    <div
      className={cn(
        "group bg-card border rounded-xl overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-lg active:scale-[0.99]",
        status.type === "lost" && "opacity-70 hover:opacity-100",
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className={cn(
          "relative w-[72px] h-[72px] bg-muted rounded-lg overflow-hidden shrink-0 transition-all duration-200",
          status.type === "lost" && "grayscale group-hover:grayscale-0"
        )}>
          <img
            src={thumbnail}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className={cn(
            "absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded font-bold",
            gradeConfig.bg, gradeConfig.text
          )}>
            {displayGrade}
          </div>
        </div>

        {/* Content - compact 3 rows */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Row 1: Title + Status */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            <div className="shrink-0">
              {status.type === "live" && status.timeRemaining !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                  isUrgentTime ? "bg-destructive/10 text-destructive" : "bg-muted/80 text-muted-foreground"
                )}>
                  <Clock className={cn("w-3 h-3", isUrgentTime && "animate-pulse")} />
                  <span className="font-mono tabular-nums">{formatTime(timeLeft)}</span>
                </div>
              )}
              {status.type === "won" && (
                <Badge className="bg-accent/10 text-accent border-0 gap-1 text-[10px] px-2 h-5">
                  <Trophy className="w-3 h-3" /> Won
                </Badge>
              )}
              {status.type === "lost" && (
                <Badge variant="secondary" className="text-[10px] px-2 h-5">Lost</Badge>
              )}
            </div>
          </div>

          {/* Row 2: Specs - single line */}
          <p className="text-xs text-muted-foreground truncate">
            {displayYear} · {(displayKms / 1000).toFixed(0)}k km · {displayCity}
          </p>
          
          {/* Row 3: Price + Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {status.type === "live" && status.bidAmount !== undefined && status.bidAmount > 0 && (
                <>
                  <span className={cn(
                    "font-bold text-base",
                    status.bidDifference !== undefined && status.bidDifference >= 0 ? "text-accent" : "text-foreground"
                  )}>
                    {formatPrice(status.bidAmount)}
                  </span>
                  {status.commission !== undefined && status.commission > 0 && (
                    <span className="text-[10px] text-warning font-medium">+{formatPrice(status.commission)}</span>
                  )}
                </>
              )}
              {status.type === "won" && status.bidAmount !== undefined && (
                <>
                  <span className="font-bold text-base text-foreground">{formatPrice(status.bidAmount)}</span>
                  {status.commission !== undefined && status.commission > 0 && (
                    <span className="text-[10px] text-warning font-medium">+{formatPrice(status.commission)}</span>
                  )}
                </>
              )}
              {status.type === "lost" && (
                <span className="text-xs text-muted-foreground truncate">
                  You: {formatPrice(status.bidAmount || 0)} · Won: {formatPrice(status.winningBid || 0)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {status.type === "live" && (
                <>
                  {status.bidDifference !== undefined && status.bidDifference >= 0 && (
                    <Badge className="bg-accent/10 text-accent border-0 text-[10px] px-1.5 h-5">Win</Badge>
                  )}
                  {status.bidDifference !== undefined && status.bidDifference < 0 && (
                    <button className="h-5 px-2 text-[10px] bg-warning text-warning-foreground rounded flex items-center gap-0.5 font-medium">
                      <TrendingUp className="w-3 h-3" /> Raise
                    </button>
                  )}
                  {auctionConfig && (
                    <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5 h-5">
                      {auctionConfig.icon}{auctionConfig.name}
                    </Badge>
                  )}
                </>
              )}
              {status.type === "won" && (
                <>
                  {status.isUrgent && status.remainingDays !== undefined && (
                    <Badge variant="destructive" className="text-[10px] gap-0.5 px-1.5 h-5">
                      <AlertTriangle className="w-3 h-3" />{status.remainingDays}d
                    </Badge>
                  )}
                  {status.serviceProgress !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-10"><Progress value={status.serviceProgress} className="h-1" /></div>
                      <span className="text-[10px] text-muted-foreground">{status.serviceProgress}%</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </>
              )}
              {status.type === "lost" && status.bidDifference !== undefined && (
                <span className="text-[10px] text-destructive font-medium">-{formatPrice(Math.abs(status.bidDifference))}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services CTA for Won Vehicles */}
      {status.type === "won" && status.showServicesCTA && (
        <div className="px-3 pb-3 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              status.onServicesClick?.();
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
            Get DriveX Services
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          </Button>
        </div>
      )}
      {status.type === "lost" && status.showInsight !== false && status.bidAmount && status.winningBid && (
        <div className="px-3 pb-3">
          <LostBidInsight
            bidAmount={status.bidAmount}
            winningBid={status.winningBid}
            bidDifference={status.bidDifference || 0}
            commissionAmount={status.commission}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleCard;