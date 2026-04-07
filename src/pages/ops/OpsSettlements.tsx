import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockSettlements, type SettlementRecord } from "@/data/financeMockData";
import { cn } from "@/lib/utils";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const statusColors: Record<string, string> = {
  pending_transfer: "bg-yellow-100 text-yellow-800",
  transferred: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
};

const columns: QueueColumn<SettlementRecord>[] = [
  { key: "oem", header: "OEM", sortable: true },
  { key: "period", header: "Period" },
  { key: "deals_completed", header: "Deals", sortable: true, className: "text-center" },
  { key: "gross_revenue", header: "Gross Revenue", sortable: true, render: (row) => formatCurrency(row.gross_revenue) },
  { key: "platform_commission", header: "Commission", sortable: true, render: (row) => formatCurrency(row.platform_commission) },
  { key: "net_payout", header: "Net Payout", sortable: true, render: (row) => <span className="font-semibold">{formatCurrency(row.net_payout)}</span> },
  {
    key: "payment_status", header: "Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", statusColors[row.payment_status])}>
        {row.payment_status.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "city", header: "City", sortable: true },
];

const filters: QueueFilter[] = [
  { key: "payment_status", label: "Status", options: [
    { label: "Pending Transfer", value: "pending_transfer" },
    { label: "Transferred", value: "transferred" },
    { label: "Confirmed", value: "confirmed" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
];

export default function OpsSettlements() {
  const totalPayout = mockSettlements.reduce((s, r) => s + r.net_payout, 0);
  const totalCommission = mockSettlements.reduce((s, r) => s + r.platform_commission, 0);
  const pending = mockSettlements.filter(r => r.payment_status === "pending_transfer");

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Settlements</h1>
          <p className="text-sm text-muted-foreground">Per-OEM settlement ledger · Export CSV for reconciliation</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Net Payout", value: formatCurrency(totalPayout) },
            { label: "Platform Commission", value: formatCurrency(totalCommission) },
            { label: "Pending Transfers", value: String(pending.length), highlight: pending.length > 0 },
            { label: "Total Deals", value: String(mockSettlements.reduce((s, r) => s + r.deals_completed, 0)) },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[130px]", s.highlight && "border-yellow-400")}>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <QueueComponent
          title="Settlement Ledger"
          description={`${mockSettlements.length} OEM settlements this period`}
          columns={columns}
          data={mockSettlements}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
