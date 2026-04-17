import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/inspection";
import { User, Briefcase, Shield, Bike, Store, Building2, Crown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GM, SMS, ORG } from "@/data/oemMockData";

type OemRole = {
  key: string;
  title: string;
  persona: string;
  scope: string;
  icon: typeof Briefcase;
  path: string;
  authRole?: UserRole; // if set, log in via AuthContext first
};

const MockLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const sm = SMS[0];

  const oemRoles: OemRole[] = [
    {
      key: "SE",
      title: "Sales Executive",
      persona: "Field user",
      scope: "Capture inspections, list vehicles",
      icon: Briefcase,
      path: "/",
      authRole: "executive",
    },
    {
      key: "SM",
      title: "Sales Manager",
      persona: sm.name,
      scope: "Single store · pipeline & team",
      icon: Building2,
      path: "/sm/dashboard",
    },
    {
      key: "GM",
      title: "General Manager",
      persona: GM.name,
      scope: "Bengaluru region · 4 stores",
      icon: Building2,
      path: "/gm/dashboard",
    },
    {
      key: "EA",
      title: "Entity Admin",
      persona: ORG.name,
      scope: "Org-wide scorecard & admin",
      icon: Crown,
      path: "/ea/dashboard",
    },
  ];

  const handleOem = (r: OemRole) => {
    if (r.authRole) login(r.authRole);
    navigate(r.path);
  };

  const otherRoles = [
    {
      role: "customer" as UserRole,
      title: "Customer",
      description: "View reports, provide consent",
      icon: User,
    },
    {
      role: "admin" as UserRole,
      title: "Admin",
      description: "Platform management",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">DriveX</h1>
          </div>
          <p className="text-muted-foreground">2-Wheeler Truth Infrastructure</p>
        </div>

        {/* OEM Roles */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          OEM · Continue as
        </p>
        <div className="space-y-2 mb-8">
          {oemRoles.map((r) => {
            const Icon = r.icon;
            return (
              <Card
                key={r.key}
                onClick={() => handleOem(r)}
                className="p-3.5 cursor-pointer hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{r.title}</p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {r.key}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/70 mt-0.5 truncate">{r.persona}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.scope}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Other portals */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Other Portals
        </p>
        <div className="space-y-2">
          {otherRoles.map(({ role, title, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => {
                login(role);
                navigate("/");
              }}
              className="w-full p-3 rounded-xl border border-border bg-card text-card-foreground text-left hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={() => navigate("/broker/login")}
            className="w-full p-3 rounded-xl border border-border bg-card text-left hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Broker / Dealer</p>
                <p className="text-xs text-muted-foreground">Bid on vehicles, manage purchases</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/ops/login")}
            className="w-full p-3 rounded-xl border border-border bg-card text-left hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Internal Ops</p>
                <p className="text-xs text-muted-foreground">DriveX operations team</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Demo mode · No password required
        </p>
      </div>
    </div>
  );
};

export default MockLogin;
