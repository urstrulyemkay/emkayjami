import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { VehiclePipelineBar } from "@/components/oem/VehiclePipelineBar";
import { AuctionMiniCard } from "@/components/oem/AuctionMiniCard";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IndianRupee, Gavel, CheckCircle2, TrendingUp } from "lucide-react";
import {
  STORES, GM, vehiclesByStore, sesByStore, auctionsByStore,
  stageCounts, computePeriodKpis, formatINR, getVehicle, getSm,
} from "@/data/oemMockData";

const GmStoreDetail = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const store = STORES.find((s) => s.id === storeId);

  if (!store) return <div className="p-6">Store not found.</div>;

  const sm = getSm(store.smId);
  const vehicles = useMemo(() => vehiclesByStore(store.id), [store.id]);
  const auctions = useMemo(() => auctionsByStore(store.id), [store.id]);
  const ses = useMemo(() => sesByStore(store.id), [store.id]);
  const counts = useMemo(() => stageCounts(vehicles), [vehicles]);
  const kpis = useMemo(() => computePeriodKpis(vehicles, auctions), [vehicles, auctions]);
  const live = auctions.filter((a) => a.status === "live");
  const recent = auctions.filter((a) => a.status === "completed" || a.status === "failed").slice(0, 4);

  return (
    <OemAppShell variant="GM" contextLabel={store.name} userName={GM.name}>
      <div className="p-4 space-y-5">
        <button onClick={() => navigate("/gm/stores")} className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="w-3 h-3" /> All stores
        </button>

        <div>
          <h2 className="text-xl font-bold">{store.name}</h2>
          {sm && <p className="text-xs text-muted-foreground">SM: {sm.name} · {sm.phone}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="GMV (30d)" value={formatINR(store.gmv30d)} icon={<IndianRupee className="w-4 h-4" />} />
          <MetricCard label="Conversion" value={`${store.conversionPct}%`} icon={<TrendingUp className="w-4 h-4" />} tone={store.conversionPct < 65 ? "destructive" : "default"} />
          <MetricCard label="Avg Bids" value={store.avgBidsPerAuction} icon={<Gavel className="w-4 h-4" />} />
          <MetricCard label="Closed (30d)" value={store.vehiclesClosed30d} icon={<CheckCircle2 className="w-4 h-4" />} />
        </div>

        <Card className="p-4">
          <VehiclePipelineBar counts={counts} />
        </Card>

        {live.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Live Auctions ({live.length})</p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
              {live.map((a) => <AuctionMiniCard key={a.id} auction={a} />)}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold">Team ({ses.length})</p>
          <div className="space-y-2">
            {ses.map((se) => <SEPerformanceRow key={se.id} se={se} />)}
          </div>
        </div>

        {recent.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recent Results</p>
            {recent.map((a) => {
              const v = getVehicle(a.vehicleId);
              if (!v) return null;
              return (
                <Card key={a.id} className="p-3 flex items-center justify-between">
                  <div><p className="text-sm font-medium">{v.model}</p><p className="text-xs text-muted-foreground">{v.reg}</p></div>
                  <div className="text-right">
                    {a.winner ? <p className="text-sm font-semibold text-success">{formatINR(a.winner.price)}</p> : <p className="text-xs text-destructive">Failed</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => navigate("/gm/stores")}>Back to stores</Button>
      </div>
    </OemAppShell>
  );
};

export default GmStoreDetail;
