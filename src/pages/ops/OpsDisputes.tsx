import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockDisputes, type DisputeRecord } from "@/data/trustDisputesMockData";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  under_investigation: "bg-blue-100 text-blue-800",
  awaiting_response: "bg-indigo-100 text-indigo-800",
  resolved: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-800",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  delta_damage: "bg-orange-100 text-orange-800",
  payment_mismatch: "bg-purple-100 text-purple-800",
  delivery_issue: "bg-teal-100 text-teal-800",
  documentation: "bg-blue-100 text-blue-800",
  quality: "bg-yellow-100 text-yellow-800",
  pricing: "bg-red-100 text-red-800",
};

const columns: QueueColumn<DisputeRecord>[] = [
  { key: "dispute_id", header: "Dispute ID", sortable: true },
  { key: "deal_id", header: "Deal", sortable: true },
  { key: "vehicle", header: "Vehicle", className: "max-w-[180px] truncate" },
  { key: "filed_by", header: "Filed By", sortable: true },
  {
    key: "dispute_type", header: "Type", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", typeColors[row.dispute_type])}>
        {row.dispute_type.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "description", header: "Description", className: "max-w-[200px] truncate" },
  {
    key: "status", header: "Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", statusColors[row.status])}>
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
  { key: "filed_at", header: "Filed", sortable: true },
  { key: "city", header: "City", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "status", label: "Status", options: [
    { label: "Open", value: "open" }, { label: "Under Investigation", value: "under_investigation" },
    { label: "Awaiting Response", value: "awaiting_response" }, { label: "Resolved", value: "resolved" },
    { label: "Escalated", value: "escalated" },
  ]},
  { key: "dispute_type", label: "Type", options: [
    { label: "Delta Damage", value: "delta_damage" }, { label: "Payment Mismatch", value: "payment_mismatch" },
    { label: "Delivery Issue", value: "delivery_issue" }, { label: "Quality", value: "quality" },
    { label: "Pricing", value: "pricing" },
  ]},
  { key: "priority", label: "Priority", options: [
    { label: "Low", value: "low" }, { label: "Medium", value: "medium" },
    { label: "High", value: "high" }, { label: "Critical", value: "critical" },
  ]},
  { key: "sla_status", label: "SLA", options: [
    { label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" },
  ]},
];

export default function OpsDisputes() {
  const open = mockDisputes.filter(d => !["resolved", "closed"].includes(d.status)).length;
  const escalated = mockDisputes.filter(d => d.status === "escalated").length;

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="text-sm text-muted-foreground">Track and resolve disputes between brokers, OEMs, and runners</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total", count: mockDisputes.length },
            { label: "Open", count: open, highlight: open > 0 },
            { label: "Escalated", count: escalated, highlight: escalated > 0 },
            { label: "Resolved", count: mockDisputes.filter(d => d.status === "resolved").length },
            { label: "Overdue SLA", count: mockDisputes.filter(d => d.sla_status === "overdue").length, highlight: true },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]", s.highlight && s.count > 0 && "border-destructive")}>
              <p className={cn("text-lg font-bold", s.highlight && s.count > 0 && "text-destructive")}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {escalated > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm">🔴 ESCALATED:</span>
            <span className="text-sm text-red-700 dark:text-red-400">
              {escalated} dispute(s) escalated and require KAM/manager attention
            </span>
          </div>
        )}

        <QueueComponent
          title="All Disputes"
          description={`${mockDisputes.length} disputes tracked`}
          columns={columns}
          data={mockDisputes}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
