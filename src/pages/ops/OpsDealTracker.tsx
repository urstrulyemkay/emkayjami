import { useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { StatusPill } from "@/components/ops/StatusPill";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockDeals, type DealItem } from "@/data/auctionOpsMockData";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const dealStatusColors: Record<string, string> = {
  allocated: "bg-blue-100 text-blue-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  payment_held: "bg-purple-100 text-purple-800",
  pickup_scheduled: "bg-indigo-100 text-indigo-800",
  pickup_confirmed: "bg-teal-100 text-teal-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  receipt_confirmed: "bg-green-100 text-green-800",
  documentation_pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const columns: QueueColumn<DealItem>[] = [
  { key: "deal_id", header: "Deal ID", sortable: true },
  { key: "vehicle", header: "Vehicle", sortable: true, className: "max-w-[180px] truncate" },
  { key: "oem", header: "OEM", sortable: true },
  { key: "broker", header: "Broker", sortable: true },
  { key: "winning_bid", header: "Winning Bid", sortable: true, render: (row) => formatCurrency(row.winning_bid) },
  {
    key: "deal_status", header: "Deal Status", sortable: true,
    render: (row) => {
      const cls = dealStatusColors[row.deal_status] || "bg-muted text-muted-foreground";
      return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{row.deal_status.replace(/_/g, " ")}</span>;
    },
  },
  { key: "payment_status", header: "Payment", render: (row) => <StatusPill status={row.payment_status} variant="generic" /> },
  { key: "pickup_status", header: "Pickup", render: (row) => <StatusPill status={row.pickup_status} variant="generic" /> },
  { key: "documentation_status", header: "Docs", render: (row) => <StatusPill status={row.documentation_status} variant="generic" /> },
  { key: "days_since_allocation", header: "Days", sortable: true, className: "text-center", render: (row) => <span className={row.days_since_allocation > 14 ? "text-red-600 font-semibold" : ""}>{row.days_since_allocation}d</span> },
  { key: "sla_status", header: "SLA", render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} /> },
  { key: "assigned_runner", header: "Runner", render: (row) => row.assigned_runner || <span className="text-muted-foreground text-xs">—</span> },
  { key: "city", header: "City", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "deal_status", label: "Deal Status", options: [{ label: "Allocated", value: "allocated" }, { label: "In Transit", value: "in_transit" }, { label: "Delivered", value: "delivered" }, { label: "Completed", value: "completed" }, { label: "Failed", value: "failed" }] },
  { key: "payment_status", label: "Payment", options: [{ label: "Pending", value: "pending" }, { label: "Held", value: "held" }, { label: "Released", value: "released" }, { label: "Failed", value: "failed" }] },
  { key: "city", label: "City", options: [{ label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" }, { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" }] },
  { key: "sla_status", label: "SLA", options: [{ label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" }] },
];

export default function OpsDealTracker() {
  const navigate = useNavigate();

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Deal Tracker</h1>
          <p className="text-sm text-muted-foreground">Track all deals from allocation through completion</p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 flex-wrap">
          {["allocated", "in_transit", "delivered", "documentation_pending", "completed", "failed"].map((status) => {
            const count = mockDeals.filter((d) => d.deal_status === status).length;
            return (
              <div key={status} className="rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{status.replace(/_/g, " ")}</p>
              </div>
            );
          })}
        </div>

        <QueueComponent
          title="All Deals"
          description={`${mockDeals.length} deals in pipeline`}
          columns={columns}
          data={mockDeals}
          filters={filters}
          onRowClick={(row) => navigate(`/ops/auctions/deals/${row.id}`)}
        />
      </div>
    </OpsLayout>
  );
}
