import { useMemo, useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auctionsByStore, STORES, SMS, getVehicle, formatINR } from "@/data/oemMockData";
import { Clock, Users, RotateCcw, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/oem/EmptyState";

const STORE_ID = "s-jp";

const AuctionRow = ({ auctionId }: { auctionId: string }) => {
  const auctions = auctionsByStore(STORE_ID);
  const a = auctions.find((x) => x.id === auctionId)!;
  const v = getVehicle(a.vehicleId);
  if (!v) return null;
  const minsLeft = Math.max(0, Math.round((new Date(a.endTime).getTime() - Date.now()) / 60000));
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{v.model}</p>
          <p className="text-xs text-muted-foreground">{v.reg} · {v.year}</p>
        </div>
        {a.status === "live" && (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", minsLeft < 5 ? "bg-destructive text-destructive-foreground" : "bg-stage-live/15 text-stage-live")}>
            LIVE · {minsLeft}m
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Reserve</p>
          <p className="text-sm font-semibold">{formatINR(a.reservePrice)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Highest</p>
          <p className="text-sm font-semibold">{a.highestBid ? formatINR(a.highestBid) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Bids</p>
          <p className="text-sm font-semibold flex items-center gap-1"><Users className="w-3 h-3" />{a.bidCount}</p>
        </div>
      </div>
      {a.status === "completed" && a.winner && (
        <p className="text-xs text-success mt-2">Sold to {a.winner.broker} for {formatINR(a.winner.price)}</p>
      )}
      {a.status === "failed" && (
        <>
          <p className="text-xs text-destructive mt-2">{a.failureReason ?? "No bids"}</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1"><RotateCcw className="w-3.5 h-3.5" />Re-list</Button>
            <Button size="sm" variant="outline" className="flex-1"><Edit3 className="w-3.5 h-3.5" />Revise</Button>
          </div>
        </>
      )}
    </Card>
  );
};

const SmAuctions = () => {
  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const auctions = useMemo(() => auctionsByStore(STORE_ID), []);
  const [tab, setTab] = useState("live");

  const groups = {
    live: auctions.filter((a) => a.status === "live"),
    scheduled: auctions.filter((a) => a.status === "scheduled"),
    completed: auctions.filter((a) => a.status === "completed"),
    failed: auctions.filter((a) => a.status === "failed"),
  };

  return (
    <OemAppShell variant="SM" contextLabel={store.name} userName={sm.name}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Auctions</h1>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="live">Live ({groups.live.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Done ({groups.completed.length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({groups.failed.length})</TabsTrigger>
          </TabsList>
          {(["live", "scheduled", "completed", "failed"] as const).map((k) => (
            <TabsContent key={k} value={k} className="space-y-2 mt-3">
              {groups[k].length === 0 ? (
                <EmptyState icon={<Clock className="w-5 h-5" />} title={`No ${k} auctions`} />
              ) : (
                groups[k].map((a) => <AuctionRow key={a.id} auctionId={a.id} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </OemAppShell>
  );
};

export default SmAuctions;
