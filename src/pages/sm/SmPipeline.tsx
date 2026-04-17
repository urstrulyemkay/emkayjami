import { useMemo, useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/oem/StageBadge";
import { VehicleDetailSheet } from "@/components/oem/VehicleDetailSheet";
import { EmptyState } from "@/components/oem/EmptyState";
import { vehiclesByStore, STORES, SMS, formatINR, STAGE_LABELS } from "@/data/oemMockData";
import type { Stage, Vehicle } from "@/data/oemTypes";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STORE_ID = "s-jp";
const STAGES: Array<Stage | "all"> = ["all", "registered", "inspected", "listed", "live", "allocated", "transit", "closed", "failed"];

const SmPipeline = () => {
  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => {
    return vehiclesByStore(STORE_ID).filter((v) => {
      if (stage !== "all" && v.stage !== stage) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return v.reg.toLowerCase().includes(s) || v.model.toLowerCase().includes(s);
    });
  }, [q, stage]);

  return (
    <OemAppShell variant="SM" contextLabel={store.name} userName={sm.name}>
      <div className="p-4 space-y-3">
        <h1 className="text-xl font-bold">Pipeline</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reg or model" className="pl-9" />
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors",
                stage === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All" : STAGE_LABELS[s]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Filter className="w-5 h-5" />} title="No vehicles" body="Try changing the filter or search." />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <Card key={v.id} onClick={() => setSelected(v)} className="p-3 cursor-pointer hover:border-foreground/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{v.model} · {v.year}</p>
                    <p className="text-xs text-muted-foreground">{v.reg} · {v.km.toLocaleString("en-IN")} km</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StageBadge stage={v.stage} />
                      <span className="text-[10px] text-muted-foreground">{v.daysInStage}d in stage</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {(v.highestBid ?? v.finalPrice ?? v.listedPrice) != null && (
                      <p className="text-sm font-semibold">{formatINR(v.highestBid ?? v.finalPrice ?? v.listedPrice!)}</p>
                    )}
                    <Button size="sm" variant="outline" className="mt-2" onClick={(e) => { e.stopPropagation(); setSelected(v); }}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <VehicleDetailSheet vehicle={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </OemAppShell>
  );
};

export default SmPipeline;
