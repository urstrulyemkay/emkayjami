import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SummaryCardData } from "@/data/opsMockData";

const statusColors = {
  success: "border-l-green-500",
  warning: "border-l-yellow-500",
  danger: "border-l-red-500",
  info: "border-l-blue-500",
};

export function SummaryCard({ card }: { card: SummaryCardData }) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow border-l-4",
        statusColors[card.status]
      )}
      onClick={() => navigate(card.link)}
    >
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {card.title}
        </p>
        <div className="flex items-end justify-between mt-1">
          <span className="text-2xl font-bold">{card.value}</span>
          {card.change !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {card.change > 0 ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : card.change < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{Math.abs(card.change)} {card.changeLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
