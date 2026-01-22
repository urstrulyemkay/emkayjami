import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Camera,
  ChevronRight,
  CheckCircle,
  Clock,
  TrendingUp,
  LogOut,
  Bike,
} from "lucide-react";

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Mock data for recent inspections - 2 wheelers
  const recentInspections = [
    {
      id: "1",
      registration: "MH-12-AB-1234",
      vehicle: "Honda Activa 6G",
      time: "15m ago",
      status: "completed",
    },
    {
      id: "2",
      registration: "MH-14-CD-5678",
      vehicle: "TVS Jupiter",
      time: "1h ago",
      status: "pending",
    },
    {
      id: "3",
      registration: "MH-01-EF-9012",
      vehicle: "Royal Enfield Classic 350",
      time: "2h ago",
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Good morning,</p>
            <h1 className="text-2xl font-bold text-foreground">{user.name.split(" ")[0]}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Trust Score */}
      <section className="px-6 mb-8">
        <p className="text-muted-foreground text-sm mb-1">Trust Score</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-foreground">{user.trustScore}</span>
          <span className="text-success text-sm flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12
          </span>
        </div>
      </section>

      {/* Primary Action */}
      <section className="px-6 mb-8">
        <Button
          onClick={() => navigate("/inspection/new")}
          className="w-full h-14 text-base font-medium gap-2"
          size="lg"
        >
          <Camera className="w-5 h-5" />
          Start Inspection
        </Button>
      </section>

      {/* Stats Grid */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">4</p>
            <p className="text-muted-foreground text-sm">Pending</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-3xl font-bold text-foreground">12</p>
            <p className="text-muted-foreground text-sm">Today</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success">98%</p>
            <p className="text-muted-foreground text-sm">Accuracy</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/pending")}
            className="p-4 rounded-xl border border-border bg-card text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <p className="font-medium text-foreground">Pending Consents</p>
            <p className="text-sm text-muted-foreground">3 awaiting</p>
          </button>
          <button
            onClick={() => navigate("/trust")}
            className="p-4 rounded-xl border border-border bg-card text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="font-medium text-foreground">Trust Status</p>
            <p className="text-sm text-muted-foreground">{user.trustLevel} Level</p>
          </button>
        </div>
      </section>

      {/* Recent Inspections */}
      <section className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground text-sm">Recent</p>
          <button className="text-sm text-foreground flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {recentInspections.map((inspection) => (
            <button
              key={inspection.id}
              onClick={() => navigate(`/inspection/${inspection.id}`)}
              className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Bike className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {inspection.registration}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {inspection.vehicle} • {inspection.time}
                </p>
              </div>
              {inspection.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-warning flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExecutiveDashboard;
