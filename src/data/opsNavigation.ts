import {
  LayoutDashboard,
  Users,
  Gavel,
  Truck,
  DollarSign,
  FileText,
  Shield,
  AlertTriangle,
  BarChart3,
  Settings,
  Building2,
  UserCheck,
  GitBranch,
  Eye,
  HandCoins,
  Receipt,
  ClipboardCheck,
  Scale,
  MessageSquare,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type OpsRole =
  | "super_admin"
  | "ops_manager"
  | "onboarding_ops"
  | "kam"
  | "auction_ops"
  | "logistics_coordinator"
  | "runner"
  | "finance_ops"
  | "doc_exec"
  | "doc_lead"
  | "qa_audit";

export interface OpsNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: OpsRole[] | "all";
  children?: OpsNavItem[];
}

export const opsNavigation: OpsNavItem[] = [
  {
    title: "Dashboard",
    url: "/ops/dashboard",
    icon: LayoutDashboard,
    roles: "all",
  },
  {
    title: "Entities",
    url: "/ops/entities",
    icon: Users,
    roles: ["super_admin", "ops_manager", "onboarding_ops", "kam"],
    children: [
      { title: "OEM Directory", url: "/ops/entities/oem", icon: Building2, roles: ["super_admin", "ops_manager", "onboarding_ops"] },
      { title: "Broker Directory", url: "/ops/entities/brokers", icon: Users, roles: ["super_admin", "ops_manager", "onboarding_ops", "kam"] },
      { title: "KYC Review Queue", url: "/ops/entities/kyc", icon: UserCheck, roles: ["super_admin", "ops_manager", "onboarding_ops"] },
      { title: "Onboarding Pipeline", url: "/ops/entities/onboarding", icon: GitBranch, roles: ["super_admin", "ops_manager", "onboarding_ops"] },
    ],
  },
  {
    title: "Auctions & Deals",
    url: "/ops/auctions",
    icon: Gavel,
    roles: ["super_admin", "ops_manager", "auction_ops", "kam"],
    children: [
      { title: "Live Auctions", url: "/ops/auctions/live", icon: Eye, roles: ["super_admin", "ops_manager", "auction_ops"] },
      { title: "Deal Tracker", url: "/ops/auctions/deals", icon: HandCoins, roles: ["super_admin", "ops_manager", "auction_ops", "kam"] },
      { title: "Delta Review", url: "/ops/auctions/delta", icon: GitBranch, roles: ["super_admin", "ops_manager", "auction_ops"] },
      { title: "Cascade Monitor", url: "/ops/auctions/cascade", icon: TrendingUp, roles: ["super_admin", "ops_manager", "auction_ops"] },
    ],
  },
  {
    title: "Logistics",
    url: "/ops/logistics",
    icon: Truck,
    roles: ["super_admin", "ops_manager", "logistics_coordinator", "runner"],
    children: [
      { title: "Pickup Queue", url: "/ops/logistics/pickups", icon: Truck, roles: ["super_admin", "ops_manager", "logistics_coordinator", "runner"] },
      { title: "Runner Dashboard", url: "/ops/logistics/runners", icon: Users, roles: ["super_admin", "ops_manager", "logistics_coordinator"] },
    ],
  },
  {
    title: "Finance",
    url: "/ops/finance",
    icon: DollarSign,
    roles: ["super_admin", "ops_manager", "finance_ops"],
    children: [
      { title: "Settlements", url: "/ops/finance/settlements", icon: Receipt, roles: ["super_admin", "ops_manager", "finance_ops"] },
      { title: "Exceptions", url: "/ops/finance/exceptions", icon: AlertTriangle, roles: ["super_admin", "ops_manager", "finance_ops"] },
    ],
  },
  {
    title: "Documentation",
    url: "/ops/docs",
    icon: FileText,
    roles: ["super_admin", "ops_manager", "doc_exec", "doc_lead"],
    children: [
      { title: "Service Requests", url: "/ops/docs/services", icon: ClipboardCheck, roles: ["super_admin", "ops_manager", "doc_exec", "doc_lead"] },
      { title: "RTO Tracking", url: "/ops/docs/rto", icon: FileText, roles: ["super_admin", "ops_manager", "doc_exec", "doc_lead"] },
    ],
  },
  {
    title: "Trust & Compliance",
    url: "/ops/trust",
    icon: Shield,
    roles: ["super_admin", "ops_manager", "qa_audit"],
  },
  {
    title: "Disputes",
    url: "/ops/disputes",
    icon: Scale,
    roles: ["super_admin", "ops_manager", "qa_audit"],
  },
  {
    title: "Reports",
    url: "/ops/reports",
    icon: BarChart3,
    roles: ["super_admin", "ops_manager"],
  },
  {
    title: "Settings",
    url: "/ops/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];
