import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { StoreCard } from "@/components/oem/StoreCard";
import { AuctionMiniCard } from "@/components/oem/AuctionMiniCard";
import { AlertBanner } from "@/components/oem/AlertBanner";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STORES, GM, AUCTIONS, ORG_KPIS, formatINR, SMS, getStore } from "@/data/oemMockData";
import { IndianRupee, Gavel, Building2, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GmDashboard = () => {
  const navigate = useNavigate();
  const liveAuctions = AUCTIONS.filter((a) => a.status === "live");
  const lowStores = STORES.filter((s) => s.conversionPct < 65);

  return (
    <OemAppShell variant="GM" contextLabel="Bengaluru Region · 4 stores" userName={GM.name}>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-sm text-muted-foreground">Hello,</p>
          <h2 className="text-xl font-bold">{GM.name.split(" ")[0]}</h2>
        </div>

        {lowStores.length > 0 && (
          <AlertBanner
            type="alert"
            title={`${lowStores.length} store${lowStores.length > 1 ? "s" : ""} below conversion threshold`}
            body={lowStores.map((s) => s.name.replace("Ananda Honda — ", "")).join(", ")}
            onClick={() => navigate("/gm/stores")}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Region GMV (30d)" value={formatINR(ORG_KPIS.gmv30d)} icon={<IndianRupee className="w-4 h-4" />} trend={{ delta: 8, positive: true }} />
          <MetricCard label="Deals (30d)" value={ORG_KPIS.deals30d} icon={<TrendingUp className="w-4 h-4" />} trend={{ delta: 5, positive: true }} />
          <MetricCard label="Live Auctions" value={ORG_KPIS.liveAuctions} icon={<Gavel className="w-4 h-4" />} />
          <MetricCard label="Avg Conversion" value={`${ORG_KPIS.avgConversion}%`} icon={<Building2 className="w-4 h-4" />} />
        </div>

        {/* Store health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Store Health</p>
            <button onClick={() => navigate("/gm/stores")} className="text-xs text-primary font-medium flex items-center">
              All stores <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid gap-2">
            {STORES.map((s) => <StoreCard key={s.id} store={s} onClick={() => navigate(`/gm/store/${s.id}`)} />)}
          </div>
        </div>

        {/* Comparison table */}
        <Card className="p-3">
          <p className="text-sm font-semibold mb-2">Store Comparison</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card">Store</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Conv</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STORES.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate(`/gm/store/${s.id}`)}>
                    <TableCell className="sticky left-0 bg-card font-medium text-xs">{s.name.replace("Ananda Honda — ", "")}</TableCell>
                    <TableCell className="text-right text-sm">{s.vehiclesActive}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatINR(s.gmv30d)}</TableCell>
                    <TableCell className={cn("text-right text-sm font-semibold", s.conversionPct < 65 ? "text-destructive" : s.conversionPct < 75 ? "text-warning" : "text-success")}>
                      {s.conversionPct}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Live auctions */}
        {liveAuctions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Live Across Stores ({liveAuctions.length})</p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
              {liveAuctions.map((a) => <AuctionMiniCard key={a.id} auction={a} onClick={() => navigate("/gm/auctions")} />)}
            </div>
          </div>
        )}

        {/* SM activity */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Sales Managers</p>
          <Card className="divide-y">
            {SMS.map((sm) => {
              const st = getStore(sm.storeId);
              return (
                <div key={sm.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{sm.name}</p>
                    <p className="text-[10px] text-muted-foreground">{st?.name.replace("Ananda Honda — ", "")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(st?.gmv30d ?? 0)}</p>
                    <p className="text-[10px] text-muted-foreground">{st?.vehiclesClosed30d} deals</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </OemAppShell>
  );
};

export default GmDashboard;
