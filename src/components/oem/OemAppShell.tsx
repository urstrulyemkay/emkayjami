import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Bike, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATIONS } from "@/data/oemMockData";

export type OemRoleVariant = "SM" | "GM" | "EA";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

import { LayoutDashboard, ListChecks, Gavel, Users, BarChart3, Building2, UserCog } from "lucide-react";

const NAV: Record<OemRoleVariant, NavItem[]> = {
  SM: [
    { label: "Home", path: "/sm/dashboard", icon: LayoutDashboard },
    { label: "Pipeline", path: "/sm/pipeline", icon: ListChecks },
    { label: "Auctions", path: "/sm/auctions", icon: Gavel },
    { label: "Team", path: "/sm/team", icon: Users },
    { label: "Reports", path: "/sm/reports", icon: BarChart3 },
  ],
  GM: [
    { label: "Home", path: "/gm/dashboard", icon: LayoutDashboard },
    { label: "Stores", path: "/gm/stores", icon: Building2 },
    { label: "Auctions", path: "/gm/auctions", icon: Gavel },
    { label: "Team", path: "/gm/team", icon: Users },
    { label: "Reports", path: "/gm/reports", icon: BarChart3 },
  ],
  EA: [
    { label: "Home", path: "/ea/dashboard", icon: LayoutDashboard },
    { label: "Stores", path: "/ea/stores", icon: Building2 },
    { label: "Auctions", path: "/ea/auctions", icon: Gavel },
    { label: "Team", path: "/ea/team", icon: Users },
    { label: "More", path: "/ea/profile", icon: UserCog },
  ],
};

interface Props {
  variant: OemRoleVariant;
  contextLabel?: string;
  contextSwitch?: () => void;
  userName?: string;
  children: React.ReactNode;
}

export const OemAppShell = ({ variant, contextLabel, contextSwitch, userName = "User", children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV[variant];
  const unread = NOTIFICATIONS.filter((n) => !n.read && n.scope.includes(variant)).length;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Bike className="w-4 h-4 text-primary-foreground" />
          </div>
          <button
            onClick={contextSwitch}
            disabled={!contextSwitch}
            className="flex items-center gap-1 min-w-0 flex-1"
          >
            <div className="text-left min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">{variant === "SM" ? "Sales Manager" : variant === "GM" ? "General Manager" : "Entity Admin"}</p>
              <p className="text-sm font-semibold truncate leading-tight">{contextLabel ?? "—"}</p>
            </div>
            {contextSwitch && <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <button
            onClick={() => navigate("/oem/notifications")}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] bg-destructive text-destructive-foreground border-0">
                {unread}
              </Badge>
            )}
          </button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-muted">
              {userName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {items.map((it) => {
            const active =
              location.pathname === it.path ||
              (it.path !== `/${variant.toLowerCase()}/dashboard` && location.pathname.startsWith(it.path));
            const Icon = it.icon;
            return (
              <button
                key={it.path}
                onClick={() => navigate(it.path)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
