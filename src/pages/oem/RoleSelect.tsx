import { useNavigate } from "react-router-dom";
import { Bike, Briefcase, Building2, Crown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const roles = [
  {
    role: "SE",
    title: "Sales Executive",
    description: "Capture inspections, list vehicles",
    icon: Briefcase,
    path: "/",
  },
  {
    role: "SM",
    title: "Sales Manager",
    description: "Single store · pipeline & team oversight",
    icon: Building2,
    path: "/sm/dashboard",
  },
  {
    role: "GM",
    title: "General Manager",
    description: "Multi-store regional oversight",
    icon: Building2,
    path: "/gm/dashboard",
  },
  {
    role: "EA",
    title: "Entity Admin",
    description: "Org-wide scorecards & administration",
    icon: Crown,
    path: "/ea/dashboard",
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">DriveX OEM</h1>
          </div>
          <p className="text-muted-foreground">Ananda Honda Pvt Ltd</p>
        </div>

        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Continue as</p>

        <div className="space-y-3">
          {roles.map(({ role, title, description, icon: Icon, path }) => (
            <Card
              key={role}
              onClick={() => navigate(path)}
              className="p-4 cursor-pointer hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground py-6">Demo mode · select any role</p>
    </div>
  );
};

export default RoleSelect;
