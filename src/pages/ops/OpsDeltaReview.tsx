import { useState } from "react";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MessageSquare, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockDeltaReviews, type DeltaReviewItem } from "@/data/auctionOpsMockData";

const severityColors: Record<string, string> = {
  negligible: "bg-green-100 text-green-800",
  minor: "bg-yellow-100 text-yellow-800",
  major: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  escalated: "bg-purple-100 text-purple-800",
};

const columns: QueueColumn<DeltaReviewItem>[] = [
  { key: "flag_id", header: "Flag ID", sortable: true },
  { key: "vehicle", header: "Vehicle", sortable: true, className: "max-w-[180px] truncate" },
  { key: "oem_store_se", header: "OEM / Store / SE", className: "max-w-[200px] truncate" },
  { key: "first_grade", header: "Grade Change", render: (row) => <span className="font-mono text-sm">{row.first_grade} → {row.second_grade}</span> },
  { key: "delta_severity", header: "Severity", render: (row) => <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", severityColors[row.delta_severity])}>{row.delta_severity}</span> },
  { key: "price_adjustment", header: "Adjustment", render: (row) => <span className="text-red-600 font-medium">₹{row.price_adjustment.toLocaleString("en-IN")} ({row.price_adjustment_pct}%)</span> },
  { key: "flag_reason", header: "Flag Reason", className: "max-w-[200px] truncate" },
  { key: "status", header: "Status", render: (row) => <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", statusColors[row.status])}>{row.status.replace(/_/g, " ")}</span> },
  { key: "sla_status", header: "SLA", render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} /> },
];

export default function OpsDeltaReview() {
  const [selected, setSelected] = useState<DeltaReviewItem | null>(null);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Delta Review Queue</h1>
          <p className="text-sm text-muted-foreground">Review flagged inspection deltas · SLA: 24 hours</p>
        </div>

        <QueueComponent
          title="Flagged Deltas"
          description={`${mockDeltaReviews.filter((d) => d.status === "pending_review").length} pending review`}
          columns={columns}
          data={mockDeltaReviews}
          onRowClick={(row) => setSelected(row)}
        />
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Delta Review — {selected.flag_id}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">VEHICLE & CONTEXT</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Vehicle:</span> <span className="font-medium">{selected.vehicle}</span></p>
                    <p><span className="text-muted-foreground">OEM / Store / SE:</span> <span className="font-medium">{selected.oem_store_se}</span></p>
                    <p><span className="text-muted-foreground">Flag Reason:</span> <span className="font-medium">{selected.flag_reason}</span></p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">GRADE COMPARISON</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-center p-3 rounded-lg border flex-1">
                      <p className="text-xs text-muted-foreground">First Inspection</p>
                      <p className="text-3xl font-bold">{selected.first_grade}</p>
                    </div>
                    <span className="text-lg">→</span>
                    <div className="text-center p-3 rounded-lg border flex-1 border-red-200 bg-red-50 dark:bg-red-900/10">
                      <p className="text-xs text-muted-foreground">Second Inspection</p>
                      <p className="text-3xl font-bold text-red-600">{selected.second_grade}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">PRICE IMPACT</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>Price Adjustment:</span>
                      <span className="font-bold text-red-600">-₹{selected.price_adjustment.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Percentage:</span>
                      <span className="font-bold text-red-600">{selected.price_adjustment_pct}%</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Severity:</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", severityColors[selected.delta_severity])}>{selected.delta_severity}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">SE DELTA HISTORY (30d)</h4>
                  <div className="text-sm text-muted-foreground">
                    This SE has had <span className="font-semibold text-foreground">4 deltas</span> in the last 30 days:
                    2 negligible, 1 minor, 1 major
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">NOTES</h4>
                  <Textarea placeholder="Add review notes..." className="text-sm" />
                </div>

                {selected.status === "pending_review" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => { toast.success("Delta approved"); setSelected(null); }}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => { toast.success("Delta rejected"); setSelected(null); }}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button variant="outline" onClick={() => { toast.info("Clarification requested"); setSelected(null); }}>
                      <MessageSquare className="h-4 w-4 mr-1" /> Request Clarification
                    </Button>
                    <Button variant="outline" onClick={() => { toast.info("Escalated to KAM"); setSelected(null); }}>
                      <ArrowUpRight className="h-4 w-4 mr-1" /> Escalate
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </OpsLayout>
  );
}
