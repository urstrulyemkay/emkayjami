import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GM, STORES, ORG_KPIS, AUCTIONS, formatINR } from "@/data/oemMockData";
import { IndianRupee, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const GmReports = () => {
  const maxGmv = Math.max(...STORES.map((s) => s.gmv30d), 1);
  const failureReasons = AUCTIONS.filter((a) => a.status === "failed").reduce((acc, a) => {
    const r = a.failureReason ?? "Unknown";
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalFailed = Object.values(failureReasons).reduce((a, b) => a + b, 0);

  return (
    <OemAppShell variant="GM" contextLabel="Bengaluru Region · 4 stores" userName={GM.name}>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Reports</h1>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Region GMV" value={formatINR(ORG_KPIS.gmv30d)} icon={<IndianRupee className="w-4 h-4" />} />
          <MetricCard label="Total Deals" value={ORG_KPIS.deals30d} icon={<TrendingUp className="w-4 h-4" />} />
        </div>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Store Contribution (GMV 30d)</p>
          <div className="space-y-3">
            {STORES.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{s.name.replace("Ananda Honda — ", "")}</span>
                  <span className="text-muted-foreground">{formatINR(s.gmv30d)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(s.gmv30d / maxGmv) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Failure Analysis</p>
          {totalFailed === 0 ? (
            <p className="text-sm text-muted-foreground">No failed auctions in the period.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(failureReasons).map(([r, n]) => (
                <div key={r} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r}</span>
                  <span className="font-semibold">{n} ({Math.round((n / totalFailed) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-2">Performance Table</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">GMV</TableHead>
                <TableHead className="text-right">Conv</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STORES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-xs">{s.name.replace("Ananda Honda — ", "")}</TableCell>
                  <TableCell className="text-right text-sm">{s.vehiclesClosed30d}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatINR(s.gmv30d)}</TableCell>
                  <TableCell className={cn("text-right text-sm font-semibold", s.conversionPct < 65 ? "text-destructive" : "text-foreground")}>{s.conversionPct}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </OemAppShell>
  );
};

export default GmReports;
