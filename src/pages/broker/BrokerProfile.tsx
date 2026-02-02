import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Star, Shield, Coins, TrendingUp, Award,
  AlertTriangle, LogOut, Settings, ChevronRight, Building
} from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";

const BrokerProfile = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading, logout } = useBrokerAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/broker/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !broker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getLevelName = (level: number) => {
    const levels = ["New", "Active", "Preferred", "Trusted", "Elite"];
    return levels[Math.min(level - 1, 4)];
  };

  const getLevelColor = (level: number) => {
    const colors = ["gray", "blue", "green", "amber", "purple"];
    return colors[Math.min(level - 1, 4)];
  };

  const getNextLevelProgress = () => {
    const thresholds = [0, 21, 41, 61, 81, 100];
    const currentThreshold = thresholds[broker.level - 1];
    const nextThreshold = thresholds[broker.level];
    const progress = ((broker.trust_score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/broker/login");
  };

  // Trust score breakdown (mock data)
  const trustBreakdown = [
    { label: "Completion ratio", value: 85, weight: "25%" },
    { label: "RC compliance", value: 90, weight: "25%" },
    { label: "Dispute rate", value: 95, weight: "20%" },
    { label: "Payment timeliness", value: 100, weight: "15%" },
    { label: "Participation", value: 70, weight: "10%" },
    { label: "Tenure", value: 60, weight: "5%" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/broker")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{broker.business_name}</h2>
            <p className="text-sm opacity-90">{broker.owner_name}</p>
            <p className="text-xs opacity-75">{broker.city} • Since Jan 2026</p>
          </div>
        </div>
      </div>

      {/* Trust Score Card */}
      <div className="px-4 -mt-12">
        <div className="bg-card rounded-2xl border shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Trust Score</h3>
            </div>
            <Badge className={`bg-${getLevelColor(broker.level)}-500 text-white`}>
              Level {broker.level} – {getLevelName(broker.level)}
            </Badge>
          </div>

          {/* Score Display */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold">{broker.trust_score}</span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>

          {/* Progress to Next Level */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {broker.level + 1}</span>
              <span className="font-medium">{Math.round(getNextLevelProgress())}%</span>
            </div>
            <Progress value={getNextLevelProgress()} className="h-2" />
          </div>

          {/* Status */}
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">In Good Standing</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Score Breakdown</h3>
        <div className="space-y-3">
          {trustBreakdown.map((item) => (
            <div key={item.label} className="bg-card border rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.weight}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={item.value} className="flex-1 h-2" />
                <span className="text-sm font-medium w-8">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level Benefits */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Current Level Benefits</h3>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Unlimited auctions per day</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Support SLA: 6 hours</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Priority notifications</span>
          </div>
        </div>
      </div>

      {/* Strikes */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Strikes</h3>
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {broker.strikes_count} / 3
          </Badge>
        </div>
        {broker.strikes_count === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ No active strikes. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ You have {broker.strikes_count} active strike(s).
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Settings</h3>
        <div className="space-y-2">
          {[
            { label: "Preferences", icon: Settings },
            { label: "Notifications", icon: Award },
            { label: "Help & Support", icon: Shield },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <BrokerBottomNav activeTab="profile" />
    </div>
  );
};

export default BrokerProfile;
