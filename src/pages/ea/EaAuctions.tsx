import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ORG, AUCTIONS, getVehicle, formatINR } from "@/data/oemMockData";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const Row = ({ id }: { id: string }) => {
  const a = AUCTIONS.find((x) => x.id === id)!;
  const v = getVehicle(a.vehicleId);
  if (!v) return null;
  const minsLeft = Math.max(0, Math.round((new Date(a.endTime).getTime() - Date.now()) / 60000));
  return (
    <Card className="p-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{v.model}</p>
        <p className="text-xs text-muted-foreground">{v.reg}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{a.highestBid ? formatINR(a.highestBid) : a.winner ? formatINR(a.winner.price) : "—"}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
          {a.status === "live" ? <><Clock className="w-2.5 h-2.5" />{minsLeft}m</> : <><Users className="w-2.5 h-2.5" />{a.bidCount}</>}
        </p>
      </div>
    </Card>
  );
};

const EaAuctions = () => {
  const live = AUCTIONS.filter((a) => a.status === "live");
  const completed = AUCTIONS.filter((a) => a.status === "completed");
  const failed = AUCTIONS.filter((a) => a.status === "failed");
  const [tab, setTab] = useState("live");

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Auctions</h1>
        <Card className="p-3 flex divide-x">
          <div className="flex-1 text-center"><p className="text-xl font-bold">{live.length}</p><p className="text-[10px] text-muted-foreground uppercase">Live</p></div>
          <div className="flex-1 text-center"><p className="text-xl font-bold">{completed.length}</p><p className="text-[10px] text-muted-foreground uppercase">Done</p></div>
          <div className={cn("flex-1 text-center", failed.length > 0 && "text-destructive")}><p className="text-xl font-bold">{failed.length}</p><p className="text-[10px] uppercase">Failed</p></div>
          <div className="flex-1 text-center"><p className="text-xl font-bold">{AUCTIONS.length}</p><p className="text-[10px] text-muted-foreground uppercase">Total</p></div>
        </Card>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="space-y-2 mt-3">{live.map((a) => <Row key={a.id} id={a.id} />)}</TabsContent>
          <TabsContent value="scheduled" className="mt-3 text-center text-sm text-muted-foreground py-8">No scheduled auctions</TabsContent>
          <TabsContent value="completed" className="space-y-2 mt-3">{completed.map((a) => <Row key={a.id} id={a.id} />)}</TabsContent>
          <TabsContent value="failed" className="space-y-2 mt-3">{failed.map((a) => <Row key={a.id} id={a.id} />)}</TabsContent>
        </Tabs>
      </div>
    </OemAppShell>
  );
};

export default EaAuctions;
