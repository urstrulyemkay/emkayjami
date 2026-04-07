import { OpsLayout } from "@/components/ops/OpsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCascades, type CascadeItem, type CascadeOffer } from "@/data/auctionOpsMockData";

const offerStatusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  offered: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
  accepted: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
  declined: { color: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
  expired: { color: "bg-muted text-muted-foreground", icon: <Clock className="h-3 w-3" /> },
  standby: { color: "bg-blue-100 text-blue-800", icon: <Clock className="h-3 w-3" /> },
  below_floor: { color: "bg-muted text-muted-foreground line-through", icon: <XCircle className="h-3 w-3" /> },
};

function CascadeCard({ cascade }: { cascade: CascadeItem }) {
  const isActive = cascade.status === "active";
  const borderColor = isActive ? "border-yellow-400 dark:border-yellow-600" : cascade.status === "failed" ? "border-red-300" : "border-green-300";

  return (
    <Card className={cn("border-2", borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {isActive && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              <CardTitle className="text-base">CASCADE — {cascade.auction_id}</CardTitle>
              <Badge variant={isActive ? "default" : cascade.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">
                {cascade.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{cascade.vehicle}</p>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3 w-3 mr-1" /> Auction Detail
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-muted-foreground">Original Winner:</span><p className="font-medium">{cascade.original_winner}</p></div>
          <div><span className="text-muted-foreground">Backed Out:</span><p className="font-medium">{cascade.backed_out_at}</p></div>
          <div><span className="text-muted-foreground">Cascade Started:</span><p className="font-medium">{cascade.cascade_started}</p></div>
          <div><span className="text-muted-foreground">Valid Until:</span><p className={cn("font-medium", cascade.validity_until === "Expired" && "text-red-600")}>{cascade.validity_until}</p></div>
        </div>

        <div className="flex gap-4 text-sm">
          <div><span className="text-muted-foreground">Floor:</span> <span className="font-semibold">₹{cascade.eligibility_floor.toLocaleString("en-IN")}</span> <span className="text-xs text-muted-foreground">({cascade.floor_source})</span></div>
          <div><span className="text-muted-foreground">Eligible:</span> <span className="font-semibold">{cascade.eligible_bids} of {cascade.total_bids} bids</span></div>
        </div>

        <Separator />

        {/* Offer Sequence */}
        <div>
          <h4 className="text-sm font-semibold mb-2">OFFER SEQUENCE</h4>
          <div className="space-y-2">
            {cascade.offers.map((offer, i) => {
              const config = offerStatusConfig[offer.status];
              return (
                <div key={i} className={cn("rounded-lg border p-3 text-sm", offer.status === "offered" && "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{offer.rank}</span>
                      <span>{offer.broker}</span>
                      <span className="text-muted-foreground">—</span>
                      <span className="font-semibold">₹{offer.bid_amount.toLocaleString("en-IN")}</span>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", config.color)}>
                      {config.icon} {offer.status.replace("_", " ")}
                    </span>
                  </div>
                  {offer.status === "offered" && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Sent: {offer.sent_at} · Deadline: {offer.deadline} · <span className="text-yellow-700 font-semibold">{offer.time_remaining} remaining</span>
                    </div>
                  )}
                  {(offer.status === "declined" || offer.status === "expired") && offer.sent_at && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Sent: {offer.sent_at} · {offer.status === "declined" ? "Declined" : "Expired"}: {offer.deadline}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OpsCascadeMonitor() {
  const active = mockCascades.filter((c) => c.status === "active");
  const resolved = mockCascades.filter((c) => c.status === "resolved");
  const failed = mockCascades.filter((c) => c.status === "failed");

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Cascade Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Track fallback cascades when winning brokers back out · Real-time updates
          </p>
        </div>

        {/* Summary */}
        <div className="flex gap-3">
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="text-xl font-bold text-yellow-600">{active.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="text-xl font-bold text-green-600">{resolved.length}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-center">
            <p className="text-xl font-bold text-red-600">{failed.length}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {active.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active cascades</div>
            ) : (
              active.map((c) => <CascadeCard key={c.id} cascade={c} />)
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4 mt-4">
            {resolved.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No resolved cascades</div>
            ) : (
              resolved.map((c) => <CascadeCard key={c.id} cascade={c} />)
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4 mt-4">
            {failed.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No failed cascades</div>
            ) : (
              failed.map((c) => <CascadeCard key={c.id} cascade={c} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </OpsLayout>
  );
}
