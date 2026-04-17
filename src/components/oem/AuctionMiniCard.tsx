import { Card } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
import type { Auction } from "@/data/oemTypes";
import { getVehicle, formatINR } from "@/data/oemMockData";
import { cn } from "@/lib/utils";

export const AuctionMiniCard = ({ auction, onClick }: { auction: Auction; onClick?: () => void }) => {
  const v = getVehicle(auction.vehicleId);
  if (!v) return null;
  const minsLeft = Math.max(0, Math.round((new Date(auction.endTime).getTime() - Date.now()) / 60000));
  const critical = minsLeft < 5;

  return (
    <Card
      onClick={onClick}
      className="min-w-[220px] p-3 cursor-pointer hover:border-foreground/30 transition-colors snap-start"
    >
      <p className="text-sm font-semibold truncate">{v.model}</p>
      <p className="text-xs text-muted-foreground truncate">{v.reg}</p>
      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Highest</p>
          <p className="text-base font-bold">{auction.highestBid ? formatINR(auction.highestBid) : "—"}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
            <Users className="w-3 h-3" /> {auction.bidCount}
          </div>
          <div className={cn("flex items-center gap-1 text-xs font-medium justify-end mt-0.5", critical ? "text-destructive" : "text-foreground")}>
            <Clock className="w-3 h-3" /> {minsLeft}m
          </div>
        </div>
      </div>
    </Card>
  );
};
