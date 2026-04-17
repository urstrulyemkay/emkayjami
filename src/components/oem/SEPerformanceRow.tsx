import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import type { SalesExecutive } from "@/data/oemTypes";
import { formatINR } from "@/data/oemMockData";
import { cn } from "@/lib/utils";

export const SEPerformanceRow = ({ se, onClick }: { se: SalesExecutive; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
  >
    <Avatar className="w-9 h-9">
      <AvatarFallback className="text-xs bg-primary/10 text-primary">
        {se.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0 text-left">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium truncate">{se.name}</p>
        {!se.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>}
      </div>
      <p className="text-xs text-muted-foreground">
        {se.vehiclesActive} active · {se.vehiclesClosed30d} closed · {formatINR(se.gmv30d)}
      </p>
    </div>
    <div className="text-right">
      <p className={cn("text-sm font-semibold", se.conversionPct >= 70 ? "text-success" : se.conversionPct >= 60 ? "text-foreground" : "text-destructive")}>
        {se.conversionPct}%
      </p>
      <p className="text-[10px] text-muted-foreground">conv</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);
