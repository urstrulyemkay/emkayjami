import { useState } from "react";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { StatusPill } from "@/components/ops/StatusPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Eye, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { mockKycReviews, type KycReviewItem } from "@/data/entityMockData";

const columns: QueueColumn<KycReviewItem>[] = [
  { key: "submission_id", header: "Submission ID", sortable: true },
  { key: "broker_name", header: "Broker Name", sortable: true },
  { key: "owner_name", header: "Owner Name", sortable: true },
  { key: "phone", header: "Phone" },
  { key: "city", header: "City", sortable: true },
  {
    key: "document_type", header: "Doc Type",
    render: (row) => (
      <Badge variant="outline" className="text-xs uppercase">{row.document_type === "dl" ? "DL" : "PAN"}</Badge>
    ),
  },
  {
    key: "ocr_confidence", header: "OCR %", sortable: true,
    render: (row) => (
      <span className={`text-sm font-medium ${row.ocr_confidence < 80 ? "text-red-600" : row.ocr_confidence < 90 ? "text-yellow-600" : "text-green-600"}`}>
        {row.ocr_confidence}%
      </span>
    ),
  },
  { key: "submission_time", header: "Submitted", sortable: true },
  {
    key: "sla_status", header: "SLA",
    render: (row) => (
      <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />
    ),
  },
  { key: "assigned_to", header: "Assigned To", render: (row) => row.assigned_to || <span className="text-red-500 text-xs">Unassigned</span> },
];

export default function OpsKycReview() {
  const [selectedItem, setSelectedItem] = useState<KycReviewItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    toast.success(`KYC approved for ${selectedItem?.broker_name}`);
    setSelectedItem(null);
  };

  const handleReject = () => {
    if (!rejectionReason) {
      toast.error("Please select a rejection reason");
      return;
    }
    toast.success(`KYC rejected for ${selectedItem?.broker_name}`);
    setSelectedItem(null);
    setRejectionReason("");
  };

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">KYC Review Queue</h1>
          <p className="text-sm text-muted-foreground">Review broker KYC submissions flagged for manual verification · SLA: 4 hours</p>
        </div>

        <QueueComponent
          title="Pending KYC Reviews"
          description={`${mockKycReviews.filter((k) => k.review_status === "pending").length} submissions pending review`}
          columns={columns}
          data={mockKycReviews.filter((k) => k.review_status === "pending")}
          onRowClick={(row) => setSelectedItem(row)}
        />
      </div>

      {/* KYC Review Side Panel */}
      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle>KYC Review — {selectedItem.submission_id}</SheetTitle>
              </SheetHeader>

              <div className="space-y-5 mt-4">
                {/* Broker Info */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">BROKER INFO</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Broker:</span><p className="font-medium">{selectedItem.broker_name}</p></div>
                    <div><span className="text-muted-foreground">Owner:</span><p className="font-medium">{selectedItem.owner_name}</p></div>
                    <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{selectedItem.phone}</p></div>
                    <div><span className="text-muted-foreground">City:</span><p className="font-medium">{selectedItem.city}</p></div>
                  </div>
                </div>

                <Separator />

                {/* Document Preview */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">UPLOADED DOCUMENT</h4>
                  <div className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center border">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-xs">{selectedItem.document_type === "dl" ? "Driver's License" : "PAN Card"} Image</p>
                      <Button variant="ghost" size="sm" className="mt-1"><ZoomIn className="h-3 w-3 mr-1" /> Zoom</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* OCR Results */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">OCR RESULTS</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{selectedItem.ocr_extracted_data.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">DOB:</span><span className="font-medium">{selectedItem.ocr_extracted_data.dob}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Doc No:</span><span className="font-medium font-mono">{selectedItem.ocr_extracted_data.document_no}</span></div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={`font-bold ${selectedItem.ocr_confidence < 80 ? "text-red-600" : "text-green-600"}`}>
                        {selectedItem.ocr_confidence}%
                      </span>
                    </div>
                    {selectedItem.flag_reason && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2 text-xs text-yellow-800 dark:text-yellow-400">
                        ⚠ {selectedItem.flag_reason}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Cross Check */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">CROSS-CHECK</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Name match (OCR vs registration): Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>PAN match: Match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Duplicate check (phone): No duplicates</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Decision */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">DECISION</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">Notes (optional):</span>
                      <Textarea
                        placeholder="Add review notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm text-muted-foreground">Rejection Reason (required if rejecting):</span>
                      <Select value={rejectionReason} onValueChange={setRejectionReason}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_readable">Document not readable</SelectItem>
                          <SelectItem value="name_mismatch">Name mismatch</SelectItem>
                          <SelectItem value="expired">Document expired</SelectItem>
                          <SelectItem value="fraudulent">Suspected fraudulent document</SelectItem>
                          <SelectItem value="duplicate">Duplicate entity detected</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve KYC
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={handleReject}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject KYC
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </OpsLayout>
  );
}
