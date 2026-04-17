import { useNavigate, useParams } from "react-router-dom";
import { OemAppShell } from "@/components/oem/OemAppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StageBadge } from "@/components/oem/StageBadge";
import {
  SES,
  getSe,
  getStore,
  getSm,
  GM,
  ORG,
  VEHICLES,
  formatINR,
  STAGE_LABELS,
} from "@/data/oemMockData";
import type { OemRole } from "@/data/oemTypes";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Gavel,
  CheckCircle2,
  XCircle,
  Activity,
  Award,
  ChevronRight,
} from "lucide-react";

interface Props {
  variant: Extract<OemRole, "SM" | "GM" | "EA">;
}

const SeDetail = ({ variant }: Props) => {
  const navigate = useNavigate();
  const { seId } = useParams<{ seId: string }>();
  const se = seId ? getSe(seId) : undefined;

  if (!se) {
    return (
      <OemAppShell variant={variant} contextLabel={ORG.name} userName="—">
        <div className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Sales Executive not found</p>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />Back
          </Button>
        </div>
      </OemAppShell>
    );
  }

  const store = getStore(se.storeId);
  const sm = store ? getSm(store.smId) : undefined;
  const seVehicles = VEHICLES.filter((v) => v.seId === se.id);
  const closed = seVehicles.filter((v) => ["closed", "transit", "allocated"].includes(v.stage));
  const failed = seVehicles.filter((v) => v.stage === "failed");
  const active = seVehicles.filter((v) => !["closed", "transit", "allocated", "failed"].includes(v.stage));
  const totalAttempts = closed.length + failed.length;

  // Peer benchmark — average conversion of SEs in same store
  const peers = SES.filter((s) => s.storeId === se.storeId && s.id !== se.id);
  const peerAvgConv = peers.length
    ? Math.round(peers.reduce((s, x) => s + x.conversionPct, 0) / peers.length)
    : se.conversionPct;
  const convDelta = se.conversionPct - peerAvgConv;

  const peerAvgGmv = peers.length
    ? Math.round(peers.reduce((s, x) => s + x.gmv30d, 0) / peers.length)
    : se.gmv30d;
  const gmvDelta = se.gmv30d - peerAvgGmv;

  // Rank within store
  const storeSes = [...SES.filter((s) => s.storeId === se.storeId)].sort(
    (a, b) => b.gmv30d - a.gmv30d,
  );
  const rank = storeSes.findIndex((s) => s.id === se.id) + 1;

  // Storeshare
  const storeGmvSum = storeSes.reduce((s, x) => s + x.gmv30d, 0);
  const sharePct = storeGmvSum > 0 ? Math.round((se.gmv30d / storeGmvSum) * 100) : 0;

  const backLabel = variant === "SM" ? "Team" : variant === "GM" ? "Team" : "Team";
  const backPath = `/${variant.toLowerCase()}/team`;
  const contextUserName = variant === "SM" ? sm?.name ?? "—" : variant === "GM" ? GM.name : "Admin";
  const contextLabel = variant === "SM" ? store?.name ?? "—" : variant === "GM" ? "Bengaluru Region · 4 stores" : ORG.name;

  return (
    <OemAppShell variant={variant} contextLabel={contextLabel} userName={contextUserName}>
      <div className="p-4 space-y-3">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" />Back to {backLabel}
        </button>

        {/* Identity */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                {se.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate">{se.name}</h1>
                {se.active ? (
                  <Badge variant="secondary" className="text-[10px]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Sales Executive · {store?.name.replace("Ananda Honda — ", "") ?? "—"}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(se.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                {" · "}#{rank} of {storeSes.length} in store
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Button variant="outline" size="sm" className="w-full">
              <Phone className="w-3.5 h-3.5" />Call
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Mail className="w-3.5 h-3.5" />Message
            </Button>
          </div>
        </Card>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">GMV (30d)</p>
              <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1">{formatINR(se.gmv30d)}</p>
            <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${gmvDelta >= 0 ? "text-success" : "text-destructive"}`}>
              {gmvDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {gmvDelta >= 0 ? "+" : ""}{formatINR(Math.abs(gmvDelta))} vs peers
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Conversion</p>
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1">{se.conversionPct}%</p>
            <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${convDelta >= 0 ? "text-success" : "text-destructive"}`}>
              {convDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {convDelta >= 0 ? "+" : ""}{convDelta}pp vs peers
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Active Vehicles</p>
              <Gavel className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1">{se.vehiclesActive}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">In pipeline</p>
          </Card>
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Closed (30d)</p>
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1">{se.vehiclesClosed30d}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{failed.length} failed</p>
          </Card>
        </div>

        {/* Store contribution */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />Store Contribution
            </p>
            <p className="text-xs font-bold">{sharePct}%</p>
          </div>
          <Progress value={sharePct} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {formatINR(se.gmv30d)} of {formatINR(storeGmvSum)} store GMV
          </p>
        </Card>

        {/* Outcome breakdown */}
        <Card className="p-3">
          <p className="text-xs font-semibold mb-2">Outcome Breakdown (30d)</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-success/5 border border-success/20">
              <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
              <p className="text-base font-bold mt-1">{closed.length}</p>
              <p className="text-[10px] text-muted-foreground">Won</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/5 border border-destructive/20">
              <XCircle className="w-4 h-4 text-destructive mx-auto" />
              <p className="text-base font-bold mt-1">{failed.length}</p>
              <p className="text-[10px] text-muted-foreground">Failed</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/40 border">
              <Activity className="w-4 h-4 text-muted-foreground mx-auto" />
              <p className="text-base font-bold mt-1">{totalAttempts || 0}</p>
              <p className="text-[10px] text-muted-foreground">Attempts</p>
            </div>
          </div>
        </Card>

        {/* Failure reasons */}
        {failed.length > 0 && (
          <Card className="p-3">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-destructive" />Failure Insights
            </p>
            <div className="space-y-1.5">
              {failed.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{v.model}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {v.failureReason ?? "No bids"}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{v.daysInStage}d</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Active vehicles */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">Active Pipeline</p>
            <p className="text-[10px] text-muted-foreground">{active.length} vehicles</p>
          </div>
          {active.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-3">No active vehicles</p>
          ) : (
            <div className="space-y-1.5">
              {active.slice(0, 6).map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{v.model}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{v.reg} · {v.year}</p>
                  </div>
                  <StageBadge stage={v.stage} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent closed */}
        {closed.length > 0 && (
          <Card className="p-3">
            <p className="text-xs font-semibold mb-2">Recent Wins</p>
            <div className="space-y-1.5">
              {closed.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{v.model}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {STAGE_LABELS[v.stage]} · {v.winnerBroker ?? "—"}
                    </p>
                  </div>
                  <p className="font-semibold">{v.finalPrice ? formatINR(v.finalPrice) : "—"}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Drill-through */}
        <button
          onClick={() => navigate(`/${variant.toLowerCase()}/auctions`)}
          className="w-full flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors"
        >
          <span className="text-xs font-medium">View all auctions for this store</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </OemAppShell>
  );
};

export default SeDetail;
