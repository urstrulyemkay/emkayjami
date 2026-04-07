import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockPickups, type PickupRequest } from "@/data/logisticsMockData";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  runner_assigned: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-teal-100 text-teal-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  receipt_confirmed: "bg-green-100 text-green-800",
  issue_reported: "bg-red-100 text-red-800",
};

const columns: QueueColumn<PickupRequest>[] = [
  { key: "request_id", header: "Request ID", sortable: true },
  { key: "vehicle", header: "Vehicle", sortable: true, className: "max-w-[200px] truncate" },
  { key: "oem_store", header: "OEM / Store", className: "max-w-[180px] truncate" },
  { key: "se_name", header: "SE" },
  { key: "poc_phone", header: "POC Phone" },
  { key: "preferred_date", header: "Date", sortable: true },
  { key: "preferred_slot", header: "Slot" },
  {
    key: "delivery_path", header: "Path",
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        row.delivery_path === "direct_to_broker" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
      )}>
        {row.delivery_path.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "parking_needed", header: "Parking",
    render: (row) => row.parking_needed ? <span className="text-orange-600 font-semibold text-xs">Yes</span> : <span className="text-muted-foreground text-xs">No</span>,
  },
  {
    key: "assigned_runner", header: "Runner",
    render: (row) => row.assigned_runner || <span className="text-muted-foreground text-xs">—</span>,
  },
  {
    key: "status", header: "Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", statusColors[row.status])}>
        {row.status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "sla_status", header: "SLA",
    render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />,
  },
  { key: "city", header: "City", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "status", label: "Status", options: [
    { label: "Requested", value: "requested" }, { label: "Confirmed", value: "confirmed" },
    { label: "Runner Assigned", value: "runner_assigned" }, { label: "Picked Up", value: "picked_up" },
    { label: "In Transit", value: "in_transit" }, { label: "Delivered", value: "delivered" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
  { key: "delivery_path", label: "Delivery Path", options: [
    { label: "Direct to Broker", value: "direct_to_broker" }, { label: "Common Yard", value: "common_yard" },
  ]},
  { key: "sla_status", label: "SLA", options: [
    { label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" },
  ]},
];

export default function OpsPickupQueue() {
  const sorted = [...mockPickups].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, warning: 1, on_track: 2 };
    return (order[a.sla_status] ?? 2) - (order[b.sla_status] ?? 2);
  });

  const unassigned = mockPickups.filter(p => !p.assigned_runner && (p.status === "requested" || p.status === "confirmed")).length;
  const inTransit = mockPickups.filter(p => p.status === "in_transit" || p.status === "picked_up").length;

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Pickup Request Queue</h1>
          <p className="text-sm text-muted-foreground">Manage pickup scheduling, runner assignment, and delivery tracking</p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total", count: mockPickups.length },
            { label: "Unassigned", count: unassigned, highlight: unassigned > 0 },
            { label: "In Transit", count: inTransit },
            { label: "Overdue SLA", count: mockPickups.filter(p => p.sla_status === "overdue").length, highlight: true },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]", s.highlight && s.count > 0 && "border-destructive")}>
              <p className={cn("text-lg font-bold", s.highlight && s.count > 0 && "text-destructive")}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alert for overdue unassigned */}
        {sorted.some(p => p.sla_status === "overdue" && !p.assigned_runner) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm">🔴 ALERT:</span>
            <span className="text-sm text-red-700 dark:text-red-400">
              {sorted.filter(p => p.sla_status === "overdue" && !p.assigned_runner).length} pickup(s) overdue and unassigned!
            </span>
          </div>
        )}

        <QueueComponent
          title="Pickup Requests"
          description={`${mockPickups.length} requests · SLA: Confirm within 1 hour`}
          columns={columns}
          data={sorted}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
