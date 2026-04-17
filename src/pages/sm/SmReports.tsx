import { useState, useMemo } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { TimePeriodToggle, type TimePeriod } from "@/components/oem/TimePeriodToggle";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vehiclesByStore, sesByStore, auctionsByStore, computePeriodKpis, formatINR, getVehicle, STORES, SMS } from "@/data/oemMockData";
import { IndianRupee, TrendingUp, Gavel } from "lucide-react";

const STORE_ID = "s-jp";

const SmReports = () => {
  const store = STORES.find((s) => s.id === STORE_ID)!;
  const sm = SMS.find((s) => s.storeId === STORE_ID)!;
  const [period, setPeriod] = useState<TimePeriod>("30d");

  const vehicles = vehiclesByStore(STORE_ID);
  const auctions = auctionsByStore(STORE_ID);
  const ses = sesByStore(STORE_ID);
  const kpis = useMemo(() => computePeriodKpis(vehicles, auctions), [vehicles, auctions]);

  const closedDeals = auctions.filter((a) => a.status === "completed");
  const failedDeals = auctions.filter((a) => a.status === "failed");
  const total = closedDeals.length + failedDeals.length;
  const wonPct = total > 0 ? (closedDeals.length / total) * 100 : 0;

  const maxGmv = Math.max(...ses.map((s) => s.gmv30d), 1);

  return (
    <OemAppShell variant="SM" contextLabel={store.name} userName={sm.name}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Reports</h1>
          <TimePeriodToggle value={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="GMV" value={formatINR(kpis.gmv)} icon={<IndianRupee className="w-4 h-4" />} />
          <MetricCard label="Deals" value={kpis.deals} icon={<TrendingUp className="w-4 h-4" />} />
          <MetricCard label="Avg Bids" value={kpis.avgBids} icon={<Gavel className="w-4 h-4" />} />
          <MetricCard label="Conversion" value={`${kpis.conversionPct}%`} />
        </div>

        {/* Conversion bar */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-2">Conversion</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            <div className="bg-success" style={{ width: `${wonPct}%` }} />
            <div className="bg-destructive" style={{ width: `${100 - wonPct}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-success">{closedDeals.length} won</span>
            <span className="text-destructive">{failedDeals.length} failed</span>
          </div>
        </Card>

        {/* SE contribution */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">SE Contribution (GMV)</p>
          <div className="space-y-3">
            {ses.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{formatINR(s.gmv30d)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(s.gmv30d / maxGmv) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Deals table */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-2">Recent Deals</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auctions.filter((a) => a.status !== "live").slice(0, 8).map((a) => {
                const v = getVehicle(a.vehicleId);
                if (!v) return null;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{v.model}</p>
                      <p className="text-[10px] text-muted-foreground">{v.reg}</p>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {a.winner ? formatINR(a.winner.price) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === "completed" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </OemAppShell>
  );
};

export default SmReports;
