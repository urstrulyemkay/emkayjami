import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: { delta: number; positive?: boolean };
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "destructive";
  onClick?: () => void;
}

export const MetricCard = ({ label, value, sublabel, trend, icon, tone = "default", onClick }: MetricCardProps) => {
  const toneClass = {
    default: "",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    destructive: "border-destructive/30 bg-destructive/5",
  }[tone];

  return (
    <Card
      onClick={onClick}
      className={cn("p-4 transition-colors", toneClass, onClick && "cursor-pointer hover:border-foreground/30")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
      <div className="flex items-center justify-between mt-1">
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.delta === 0
                ? "text-muted-foreground"
                : trend.positive ?? trend.delta > 0
                  ? "text-success"
                  : "text-destructive",
            )}
          >
            {trend.delta === 0 ? <Minus className="w-3 h-3" /> : trend.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.delta)}%
          </div>
        )}
      </div>
    </Card>
  );
};
