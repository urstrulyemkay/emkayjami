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
  Coins,
  Shield,
  Gavel,
  ClipboardList,
  Bell,
  Settings,
  HelpCircle,
  Flame,
  Timer,
  Target,
  Award,
} from "lucide-react";

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Mock data for pending actions
  const pendingActions = [
    {
      id: "1",
      type: "approval",
      title: "Bike from Amit",
      registration: "KA-01-AB-1234",
      description: "Pending customer approval",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "consent",
      title: "Honda Shine",
      registration: "MH-12-CD-5678",
      description: "Awaiting OTP verification",
      time: "4 hours ago",
    },
    {
      id: "3",
      type: "pickup",
      title: "TVS Apache RTR 160",
      registration: "KA-05-EF-9012",
      description: "Pickup scheduled for today",
      time: "1 day ago",
    },
  ];

  // Today's stats
  const todayStats = {
    inspections: 4,
    auctions: 2,
    avgFirstBid: 34250,
    slaMet: 100,
  };

  // Recent activities
  const recentActivities = [
    {
      id: "1",
      icon: "🏆",
      text: "Won bid on TVS Apache",
      time: "15m ago",
      coins: null,
    },
    {
      id: "2",
      icon: "✅",
      text: "Customer approved report",
      time: "1h ago",
      coins: null,
    },
    {
      id: "3",
      icon: "💰",
      text: "Quick sale bonus",
      time: "2h ago",
      coins: "+100",
    },
    {
      id: "4",
      icon: "🔥",
      text: "7-day streak achieved",
      time: "Today",
      coins: "+50",
    },
  ];

  // Recent inspections - 2 wheelers
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {getGreeting()},
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {user.name.split(" ")[0]}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Wallet & Trust Quick Access */}
      <section className="px-6 mb-6">
        <div className="flex gap-3">
          {/* Coins Card */}
          <button
            onClick={() => navigate("/trust")}
            className="flex-1 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Coins</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {user.coins.toLocaleString()}
            </p>
          </button>

          {/* Trust Score Card */}
          <button
            onClick={() => navigate("/trust")}
            className="flex-1 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Trust</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">{user.trustScore}</p>
              <span className="text-xs text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +12
              </span>
            </div>
          </button>

          {/* Streak Card */}
          <button
            onClick={() => navigate("/trust")}
            className="flex-1 p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{user.streak}</p>
          </button>
        </div>
      </section>

      {/* Action Tabs */}
      <section className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => navigate("/inspection/new")}
            className="h-14 flex-col gap-1"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">New Inspection</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/auctions")}
            className="h-14 flex-col gap-1"
          >
            <Gavel className="w-5 h-5" />
            <span className="text-xs">Auctions</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/sales")}
            className="h-14 flex-col gap-1"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs">My Sales</span>
          </Button>
        </div>
      </section>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <section className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <p className="font-medium text-foreground">Pending Actions</p>
              <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                {pendingActions.length}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {pendingActions.slice(0, 2).map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(`/inspection/${action.id}`)}
                className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Bike className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {action.title} ({action.registration})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description} • {action.time}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>

          {pendingActions.length > 2 && (
            <button className="w-full mt-2 py-2 text-sm text-muted-foreground text-center">
              View all {pendingActions.length} pending actions
            </button>
          )}
        </section>
      )}

      {/* Today's Stats */}
      <section className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <p className="font-medium text-foreground">Today's Stats</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {todayStats.inspections}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Inspections</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Gavel className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {todayStats.auctions}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Auctions</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold text-foreground">
                ₹{(todayStats.avgFirstBid / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Avg 1st Bid</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold text-success">
                {todayStats.slaMet}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">SLA Met</p>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-muted-foreground" />
            <p className="font-medium text-foreground">Recent Activities</p>
          </div>
          <button className="text-sm text-muted-foreground flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
            >
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              {activity.coins && (
                <span className="text-sm font-medium text-success">
                  {activity.coins}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Inspections */}
      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-foreground">Recent Inspections</p>
          <button className="text-sm text-muted-foreground flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {recentInspections.map((inspection) => (
            <button
              key={inspection.id}
              onClick={() => navigate(`/inspection/${inspection.id}`)}
              className="w-full p-4 rounded-xl border border-border bg-card flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Bike className="w-5 h-5 text-muted-foreground" />
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1">
            <Camera className="w-5 h-5 text-primary" />
            <span className="text-xs text-primary font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/auctions")}
            className="flex flex-col items-center gap-1"
          >
            <Gavel className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Auctions</span>
          </button>
          <button
            onClick={() => navigate("/trust")}
            className="flex flex-col items-center gap-1"
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Trust</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Help</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ExecutiveDashboard;
