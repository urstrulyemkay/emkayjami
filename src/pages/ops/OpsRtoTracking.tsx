import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockServiceRequests, type ServiceRequest } from "@/data/documentationMockData";
import { cn } from "@/lib/utils";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const statusColors: Record<string, string> = {
  SUBMITTED_TO_RTO: "bg-indigo-100 text-indigo-800",
  FEE_PAID: "bg-purple-100 text-purple-800",
  UNDER_VERIFICATION: "bg-orange-100 text-orange-800",
  APPROVAL_PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED_VAHAN: "bg-green-100 text-green-800",
  PHYSICAL_RC_RECEIVED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
};

// Filter to only RTO service types
const rtoRequests = mockServiceRequests.filter(r =>
  r.source_product === "SERVICES_RTO" || r.rto_office
);

const columns: QueueColumn<ServiceRequest>[] = [
  { key: "request_id", header: "Request ID", sortable: true },
  { key: "vehicle_reg", header: "Reg No.", sortable: true },
  { key: "vehicle", header: "Vehicle", className: "max-w-[160px] truncate" },
  {
    key: "service_type", header: "Service Type", sortable: true,
    render: (row) => (
      <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize bg-blue-100 text-blue-800">
        {row.service_type.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "case_subtype", header: "Subtype", render: (row) => row.case_subtype || <span className="text-muted-foreground text-xs">—</span> },
  { key: "city", header: "City", sortable: true },
  {
    key: "status", header: "Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", statusColors[row.status] || "bg-muted text-muted-foreground")}>
        {row.status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "rto_office", header: "RTO Office",
    render: (row) => row.rto_office || <span className="text-muted-foreground text-xs">—</span>,
  },
  { key: "submission_date", header: "Submitted", sortable: true, render: (row) => row.submission_date || <span className="text-muted-foreground text-xs">—</span> },
  {
    key: "rto_reference", header: "RTO Ref",
    render: (row) => row.rto_reference ? <span className="font-mono text-xs">{row.rto_reference}</span> : <span className="text-muted-foreground text-xs">—</span>,
  },
  {
    key: "vahan_status", header: "Vahan Status",
    render: (row) => row.vahan_status || <span className="text-muted-foreground text-xs">—</span>,
  },
  {
    key: "vahan_last_checked", header: "Last Checked",
    render: (row) => row.vahan_last_checked ? <span className="text-xs">{row.vahan_last_checked}</span> : <span className="text-muted-foreground text-xs">—</span>,
  },
  {
    key: "fee_paid", header: "Fee",
    render: (row) => {
      if (!row.fee_paid) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm">{formatCurrency(row.fee_paid)}</span>
          <span className={cn("text-[10px] font-semibold", row.fee_status === "paid" ? "text-green-600" : "text-red-600")}>
            {row.fee_status === "paid" ? "✓" : "✗"}
          </span>
        </div>
      );
    },
  },
  {
    key: "sla_status", header: "SLA",
    render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />,
  },
  {
    key: "assigned_to", header: "Assigned",
    render: (row) => row.assigned_to || <span className="text-destructive text-xs font-medium">Unassigned</span>,
  },
];

const filters: QueueFilter[] = [
  { key: "service_type", label: "Service Type", options: [
    { label: "Name Transfer", value: "name_transfer" }, { label: "Duplicate RC", value: "duplicate_rc" },
    { label: "HP Termination", value: "hp_termination" },
  ]},
  { key: "status", label: "Status", options: [
    { label: "Submitted to RTO", value: "SUBMITTED_TO_RTO" }, { label: "Fee Paid", value: "FEE_PAID" },
    { label: "Under Verification", value: "UNDER_VERIFICATION" }, { label: "Approval Pending", value: "APPROVAL_PENDING" },
    { label: "Completed (Vahan)", value: "COMPLETED_VAHAN" }, { label: "Completed", value: "COMPLETED" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
  { key: "sla_status", label: "SLA", options: [
    { label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" },
  ]},
];

export default function OpsRtoTracking() {
  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">RTO Tracking</h1>
          <p className="text-sm text-muted-foreground">Track RTO submissions, Vahan verification status, and fee payments</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "RTO Requests", count: rtoRequests.length },
            { label: "Submitted", count: rtoRequests.filter(r => r.submission_date).length },
            { label: "Pending Verification", count: rtoRequests.filter(r => r.status === "UNDER_VERIFICATION" || r.status === "APPROVAL_PENDING").length },
            { label: "Completed", count: rtoRequests.filter(r => r.status === "COMPLETED_VAHAN" || r.status === "COMPLETED").length },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card px-3 py-2 text-center min-w-[120px]">
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <QueueComponent
          title="RTO Submissions"
          description={`${rtoRequests.length} RTO service requests`}
          columns={columns}
          data={rtoRequests}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
