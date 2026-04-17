import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { VehiclePipelineBar } from "@/components/oem/VehiclePipelineBar";
import { AlertBanner } from "@/components/oem/AlertBanner";
import { AuctionMiniCard } from "@/components/oem/AuctionMiniCard";
import { SEPerformanceRow } from "@/components/oem/SEPerformanceRow";
import { TimePeriodToggle, type TimePeriod } from "@/components/oem/TimePeriodToggle";
import { VehicleDetailSheet } from "@/components/oem/VehicleDetailSheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  STORES, SMS, vehiclesByStore, sesByStore, auctionsByStore,
  stageCounts, computePeriodKpis, formatINR, getVehicle,
} from "@/data/oemMockData";
import { ChevronRight, IndianRupee, Gavel, CheckCircle2, TrendingUp } from "lucide-react";
import type { Vehicle } from "@/data/oemTypes";

// Demo: Sales Manager for Jayanagar
const STORE_ID = "s-jp";

const SmDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TimePeriod>("today");
  const [selectedVeh, setSelectedVeh] = useState<Vehicle | null>(null);

  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const vehicles = useMemo(() => vehiclesByStore(STORE_ID), []);
  const auctions = useMemo(() => auctionsByStore(STORE_ID), []);
  const ses = useMemo(() => sesByStore(STORE_ID), []);
  const counts = useMemo(() => stageCounts(vehicles), [vehicles]);
  const kpis = useMemo(() => computePeriodKpis(vehicles, auctions), [vehicles, auctions]);

  const liveAuctions = auctions.filter((a) => a.status === "live");
  const recentResults = auctions.filter((a) => a.status === "completed" || a.status === "failed").slice(0, 4);
  const actionRequired = vehicles.filter((v) => v.daysInStage >= 4 && (v.stage === "listed" || v.stage === "inspected"));

  return (
    <OemAppShell variant="SM" contextLabel={store.name} userName={sm.name}>
      <div className="p-4 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">Good morning,</p>
          <h2 className="text-xl font-bold">{sm.name.split(" ")[0]}</h2>
        </div>

        {/* Alerts */}
        {actionRequired.length > 0 && (
          <AlertBanner
            type="warning"
            title={`${actionRequired.length} vehicle${actionRequired.length > 1 ? "s" : ""} stuck in pipeline`}
            body="Stuck >4 days. Review & take action."
            onClick={() => navigate("/sm/pipeline")}
          />
        )}

        {/* Pulse */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Today's Pulse</p>
            <TimePeriodToggle value={period} onChange={setPeriod} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="GMV" value={formatINR(kpis.gmv)} sublabel={`${kpis.deals} deals`} trend={{ delta: 12, positive: true }} icon={<IndianRupee className="w-4 h-4" />} onClick={() => navigate("/sm/reports")} />
            <MetricCard label="Conversion" value={`${kpis.conversionPct}%`} sublabel="vs reserve" trend={{ delta: 4, positive: true }} icon={<TrendingUp className="w-4 h-4" />} onClick={() => navigate("/sm/reports")} />
            <MetricCard label="Avg Bids" value={kpis.avgBids} sublabel="per auction" icon={<Gavel className="w-4 h-4" />} onClick={() => navigate("/sm/auctions")} />
            <MetricCard label="Closed" value={kpis.deals} sublabel="this period" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => navigate("/sm/auctions")} />
          </div>
        </div>

        {/* Pipeline */}
        <Card className="p-4">
          <VehiclePipelineBar counts={counts} onStageClick={() => navigate("/sm/pipeline")} />
        </Card>

        {/* Live auctions */}
        {liveAuctions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Live Auctions ({liveAuctions.length})</p>
              <button onClick={() => navigate("/sm/auctions")} className="text-xs text-primary font-medium flex items-center">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x pb-1 -mx-4 px-4">
              {liveAuctions.map((a) => (
                <AuctionMiniCard key={a.id} auction={a} onClick={() => navigate("/sm/auctions")} />
              ))}
            </div>
          </div>
        )}

        {/* Action required */}
        {actionRequired.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Action Required</p>
            <div className="space-y-2">
              {actionRequired.slice(0, 3).map((v) => (
                <Card key={v.id} onClick={() => setSelectedVeh(v)} className="p-3 flex items-center gap-3 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.model} · {v.reg}</p>
                    <p className="text-xs text-muted-foreground">Stuck in {v.stage} for {v.daysInStage}d</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Team activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Team Activity</p>
            <button onClick={() => navigate("/sm/team")} className="text-xs text-primary font-medium flex items-center">
              View team <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {ses.map((se) => <SEPerformanceRow key={se.id} se={se} onClick={() => navigate("/sm/team")} />)}
          </div>
        </div>

        {/* Recent results */}
        {recentResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recent Results</p>
            <div className="space-y-2">
              {recentResults.map((a) => {
                const v = getVehicle(a.vehicleId);
                if (!v) return null;
                return (
                  <Card key={a.id} className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setSelectedVeh(v)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.model}</p>
                      <p className="text-xs text-muted-foreground">{v.reg}</p>
                    </div>
                    <div className="text-right">
                      {a.status === "completed" && a.winner ? (
                        <>
                          <p className="text-sm font-semibold text-success">{formatINR(a.winner.price)}</p>
                          <p className="text-[10px] text-muted-foreground">{a.winner.broker}</p>
                        </>
                      ) : (
                        <p className="text-xs text-destructive font-medium">Failed</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <VehicleDetailSheet vehicle={selectedVeh} open={!!selectedVeh} onOpenChange={(o) => !o && setSelectedVeh(null)} />
    </OemAppShell>
  );
};

export default SmDashboard;
