import { useParams, useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockLiveAuctions, mockDeals, mockCascades } from "@/data/auctionOpsMockData";
import { ArrowLeft, Clock, Users, TrendingUp, AlertTriangle, Eye, Pause, X, RefreshCw, Gavel, MapPin, User, Building2, Timer, CheckCircle, XCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { useState } from "react";

const formatCurrency = (v: number) => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

// Mock bid history for the detail view
const generateMockBids = (auctionId: string, bidCount: number) => {
  const brokers = ["Rajesh Auto Traders", "Metro Car Zone", "Kumar Bikes", "Speedy Wheels", "Anand Motors", "Prime Wheels"];
  const bids = [];
  let currentAmount = 15000 + Math.floor(Math.random() * 20000);
  for (let i = 0; i < bidCount; i++) {
    currentAmount += 500 + Math.floor(Math.random() * 2000);
    bids.push({
      id: `bid-${auctionId}-${i + 1}`,
      rank: i + 1,
      broker: brokers[i % brokers.length],
      broker_id: `BRK-${1000 + (i % brokers.length)}`,
      amount: currentAmount,
      commission: Math.round(currentAmount * 0.12),
      effective_score: Math.round(currentAmount * 0.88),
      placed_at: new Date(Date.now() - (bidCount - i) * 180000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      trust_score: 70 + Math.floor(Math.random() * 25),
      city: ["Bangalore", "Mumbai", "Chennai", "Delhi"][i % 4],
    });
  }
  return bids.sort((a, b) => b.effective_score - a.effective_score);
};

// Mock activity log
const generateActivityLog = (auctionId: string) => [
  { time: "10:00 AM", event: "Auction created", actor: "System", type: "info" as const },
  { time: "10:01 AM", event: "Broadcast sent to 45 brokers", actor: "System", type: "info" as const },
  { time: "10:02 AM", event: "Auction went live", actor: "System", type: "success" as const },
  { time: "10:05 AM", event: "First bid received", actor: "Broker", type: "success" as const },
  { time: "10:12 AM", event: "Reserve price met", actor: "System", type: "success" as const },
  { time: "10:18 AM", event: "Bid war detected (3 bids in 2 min)", actor: "System", type: "warning" as const },
  { time: "10:25 AM", event: "Customer expectation exceeded", actor: "System", type: "success" as const },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-muted text-muted-foreground",
  live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  ending_soon: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  ended_sold: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  ended_no_sale: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  ended_cascading: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const typeColors: Record<string, string> = {
  quick: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  flexible: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  extended: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export default function OpsLiveAuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isEnded = auction.status.startsWith("ended_");

  // Find linked deal/cascade
  const linkedDeal = auction.outcome?.deal_id ? mockDeals.find(d => d.id === auction.outcome!.deal_id) : null;
  const linkedCascade = auction.outcome?.cascade_id ? mockCascades.find(c => c.id === auction.outcome!.cascade_id) : null;

  const auction = mockLiveAuctions.find((a) => a.id === id);

  if (!auction) {
    return (
      <OpsLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Auction not found</h2>
          <Button variant="outline" onClick={() => navigate("/ops/auctions/live")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Live Auctions
          </Button>
        </div>
      </OpsLayout>
    );
  }

  const bids = generateMockBids(auction.id, auction.bid_count);
  const activityLog = generateActivityLog(auction.id);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const bidVsExpPct = auction.customer_expectation > 0
    ? Math.round((auction.highest_bid / auction.customer_expectation) * 100)
    : 0;

  return (
    <OpsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/ops/auctions/live")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{auction.auction_id}</h1>
                <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusColors[auction.status])}>
                  {auction.status.replace("_", " ")}
                </span>
                <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", typeColors[auction.auction_type])}>
                  {auction.auction_type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{auction.vehicle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} /> Refresh
            </Button>
            {auction.status !== "scheduled" && (
              <>
                <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50">
                  <Pause className="h-4 w-4 mr-1" /> Pause
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Alert if 0 bids */}
        {auction.bid_count === 0 && auction.time_remaining_min <= 5 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
              CRITICAL: This auction is ending with 0 bids. Consider extending duration or broadening broadcast scope.
            </span>
          </div>
        )}

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard icon={Timer} label="Time Remaining" value={`${auction.time_remaining_min} min`}
            alert={auction.time_remaining_min <= 5} />
          <MetricCard icon={Users} label="Total Bids" value={String(auction.bid_count)}
            alert={auction.bid_count === 0} />
          <MetricCard icon={TrendingUp} label="Highest Bid" value={formatCurrency(auction.highest_bid)} />
          <MetricCard icon={Gavel} label="Eff. Score" value={auction.effective_score > 0 ? auction.effective_score.toLocaleString("en-IN") : "—"} />
          <MetricCard icon={TrendingUp} label="Expectation" value={formatCurrency(auction.customer_expectation)} />
          <MetricCard icon={TrendingUp} label="Bid vs Exp"
            value={bidVsExpPct > 0 ? `${bidVsExpPct}%` : "—"}
            alert={bidVsExpPct > 0 && bidVsExpPct < 80}
            success={bidVsExpPct >= 100} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Auction Details + Activity */}
          <div className="space-y-6">
            {/* Auction Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Auction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <DetailRow icon={Building2} label="OEM" value={auction.oem} />
                <DetailRow icon={MapPin} label="Store" value={auction.store} />
                <DetailRow icon={User} label="Sales Executive" value={auction.se} />
                <Separator />
                <DetailRow icon={Clock} label="Duration" value={auction.duration} />
                <DetailRow icon={MapPin} label="Broadcast Scope" value={auction.broadcast_scope} />
                <DetailRow icon={Eye} label="Type" value={auction.auction_type} />
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap text-xs mt-0.5">{log.time}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        log.type === "success" && "bg-green-500",
                        log.type === "warning" && "bg-yellow-500",
                        log.type === "info" && "bg-blue-500",
                      )} />
                      <span>{log.event}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Bid Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="h-4 w-4" /> Bid Leaderboard
                  {auction.status === "live" && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-normal">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No bids yet</p>
                    <p className="text-xs">Waiting for broker participation</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 pr-3">#</th>
                          <th className="pb-2 pr-3">Broker</th>
                          <th className="pb-2 pr-3">City</th>
                          <th className="pb-2 pr-3 text-right">Bid</th>
                          <th className="pb-2 pr-3 text-right">Commission</th>
                          <th className="pb-2 pr-3 text-right">Eff. Score</th>
                          <th className="pb-2 pr-3 text-right">Trust</th>
                          <th className="pb-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bids.map((bid, i) => (
                          <tr key={bid.id} className={cn(
                            "border-b last:border-0",
                            i === 0 && "bg-green-50/50 dark:bg-green-900/10"
                          )}>
                            <td className="py-2.5 pr-3">
                              {i === 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold dark:bg-green-900/30 dark:text-green-400">1</span>
                              ) : (
                                <span className="text-muted-foreground">{i + 1}</span>
                              )}
                            </td>
                            <td className="py-2.5 pr-3">
                              <div className="font-medium">{bid.broker}</div>
                              <div className="text-xs text-muted-foreground">{bid.broker_id}</div>
                            </td>
                            <td className="py-2.5 pr-3 text-muted-foreground">{bid.city}</td>
                            <td className="py-2.5 pr-3 text-right font-semibold">{formatCurrency(bid.amount)}</td>
                            <td className="py-2.5 pr-3 text-right text-muted-foreground">{formatCurrency(bid.commission)}</td>
                            <td className="py-2.5 pr-3 text-right font-medium">{bid.effective_score.toLocaleString("en-IN")}</td>
                            <td className="py-2.5 pr-3 text-right">
                              <span className={cn(
                                "text-xs font-semibold",
                                bid.trust_score >= 85 ? "text-green-600" : bid.trust_score >= 70 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {bid.trust_score}
                              </span>
                            </td>
                            <td className="py-2.5 text-xs text-muted-foreground">{bid.placed_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ops Actions */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Operations Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Extend Time</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">Expand Scope</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Re-broadcast</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">View Inspection</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OpsLayout>
  );
}

// Reusable metric card
function MetricCard({ icon: Icon, label, value, alert, success }: {
  icon: React.ElementType; label: string; value: string; alert?: boolean; success?: boolean;
}) {
  return (
    <Card className={cn(alert && "border-red-300 dark:border-red-800", success && "border-green-300 dark:border-green-800")}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("h-3.5 w-3.5", alert ? "text-red-500" : success ? "text-green-500" : "text-muted-foreground")} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={cn("text-lg font-bold", alert && "text-red-600", success && "text-green-600")}>{value}</p>
      </CardContent>
    </Card>
  );
}

// Detail row for info card
function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}
