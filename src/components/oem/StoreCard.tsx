import { Card } from "@/components/ui/card";
import { ChevronRight, MapPin, AlertTriangle } from "lucide-react";
import type { Store } from "@/data/oemTypes";
import { formatINR } from "@/data/oemMockData";
import { cn } from "@/lib/utils";

export const StoreCard = ({ store, onClick }: { store: Store; onClick?: () => void }) => {
  const lowConv = store.conversionPct < 65;
  return (
    <Card
      onClick={onClick}
      className={cn("p-4 cursor-pointer hover:border-foreground/30 transition-colors", lowConv && "border-destructive/30")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{store.name}</p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{store.city}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active</p>
          <p className="text-base font-semibold">{store.vehiclesActive}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">GMV 30d</p>
          <p className="text-base font-semibold">{formatINR(store.gmv30d)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Conv.</p>
          <p className={cn("text-base font-semibold", lowConv ? "text-destructive" : "text-foreground")}>
            {store.conversionPct}%
          </p>
        </div>
      </div>

      {store.attentionFlags > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-warning-foreground bg-warning/10 px-2 py-1 rounded-md">
          <AlertTriangle className="w-3 h-3 text-warning" />
          {store.attentionFlags} item{store.attentionFlags > 1 ? "s" : ""} need attention
        </div>
      )}
    </Card>
  );
};
