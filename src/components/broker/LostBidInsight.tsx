import { Badge } from "@/components/ui/badge";
import {
  Clock,
  TrendingDown,
  Target,
  Zap,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LossReason = "outbid_late" | "price_gap" | "close_call" | "no_commission";

interface LostBidInsightProps {
  bidAmount: number;
  winningBid: number;
  bidDifference: number;
  auctionType?: string;
  commissionAmount?: number;
  className?: string;
}

// Analyze the loss and determine the reason
export const analyzeLoss = (
  bidAmount: number,
  winningBid: number,
  commissionAmount?: number
): { reason: LossReason; severity: "low" | "medium" | "high" } => {
  const difference = winningBid - bidAmount;
  const percentageDiff = (difference / bidAmount) * 100;

  // Close call - lost by less than 5%
  if (percentageDiff < 5) {
    return { reason: "close_call", severity: "low" };
  }

  // No commission added - could have won with commission
  if ((!commissionAmount || commissionAmount === 0) && percentageDiff < 10) {
    return { reason: "no_commission", severity: "medium" };
  }

  // Significant price gap
  if (percentageDiff >= 15) {
    return { reason: "price_gap", severity: "high" };
  }

  // Default - outbid
  return { reason: "outbid_late", severity: "medium" };
};

const getInsightConfig = (reason: LossReason) => {
  const configs: Record<LossReason, {
    icon: React.ReactNode;
    label: string;
    tip: string;
    color: string;
    bgColor: string;
  }> = {
    close_call: {
      icon: <Target className="w-3 h-3" />,
      label: "So Close!",
      tip: "Add ₹2-5k commission next time",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    outbid_late: {
      icon: <Clock className="w-3 h-3" />,
      label: "Outbid",
      tip: "Stay active in final minutes",
      color: "text-info",
      bgColor: "bg-info/10",
    },
    price_gap: {
      icon: <TrendingDown className="w-3 h-3" />,
      label: "Below Market",
      tip: "Research similar vehicles",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    no_commission: {
      icon: <Zap className="w-3 h-3" />,
      label: "No Commission",
      tip: "Commission boosts Effective Score",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  };
  return configs[reason];
};

const formatPrice = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${(amount / 1000).toFixed(0)}k`;
};

const LostBidInsight = ({
  bidAmount,
  winningBid,
  bidDifference,
  commissionAmount,
  className,
}: LostBidInsightProps) => {
  const { reason, severity } = analyzeLoss(bidAmount, winningBid, commissionAmount);
  const config = getInsightConfig(reason);
  const percentageDiff = ((bidDifference) / bidAmount * 100).toFixed(0);

  return (
    <div className={cn("mt-2 pt-2 border-t border-dashed", className)}>
      {/* Insight Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded", config.bgColor, config.color)}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-xs font-medium", config.color)}>
                {config.label}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] px-1 py-0 h-3.5",
                  severity === "low" && "border-warning/50 text-warning",
                  severity === "medium" && "border-info/50 text-info",
                  severity === "high" && "border-destructive/50 text-destructive"
                )}
              >
                -{percentageDiff}%
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick comparison */}
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">
            Gap: <span className="font-medium text-destructive">{formatPrice(bidDifference)}</span>
          </p>
        </div>
      </div>

      {/* Smart Tip */}
      <div className="flex items-center gap-1.5 mt-1.5 pl-7">
        <Lightbulb className="w-3 h-3 text-warning shrink-0" />
        <p className="text-[10px] text-muted-foreground italic">
          {config.tip}
        </p>
      </div>
    </div>
  );
};

export default LostBidInsight;
