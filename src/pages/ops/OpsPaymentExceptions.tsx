import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { SLAPill } from "@/components/ops/SLAPill";
import { mockPayments, type PaymentRecord } from "@/data/financeMockData";
import { cn } from "@/lib/utils";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  initiated: "bg-blue-100 text-blue-800",
  held: "bg-purple-100 text-purple-800",
  released: "bg-teal-100 text-teal-800",
  settled: "bg-green-100 text-green-800",
  refunded: "bg-orange-100 text-orange-800",
  failed: "bg-red-100 text-red-800",
  timeout: "bg-red-100 text-red-800",
};

const columns: QueueColumn<PaymentRecord>[] = [
  { key: "deal_id", header: "Deal ID", sortable: true },
  { key: "vehicle", header: "Vehicle", sortable: true, className: "max-w-[180px] truncate" },
  { key: "broker", header: "Broker", sortable: true },
  { key: "oem", header: "OEM" },
  { key: "winning_bid", header: "Winning Bid", sortable: true, render: (row) => formatCurrency(row.winning_bid) },
  { key: "platform_commission", header: "Commission", render: (row) => formatCurrency(row.platform_commission) },
  { key: "oem_payout", header: "OEM Payout", render: (row) => formatCurrency(row.oem_payout) },
  {
    key: "payment_status", header: "Payment Status", sortable: true,
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", paymentStatusColors[row.payment_status])}>
        {row.payment_status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "payment_method", header: "Method",
    render: (row) => (
      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        row.payment_method === "escrow" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
      )}>
        {row.payment_method === "escrow" ? "Escrow" : "UPI Fallback"}
      </span>
    ),
  },
  {
    key: "escrow_tx_id", header: "Escrow TX",
    render: (row) => row.escrow_tx_id || <span className="text-muted-foreground text-xs">—</span>,
  },
  { key: "release_condition", header: "Release Condition", className: "max-w-[150px] truncate" },
  {
    key: "sla_status", header: "SLA",
    render: (row) => <SLAPill count={1} type={row.sla_status === "on_track" ? "onTrack" : row.sla_status === "warning" ? "warning" : "overdue"} />,
  },
];

const filters: QueueFilter[] = [
  { key: "payment_status", label: "Payment Status", options: [
    { label: "Pending", value: "pending" }, { label: "Initiated", value: "initiated" },
    { label: "Held", value: "held" }, { label: "Released", value: "released" },
    { label: "Settled", value: "settled" }, { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" }, { label: "Timeout", value: "timeout" },
  ]},
  { key: "payment_method", label: "Method", options: [
    { label: "Escrow", value: "escrow" }, { label: "UPI Fallback", value: "upi_fallback" },
  ]},
  { key: "sla_status", label: "SLA", options: [
    { label: "On Track", value: "on_track" }, { label: "Warning", value: "warning" }, { label: "Overdue", value: "overdue" },
  ]},
  { key: "city", label: "City", options: [
    { label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" },
    { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" },
  ]},
];

export default function OpsPaymentExceptions() {
  const exceptions = mockPayments.filter(p => ["failed", "timeout", "refunded"].includes(p.payment_status));
  const allExceptions = mockPayments;

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Payment Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track all payments · SLA: Exceptions resolved within 4 hours</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total", count: allExceptions.length },
            { label: "Held in Escrow", count: allExceptions.filter(p => p.payment_status === "held").length },
            { label: "Settled", count: allExceptions.filter(p => p.payment_status === "settled").length },
            { label: "Exceptions", count: exceptions.length, highlight: exceptions.length > 0 },
            { label: "UPI Fallback", count: allExceptions.filter(p => p.payment_method === "upi_fallback").length },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-lg border bg-card px-3 py-2 text-center min-w-[100px]", s.highlight && s.count > 0 && "border-destructive")}>
              <p className={cn("text-lg font-bold", s.highlight && s.count > 0 && "text-destructive")}>{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {exceptions.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm">⚠️ EXCEPTIONS:</span>
            <span className="text-sm text-red-700 dark:text-red-400">
              {exceptions.length} payment(s) require immediate attention (failed/timeout/refunded)
            </span>
          </div>
        )}

        <QueueComponent
          title="All Payments"
          description={`${allExceptions.length} payments in pipeline`}
          columns={columns}
          data={allExceptions}
          filters={filters}
        />
      </div>
    </OpsLayout>
  );
}
