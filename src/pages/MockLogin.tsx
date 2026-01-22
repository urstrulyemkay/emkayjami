import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/inspection";
import { User, Briefcase, Shield, Bike } from "lucide-react";

const MockLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate("/");
  };

  const roles = [
    {
      role: "executive" as UserRole,
      title: "OEM Sales Executive",
      description: "Capture 2-wheeler inspections",
      icon: Briefcase,
      primary: true,
    },
    {
      role: "customer" as UserRole,
      title: "Customer",
      description: "View reports, provide consent",
      icon: User,
      primary: false,
    },
    {
      role: "admin" as UserRole,
      title: "Admin",
      description: "Platform management",
      icon: Shield,
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">DriveX</h1>
          </div>
          <p className="text-muted-foreground">2-Wheeler Inspection Truth</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Select Role (Dev Mode)
          </p>

          {roles.map(({ role, title, description, icon: Icon, primary }) => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                primary
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    primary ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${primary ? "text-primary-foreground" : "text-foreground"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${primary ? "text-primary-foreground" : "text-foreground"}`}>
                    {title}
                  </p>
                  <p className={`text-sm ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Development Mode • No authentication required
        </p>
      </div>
    </div>
  );
};

export default MockLogin;
