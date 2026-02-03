import { Badge } from "@/components/ui/badge";
import {
  Clock,
  TrendingDown,
  Target,
  Zap,
  Lightbulb,
  UserX,
  Building2,
  Ban,
  ShieldX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LossReason = 
  | "outbid_late" 
  | "price_gap" 
  | "close_call" 
  | "no_commission"
  | "customer_backed_out"
  | "oem_counter_rejected"
  | "deal_cancelled"
  | "documents_issue";

interface LostBidInsightProps {
  bidAmount: number;
  winningBid: number;
  bidDifference: number;
  auctionType?: string;
  commissionAmount?: number;
  lossReason?: LossReason; // Allow external reason override
  className?: string;
}

// Analyze the loss and determine the reason
export const analyzeLoss = (
  bidAmount: number,
  winningBid: number,
  commissionAmount?: number,
  externalReason?: LossReason
): { reason: LossReason; severity: "low" | "medium" | "high" } => {
  // If external reason provided, use it
  if (externalReason) {
    const severityMap: Record<LossReason, "low" | "medium" | "high"> = {
      close_call: "low",
      outbid_late: "medium",
      no_commission: "medium",
      price_gap: "high",
      customer_backed_out: "low",
      oem_counter_rejected: "medium",
      deal_cancelled: "low",
      documents_issue: "medium",
    };
    return { reason: externalReason, severity: severityMap[externalReason] };
  }

  const difference = winningBid - bidAmount;
  const percentageDiff = (difference / bidAmount) * 100;

  // Simulate some variety in reasons (in real app, this would come from backend)
  const randomFactor = Math.random();
  
  // 15% chance it was customer/OEM related
  if (randomFactor < 0.08) {
    return { reason: "customer_backed_out", severity: "low" };
  }
  if (randomFactor < 0.15) {
    return { reason: "oem_counter_rejected", severity: "medium" };
  }

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
    isExternalFactor: boolean;
  }> = {
    close_call: {
      icon: <Target className="w-3 h-3" />,
      label: "So Close!",
      tip: "Add ₹2-5k commission next time",
      color: "text-warning",
      bgColor: "bg-warning/10",
      isExternalFactor: false,
    },
    outbid_late: {
      icon: <Clock className="w-3 h-3" />,
      label: "Outbid",
      tip: "Stay active in final minutes",
      color: "text-info",
      bgColor: "bg-info/10",
      isExternalFactor: false,
    },
    price_gap: {
      icon: <TrendingDown className="w-3 h-3" />,
      label: "Below Market",
      tip: "Research similar vehicles first",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      isExternalFactor: false,
    },
    no_commission: {
      icon: <Zap className="w-3 h-3" />,
      label: "No Commission",
      tip: "Commission boosts Effective Score",
      color: "text-primary",
      bgColor: "bg-primary/10",
      isExternalFactor: false,
    },
    customer_backed_out: {
      icon: <UserX className="w-3 h-3" />,
      label: "Customer Backed Out",
      tip: "Not your fault - deal fell through",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      isExternalFactor: true,
    },
    oem_counter_rejected: {
      icon: <Building2 className="w-3 h-3" />,
      label: "OEM Rejected",
      tip: "OEM accepted a different offer",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      isExternalFactor: true,
    },
    deal_cancelled: {
      icon: <Ban className="w-3 h-3" />,
      label: "Deal Cancelled",
      tip: "Auction was cancelled by admin",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      isExternalFactor: true,
    },
    documents_issue: {
      icon: <ShieldX className="w-3 h-3" />,
      label: "Document Issues",
      tip: "Vehicle had documentation problems",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      isExternalFactor: true,
    },
  };
  return configs[reason];
};

const LostBidInsight = ({
  bidAmount,
  winningBid,
  bidDifference,
  commissionAmount,
  lossReason,
  className,
}: LostBidInsightProps) => {
  const { reason } = analyzeLoss(bidAmount, winningBid, commissionAmount, lossReason);
  const config = getInsightConfig(reason);

  return (
    <div className={cn("mt-2 pt-2 border-t border-dashed", className)}>
      {/* Insight Row */}
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded", config.bgColor, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
            {config.isExternalFactor && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 text-muted-foreground">
                External
              </Badge>
            )}
          </div>
          {/* Smart Tip */}
          <div className="flex items-center gap-1 mt-0.5">
            <Lightbulb className="w-2.5 h-2.5 text-warning shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              {config.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostBidInsight;
