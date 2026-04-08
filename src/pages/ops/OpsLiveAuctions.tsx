import { useNavigate } from "react-router-dom";
import { OpsLayout } from "@/components/ops/OpsLayout";
import { QueueComponent, type QueueColumn, type QueueFilter } from "@/components/ops/QueueComponent";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockLiveAuctions, type LiveAuctionItem } from "@/data/auctionOpsMockData";

const formatCurrency = (v: number) => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "—";

const columns: QueueColumn<LiveAuctionItem>[] = [
  { key: "auction_id", header: "Auction ID", sortable: true },
  { key: "vehicle", header: "Vehicle", sortable: true, className: "max-w-[200px] truncate" },
  { key: "oem", header: "OEM", sortable: true },
  { key: "store", header: "Store" },
  { key: "se", header: "SE" },
  {
    key: "auction_type", header: "Type",
    render: (row) => {
      const colors: Record<string, string> = { quick: "bg-blue-100 text-blue-800", flexible: "bg-purple-100 text-purple-800", extended: "bg-indigo-100 text-indigo-800" };
      return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", colors[row.auction_type])}>{row.auction_type}</span>;
    },
  },
  { key: "duration", header: "Duration" },
  {
    key: "time_remaining_min", header: "Time Left", sortable: true,
    render: (row) => {
      const min = row.time_remaining_min;
      const color = min <= 1 ? "text-red-600 font-bold animate-pulse" : min <= 5 ? "text-red-600 font-bold" : min <= 10 ? "text-orange-600 font-semibold" : "text-foreground";
      return <span className={color}>{min} min</span>;
    },
  },
  { key: "bid_count", header: "Bids", sortable: true, className: "text-center", render: (row) => <span className={row.bid_count === 0 ? "text-red-600 font-bold" : ""}>{row.bid_count}</span> },
  { key: "highest_bid", header: "Highest Bid", sortable: true, render: (row) => formatCurrency(row.highest_bid) },
  { key: "effective_score", header: "Eff. Score", sortable: true, render: (row) => row.effective_score > 0 ? row.effective_score.toLocaleString("en-IN") : "—" },
  { key: "customer_expectation", header: "Expectation", render: (row) => formatCurrency(row.customer_expectation) },
  {
    key: "bid_vs_expectation", header: "Bid vs Exp", sortable: true,
    render: (row) => {
      if (row.bid_vs_expectation === 0) return "—";
      const pct = row.bid_vs_expectation;
      const color = pct >= 100 ? "text-green-600" : pct >= 80 ? "text-yellow-600" : "text-red-600";
      return <span className={cn("font-semibold", color)}>{pct}%</span>;
    },
  },
  { key: "broadcast_scope", header: "Scope" },
  {
    key: "status", header: "Status",
    render: (row) => {
      const colors: Record<string, string> = { scheduled: "bg-muted text-muted-foreground", live: "bg-green-100 text-green-800", ending_soon: "bg-red-100 text-red-800", ended_sold: "bg-emerald-100 text-emerald-800", ended_no_sale: "bg-gray-100 text-gray-800", ended_cascading: "bg-yellow-100 text-yellow-800" };
      return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", colors[row.status])}>{row.status.replace(/_/g, " ")}</span>;
    },
  },
];

const filters: QueueFilter[] = [
  { key: "auction_type", label: "Type", options: [{ label: "Quick", value: "quick" }, { label: "Flexible", value: "flexible" }, { label: "Extended", value: "extended" }] },
  { key: "status", label: "Status", options: [{ label: "Scheduled", value: "scheduled" }, { label: "Live", value: "live" }, { label: "Ending Soon", value: "ending_soon" }, { label: "Sold", value: "ended_sold" }, { label: "No Sale", value: "ended_no_sale" }, { label: "Cascading", value: "ended_cascading" }] },
  { key: "broadcast_scope", label: "City", options: [{ label: "Bangalore", value: "Bangalore" }, { label: "Mumbai", value: "Mumbai" }, { label: "Chennai", value: "Chennai" }, { label: "Delhi", value: "Delhi" }] },
];

export default function OpsLiveAuctions() {
  const navigate = useNavigate();

  // Sort by time remaining ascending
  const sorted = [...mockLiveAuctions].sort((a, b) => a.time_remaining_min - b.time_remaining_min);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Live Auctions</h1>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring of all active and upcoming auctions · Auto-refresh every 5 sec
          </p>
        </div>

        {/* Alert for 0-bid auctions ending soon */}
        {sorted.some((a) => a.bid_count === 0 && a.time_remaining_min <= 5) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <span className="text-red-600 font-bold text-sm">🔴 ALERT:</span>
            <span className="text-sm text-red-700 dark:text-red-400">
              {sorted.filter((a) => a.bid_count === 0 && a.time_remaining_min <= 5).length} auction(s) ending with 0 bids!
            </span>
          </div>
        )}

        <QueueComponent
          title="Active Auctions"
          description={`${sorted.filter((a) => a.status === "live" || a.status === "ending_soon").length} auctions currently live`}
          columns={columns}
          data={sorted}
          filters={filters}
          onRowClick={(row) => navigate(`/ops/auctions/live/${row.id}`)}
        />
      </div>
    </OpsLayout>
  );
}
