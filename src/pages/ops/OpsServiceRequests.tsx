import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockServiceRequests, type ServiceRequest } from "@/data/documentationMockData";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const serviceTypeColors: Record<string, string> = {
  name_transfer: "bg-blue-100 text-blue-800",
  duplicate_rc: "bg-purple-100 text-purple-800",
  hp_termination: "bg-indigo-100 text-indigo-800",
  rc_transfer_broker: "bg-teal-100 text-teal-800",
  insurance_transfer: "bg-cyan-100 text-cyan-800",
  puc_renewal: "bg-green-100 text-green-800",
  loan_closure: "bg-orange-100 text-orange-800",
};

const sourceColors: Record<string, string> = {
  "DAP_2.0": "bg-blue-100 text-blue-800",
  "SERVICES_RTO": "bg-green-100 text-green-800",
  "C2C": "bg-orange-100 text-orange-800",
};

const priorityColors: Record<string, string> = {
  normal: "bg-muted text-muted-foreground",
  high: "bg-yellow-100 text-yellow-800",
  urgent: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  LEAD_CREATED: "bg-muted text-muted-foreground",
  ACCEPTED: "bg-blue-100 text-blue-800",
  DOCS_COLLECTION: "bg-yellow-100 text-yellow-800",
  DOCS_COLLECTED: "bg-teal-100 text-teal-800",
  SUBMITTED_TO_RTO: "bg-indigo-100 text-indigo-800",
  FEE_PAID: "bg-purple-100 text-purple-800",
  UNDER_VERIFICATION: "bg-orange-100 text-orange-800",
  APPROVAL_PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED_VAHAN: "bg-green-100 text-green-800",
  PHYSICAL_RC_RECEIVED: "bg-green-100 text-green-800",
  CUSTOMER_HANDOVER: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  PROOF_SUBMITTED: "bg-teal-100 text-teal-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
};

const columns: QueueColumn<ServiceRequest>[] = [
  { key: "request_id", header: "Request ID", sortable: true },
  { key: "vehicle_reg", header: "Reg No.", sortable: true },
  { key: "vehicle", header: "Vehicle", className: "max-w-[160px] truncate" },
  {
    key: "service_type", header: "Service Type", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", serviceTypeColors[row.service_type])}>
        {row.service_type.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "case_subtype", header: "Subtype", render: (row) => row.case_subtype || <span className="text-muted-foreground text-xs">—</span> },
  {
    key: "source_product", header: "Source", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", sourceColors[row.source_product])}>
        {row.source_product.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "requester", header: "Requester", sortable: true },
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
    key: "priority", header: "Priority", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", priorityColors[row.priority])}>
        {row.priority}
      </span>
    ),
  },
  {
    key: "sla_status", header: "SLA",
    render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />,
  },
  {
    key: "assigned_to", header: "Assigned To",
    render: (row) => row.assigned_to || <span className="text-destructive text-xs font-medium">Unassigned</span>,
  },
  {
    key: "docs_collected", header: "Docs",
    render: (row) => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <Progress value={(row.docs_collected / row.docs_required) * 100} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{row.docs_collected}/{row.docs_required}</span>
      </div>
    ),
  },
];

const filters: QueueFilter[] = [
  { key: "source_product", label: "Source", options: [
    { label: "DAP 2.0", value: "DAP_2.0" }, { label: "Services RTO", value: "SERVICES_RTO" }, { label: "C2C", value: "C2C" },
  ]},
  { key: "service_type", label: "Service Type", options: [
    { label: "Name Transfer", value: "name_transfer" }, { label: "Duplicate RC", value: "duplicate_rc" },
    { label: "HP Termination", value: "hp_termination" }, { label: "RC Transfer (Broker)", value: "rc_transfer_broker" },
    { label: "Insurance Transfer", value: "insurance_transfer" }, { label: "PUC Renewal", value: "puc_renewal" },
    { label: "Loan Closure", value: "loan_closure" },
  ]},
  { key: "status", label: "Status", options: [
    { label: "Lead Created", value: "LEAD_CREATED" }, { label: "Docs Collection", value: "DOCS_COLLECTION" },
    { label: "Submitted to RTO", value: "SUBMITTED_TO_RTO" }, { label: "Under Verification", value: "UNDER_VERIFICATION" },
    { label: "Completed", value: "COMPLETED" }, { label: "Proof Submitted", value: "PROOF_SUBMITTED" },
  ]},
  { key: "priority", label: "Priority", options: [
    { label: "Normal", value: "normal" }, { label: "High", value: "high" }, { label: "Urgent", value: "urgent" },
  ]},
  { key: "sla_status", label: "SLA", options: [
    { label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
];

export default function OpsServiceRequests() {
  const unassigned = mockServiceRequests.filter(r => !r.assigned_to).length;
  const overdue = mockServiceRequests.filter(r => r.sla_status === "overdue").length;
  const rtoActive = mockServiceRequests.filter(r => r.source_product === "SERVICES_RTO" && r.status !== "COMPLETED").length;

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Service Requests</h1>
          <p className="text-sm text-muted-foreground">Unified documentation queue across DAP 2.0, Services RTO, and C2C</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Requests", count: mockServiceRequests.length },
            { label: "Unassigned", count: unassigned, highlight: unassigned > 0 },
            { label: "RTO Active", count: rtoActive },
            { label: "Overdue SLA", count: overdue, highlight: overdue > 0 },
            { label: "Completed", count: mockServiceRequests.filter(r => r.status === "COMPLETED" || r.status === "COMPLETED_VAHAN").length },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]", s.highlight && s.count > 0 && "border-destructive")}>
              <p className={cn("text-lg font-bold", s.highlight && s.count > 0 && "text-destructive")}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {unassigned > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center gap-2">
            <span className="text-yellow-600 font-bold text-sm">⚠️</span>
            <span className="text-sm text-yellow-700 dark:text-yellow-400">
              {unassigned} request(s) unassigned — assign to a doc exec
            </span>
          </div>
        )}

        <QueueComponent
          title="All Service Requests"
          description={`${mockServiceRequests.length} requests across all products`}
          columns={columns}
          data={mockServiceRequests}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
