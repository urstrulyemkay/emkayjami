export interface SummaryCardData {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  status: "success" | "warning" | "danger" | "info";
  link: string;
}

export const summaryCards: SummaryCardData[] = [
  { title: "Active Auctions", value: 12, change: 3, changeLabel: "vs yesterday", status: "info", link: "/ops/auctions/live" },
  { title: "Deals in Pipeline", value: 47, change: -2, changeLabel: "vs yesterday", status: "success", link: "/ops/auctions/deals" },
  { title: "Pending Pickups", value: 18, change: 5, changeLabel: "overdue", status: "warning", link: "/ops/logistics/pickups" },
  { title: "Payment Exceptions", value: 6, change: 2, changeLabel: "new today", status: "danger", link: "/ops/finance/exceptions" },
  { title: "Overdue Documentation", value: 9, change: 1, changeLabel: "critical", status: "danger", link: "/ops/docs/services" },
  { title: "Open Disputes", value: 3, change: 0, changeLabel: "same", status: "warning", link: "/ops/disputes" },
  { title: "KYC Pending", value: 14, change: 4, changeLabel: "new today", status: "warning", link: "/ops/entities/kyc" },
  { title: "Active Cascades", value: 5, change: 1, changeLabel: "triggered today", status: "info", link: "/ops/auctions/cascade" },
];

export interface QueueHealthRow {
  queue: string;
  module: string;
  total: number;
  assigned: number;
  unassigned: number;
  onTrack: number;
  warning: number;
  overdue: number;
  avgResolutionTime: string;
  link: string;
}

export const queueHealthData: QueueHealthRow[] = [
  { queue: "KYC Review", module: "Entities", total: 14, assigned: 10, unassigned: 4, onTrack: 8, warning: 4, overdue: 2, avgResolutionTime: "2h 15m", link: "/ops/entities/kyc" },
  { queue: "Deal Allocation", module: "Auctions", total: 47, assigned: 40, unassigned: 7, onTrack: 35, warning: 8, overdue: 4, avgResolutionTime: "45m", link: "/ops/auctions/deals" },
  { queue: "Pickup Scheduling", module: "Logistics", total: 18, assigned: 12, unassigned: 6, onTrack: 7, warning: 6, overdue: 5, avgResolutionTime: "1h 30m", link: "/ops/logistics/pickups" },
  { queue: "Payment Verification", module: "Finance", total: 23, assigned: 20, unassigned: 3, onTrack: 17, warning: 4, overdue: 2, avgResolutionTime: "3h 10m", link: "/ops/finance/settlements" },
  { queue: "RC Transfer", module: "Documentation", total: 31, assigned: 25, unassigned: 6, onTrack: 16, warning: 6, overdue: 9, avgResolutionTime: "4d 2h", link: "/ops/docs/rto" },
  { queue: "Dispute Resolution", module: "Disputes", total: 3, assigned: 3, unassigned: 0, onTrack: 1, warning: 1, overdue: 1, avgResolutionTime: "2d 5h", link: "/ops/disputes" },
  { queue: "Delta Review", module: "Auctions", total: 8, assigned: 6, unassigned: 2, onTrack: 5, warning: 2, overdue: 1, avgResolutionTime: "1h 45m", link: "/ops/auctions/delta" },
];

export interface ActivityItem {
  id: string;
  action: string;
  module: string;
  user: string;
  timestamp: string;
  details: string;
}

export const recentActivity: ActivityItem[] = [
  { id: "1", action: "KYC Approved", module: "Entities", user: "Priya M.", timestamp: "2 min ago", details: "Broker: Rajesh Auto Traders (Mumbai)" },
  { id: "2", action: "Auction Extended", module: "Auctions", user: "System", timestamp: "5 min ago", details: "AUC-4521 extended by 15 mins (reserve not met)" },
  { id: "3", action: "Payment Exception", module: "Finance", user: "Amit K.", timestamp: "12 min ago", details: "₹2.4L mismatch on Deal D-1892" },
  { id: "4", action: "Pickup Completed", module: "Logistics", user: "Runner: Suresh", timestamp: "18 min ago", details: "Vehicle KA-01-AB-1234 picked up from Whitefield" },
  { id: "5", action: "Dispute Opened", module: "Disputes", user: "Broker: Anand Motors", timestamp: "25 min ago", details: "Delta damage claim on Deal D-1887" },
  { id: "6", action: "RC Transfer Overdue", module: "Documentation", user: "System", timestamp: "30 min ago", details: "3 vehicles past 7-day deadline" },
  { id: "7", action: "Cascade Triggered", module: "Auctions", user: "System", timestamp: "45 min ago", details: "AUC-4518 → Cascade Round 2 started" },
  { id: "8", action: "Broker Onboarded", module: "Entities", user: "Neha S.", timestamp: "1h ago", details: "New broker: Metro Car Zone (Pune)" },
  { id: "9", action: "Deal Closed", module: "Auctions", user: "System", timestamp: "1h 15m ago", details: "Deal D-1890 closed at ₹4.2L" },
  { id: "10", action: "Strike Issued", module: "Trust", user: "QA Bot", timestamp: "2h ago", details: "Broker ID BRK-0045 — late pickup penalty" },
];
