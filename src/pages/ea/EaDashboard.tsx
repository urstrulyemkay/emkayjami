import { useNavigate } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { MetricCard } from "@/components/oem/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ORG, ORG_KPIS, GMV_TREND_6M, BRAND_MIX, STORES, formatINR,
} from "@/data/oemMockData";
import { IndianRupee, TrendingUp, Building2, Users, Plus, FileText, Crown, ChevronRight } from "lucide-react";

const EaDashboard = () => {
  const navigate = useNavigate();
  const maxTrend = Math.max(...GMV_TREND_6M.map((m) => m.gmv));

  return (
    <OemAppShell variant="EA" contextLabel={ORG.name} userName="Admin">
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-oem flex items-center justify-center">
            <Crown className="w-5 h-5 text-oem-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Organization</p>
            <h2 className="text-lg font-bold">{ORG.name}</h2>
          </div>
        </div>

        {/* Org Scorecard */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="GMV (MTD)" value={formatINR(ORG_KPIS.gmv30d)} icon={<IndianRupee className="w-4 h-4" />} trend={{ delta: 14, positive: true }} />
          <MetricCard label="Deals" value={ORG_KPIS.deals30d} icon={<TrendingUp className="w-4 h-4" />} trend={{ delta: 9, positive: true }} />
          <MetricCard label="Stores" value={ORG.totalStores} icon={<Building2 className="w-4 h-4" />} sublabel="all active" />
          <MetricCard label="Conversion" value={`${ORG_KPIS.avgConversion}%`} icon={<Users className="w-4 h-4" />} trend={{ delta: 2, positive: true }} />
        </div>

        {/* GMV trend (6m) */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">GMV Trend (6 months)</p>
          <div className="flex items-end gap-2 h-32">
            {GMV_TREND_6M.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary rounded-t" style={{ height: `${(m.gmv / maxTrend) * 100}%` }} />
                <p className="text-[10px] text-muted-foreground">{m.month}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Brand mix */}
        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Brand Mix</p>
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

        {/* Stores summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Stores Summary</p>
            <button onClick={() => navigate("/ea/stores")} className="text-xs text-primary font-medium flex items-center">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {STORES.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.name.replace("Ananda Honda — ", "")}</span>
                <span className="text-muted-foreground">{formatINR(s.gmv30d)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate("/ea/stores")}><Plus className="w-4 h-4" />Add Store</Button>
          <Button variant="outline" onClick={() => navigate("/ea/team")}><Plus className="w-4 h-4" />Add GM</Button>
          <Button variant="outline" onClick={() => navigate("/ea/reports")}><FileText className="w-4 h-4" />Reports</Button>
          <Button variant="outline" onClick={() => navigate("/ea/profile")}><Crown className="w-4 h-4" />Settings</Button>
        </div>
      </div>
    </OemAppShell>
  );
};

export default EaDashboard;
