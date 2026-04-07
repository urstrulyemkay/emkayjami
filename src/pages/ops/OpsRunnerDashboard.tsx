import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { mockRunners, type RunnerProfile } from "@/data/logisticsMockData";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  on_task: "bg-blue-100 text-blue-800",
  offline: "bg-muted text-muted-foreground",
  suspended: "bg-red-100 text-red-800",
};

const columns: QueueColumn<RunnerProfile>[] = [
  { key: "runner_id", header: "Runner ID", sortable: true },
  { key: "name", header: "Name", sortable: true },
  { key: "phone", header: "Phone" },
  { key: "city", header: "City", sortable: true },
  {
    key: "status", header: "Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", statusColors[row.status])}>
        {row.status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "active_tasks", header: "Active Tasks", sortable: true, className: "text-center",
    render: (row) => <span className={row.active_tasks > 2 ? "text-red-600 font-semibold" : ""}>{row.active_tasks}</span>,
  },
  { key: "completed_today", header: "Today", sortable: true, className: "text-center" },
  { key: "completed_this_week", header: "This Week", sortable: true, className: "text-center" },
  {
    key: "rating", header: "Rating", sortable: true,
    render: (row) => (
      <div className="flex items-center gap-1">
        <Star className={cn("h-3.5 w-3.5 fill-current", row.rating >= 4.5 ? "text-yellow-500" : row.rating >= 4 ? "text-yellow-400" : "text-muted-foreground")} />
        <span className="text-sm font-medium">{row.rating.toFixed(1)}</span>
      </div>
    ),
  },
];

const filters: QueueFilter[] = [
  { key: "status", label: "Status", options: [
    { label: "Available", value: "available" }, { label: "On Task", value: "on_task" },
    { label: "Offline", value: "offline" }, { label: "Suspended", value: "suspended" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
];

export default function OpsRunnerDashboard() {
  const available = mockRunners.filter(r => r.status === "available").length;
  const onTask = mockRunners.filter(r => r.status === "on_task").length;
  const totalDeliveriesToday = mockRunners.reduce((s, r) => s + r.completed_today, 0);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Runner Management</h1>
          <p className="text-sm text-muted-foreground">Monitor runner availability, task load, and performance</p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Runners", count: mockRunners.length },
            { label: "Available", count: available },
            { label: "On Task", count: onTask },
            { label: "Deliveries Today", count: totalDeliveriesToday },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card px-3 py-2 text-center min-w-[110px]">
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <QueueComponent
          title="All Runners"
          description={`${mockRunners.length} runners across all cities`}
          columns={columns}
          data={mockRunners}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
