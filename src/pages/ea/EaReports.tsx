import { useState } from "react";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ORG, ORG_KPIS, STORES, BRAND_MIX, AUCTIONS, getVehicle, formatINR } from "@/data/oemMockData";
import { IndianRupee, TrendingUp, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const EaReports = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const maxStore = Math.max(...STORES.map((s) => s.gmv30d), 1);

  const deals = AUCTIONS.filter((a) => statusFilter === "all" ? a.status !== "live" : a.status === statusFilter);
  const pendingPayments = AUCTIONS.filter((a) => a.status === "completed").slice(0, 3);

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Reports</h1>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Org GMV (MTD)" value={formatINR(ORG_KPIS.gmv30d)} icon={<IndianRupee className="w-4 h-4" />} />
          <MetricCard label="Total Deals" value={ORG_KPIS.deals30d} icon={<TrendingUp className="w-4 h-4" />} />
          <MetricCard label="Active Stores" value={ORG.totalStores} icon={<Building2 className="w-4 h-4" />} />
          <MetricCard label="Avg Conv" value={`${ORG_KPIS.avgConversion}%`} icon={<TrendingUp className="w-4 h-4" />} />
        </div>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">GMV by Store</p>
          <div className="space-y-3">
            {STORES.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.name.replace("Ananda Honda — ", "")}</span>
                  <span className="text-muted-foreground">{formatINR(s.gmv30d)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(s.gmv30d / maxStore) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">GMV by Brand</p>
          <div className="space-y-2">
            {BRAND_MIX.map((b) => (
              <div key={b.brand}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{b.brand}</span>
                  <span className="text-muted-foreground">{b.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Deals</p>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {deals.slice(0, 10).map((a) => {
                const v = getVehicle(a.vehicleId);
                if (!v) return null;
                return (
                  <TableRow key={a.id}>
                    <TableCell><p className="text-sm font-medium">{v.model}</p><p className="text-[10px] text-muted-foreground">{v.reg}</p></TableCell>
                    <TableCell className="text-sm font-medium">{a.winner ? formatINR(a.winner.price) : "—"}</TableCell>
                    <TableCell>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", a.status === "completed" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                        {a.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <p className="text-sm font-semibold">Payment Status</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{pendingPayments.length} payments pending settlement</p>
          <div className="space-y-2">
            {pendingPayments.map((a) => {
              const v = getVehicle(a.vehicleId);
              if (!v) return null;
              return (
                <div key={a.id} className="flex justify-between items-center text-sm">
                  <div><p className="font-medium">{v.model}</p><p className="text-[10px] text-muted-foreground">{a.winner?.broker}</p></div>
                  <span className="font-semibold">{formatINR(a.winner?.price ?? 0)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </OemAppShell>
  );
};

export default EaReports;
