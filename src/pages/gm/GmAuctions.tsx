import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { GM, AUCTIONS, STORES, getVehicle, formatINR } from "@/data/oemMockData";
import { ChevronDown, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const AuctionRow = ({ auctionId }: { auctionId: string }) => {
  const a = AUCTIONS.find((x) => x.id === auctionId)!;
  const v = getVehicle(a.vehicleId);
  if (!v) return null;
  const minsLeft = Math.max(0, Math.round((new Date(a.endTime).getTime() - Date.now()) / 60000));
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{v.model}</p>
          <p className="text-xs text-muted-foreground">{v.reg}</p>
        </div>
        {a.status === "live" && (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", minsLeft < 5 ? "bg-destructive text-destructive-foreground" : "bg-stage-live/15 text-stage-live")}>
            <Clock className="w-2.5 h-2.5 inline mr-1" />{minsLeft}m
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground"><Users className="w-3 h-3 inline mr-1" />{a.bidCount} bids</p>
        <p className="text-sm font-semibold">{a.highestBid ? formatINR(a.highestBid) : a.winner ? formatINR(a.winner.price) : "—"}</p>
      </div>
    </Card>
  );
};

const GmAuctions = () => {
  const [tab, setTab] = useState("live");
  const live = AUCTIONS.filter((a) => a.status === "live");
  const completed = AUCTIONS.filter((a) => a.status === "completed");
  const failed = AUCTIONS.filter((a) => a.status === "failed");

  return (
    <OemAppShell variant="GM" contextLabel="Bengaluru Region · 4 stores" userName={GM.name}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Auctions</h1>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
            <TabsTrigger value="bystore">By Store</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="space-y-2 mt-3">
            {live.map((a) => <AuctionRow key={a.id} auctionId={a.id} />)}
          </TabsContent>
          <TabsContent value="bystore" className="space-y-2 mt-3">
            {STORES.map((s) => {
              const storeAucs = AUCTIONS.filter((a) => {
                const v = getVehicle(a.vehicleId);
                return v?.storeId === s.id && a.status === "live";
              });
              return (
                <Collapsible key={s.id} defaultOpen>
                  <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div className="text-left">
                      <p className="text-sm font-medium">{s.name.replace("Ananda Honda — ", "")}</p>
                      <p className="text-[10px] text-muted-foreground">{storeAucs.length} live</p>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2 pl-2">
                    {storeAucs.length === 0 ? <p className="text-xs text-muted-foreground p-2">No live auctions</p>
                      : storeAucs.map((a) => <AuctionRow key={a.id} auctionId={a.id} />)}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </TabsContent>
          <TabsContent value="completed" className="space-y-2 mt-3">
            {completed.map((a) => <AuctionRow key={a.id} auctionId={a.id} />)}
          </TabsContent>
          <TabsContent value="failed" className="space-y-2 mt-3">
            {failed.map((a) => <AuctionRow key={a.id} auctionId={a.id} />)}
          </TabsContent>
        </Tabs>
      </div>
    </OemAppShell>
  );
};

export default GmAuctions;
