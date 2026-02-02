import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Star, Shield, Coins, TrendingUp, Award,
  AlertTriangle, LogOut, Settings, ChevronRight, Building, Bell, Volume2
} from "lucide-react";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import { useBrokerBids } from "@/hooks/useBrokerBids";
import { useBrokerStrikes } from "@/hooks/useBrokerStrikes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  TRUST_BREAKDOWN,
  LEVELS,
  getLevelFromScore,
  getProgressToNextLevel,
} from "@/data/brokerMockData";
import { toast } from "sonner";

const BrokerProfile = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading, logout } = useBrokerAuth();

  // Real-time hooks
  const { stats, loading: bidsLoading } = useBrokerBids(broker?.id);
  const { activeStrikes, strikesCount, loading: strikesLoading } = useBrokerStrikes(broker?.id);
  
  // Sound notifications
  const { playSound, soundEnabled, toggleSound } = useSoundNotifications();
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const { isSupported, isSubscribed, permission, loading: notifLoading, subscribe, unsubscribe } = usePushNotifications(broker?.id);

  const handleNotificationToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Notifications disabled");
        playSound('tick');
      } else {
        await subscribe();
        toast.success("Notifications enabled! You'll be notified when outbid.");
        playSound('success');
      }
    } catch (err) {
      console.error("Notification toggle error:", err);
      toast.error("Failed to update notification settings");
      playSound('error');
    }
  };

  const handleSoundToggle = () => {
    const newValue = toggleSound();
    setSoundOn(newValue);
    toast.success(newValue ? "Sound notifications enabled" : "Sound notifications disabled");
  };
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

  const levelConfig = getLevelFromScore(broker.trust_score);
  const nextLevel = LEVELS[broker.level] || LEVELS[LEVELS.length - 1];
  const progressToNext = getProgressToNextLevel(broker.trust_score, broker.level);

  const handleLogout = async () => {
    await logout();
    navigate("/broker/login");
  };

  // Calculate RC transfer stats from real data
  const rcTransfersCompleted = stats.totalWins; // Simplified - in real app would track separately
  const onTimePercentage = rcTransfersCompleted > 0 ? 
    Math.round((Math.max(0, rcTransfersCompleted - strikesCount) / rcTransfersCompleted) * 100) : 100;

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
            <Badge className={`${levelConfig.bgColor} text-white`}>
              Level {broker.level} – {levelConfig.name}
            </Badge>
          </div>

          {/* Score Display */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold">{broker.trust_score}</span>
            <span className="text-muted-foreground mb-1">/ 100</span>
          </div>

          {/* Progress to Next Level */}
          {broker.level < 5 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {broker.level + 1} ({nextLevel.name})</span>
                <span className="font-medium">{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Need {nextLevel.minScore - broker.trust_score} more points
              </p>
            </div>
          )}

          {/* Status */}
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">
              {broker.account_status === "active" ? "In Good Standing" : broker.account_status}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats - Using real data */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Performance Stats</h3>
        {bidsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{stats.totalWins}</p>
              <p className="text-xs text-muted-foreground">Total Wins</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{stats.winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{rcTransfersCompleted}</p>
              <p className="text-xs text-muted-foreground">RC Transfers</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{onTimePercentage}%</p>
              <p className="text-xs text-muted-foreground">On-time RC</p>
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Score Breakdown</h3>
        <div className="space-y-3">
          {TRUST_BREAKDOWN.map((item) => (
            <div key={item.label} className="bg-card border rounded-xl p-3">
              <div className="flex justify-between text-sm mb-2">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.weight}%</span>
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
          {levelConfig.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{benefit}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm pt-2 border-t border-amber-200 dark:border-amber-700 mt-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Support SLA: {levelConfig.supportSLA}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Auctions/day: {levelConfig.auctionsPerDay}</span>
          </div>
        </div>
      </div>

      {/* Strikes - Using real data */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Strikes</h3>
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {strikesCount} / 3
          </Badge>
        </div>
        {strikesLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : strikesCount === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ No active strikes. Keep up the good work!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeStrikes.map((strike) => (
              <div 
                key={strike.id}
                className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="destructive" 
                    className={
                      strike.severity === "critical" ? "bg-red-600" :
                      strike.severity === "major" ? "bg-orange-500" : "bg-yellow-500"
                    }
                  >
                    {strike.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires: {new Date(strike.expires_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {strike.reason}
                </p>
                {strike.penalty_coins && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Penalty: -{strike.penalty_coins} coins, -{strike.penalty_trust_score || 0} trust score
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
              ⚠️ 3 strikes = account suspension
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Notifications</h3>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're outbid
                </p>
              </div>
            </div>
            {isSupported ? (
              <Switch
                checked={isSubscribed}
                onCheckedChange={handleNotificationToggle}
                disabled={notifLoading}
              />
            ) : (
              <Badge variant="outline" className="text-xs">Not supported</Badge>
            )}
          </div>
          {permission === "denied" && (
            <p className="text-xs text-destructive mt-3">
              Notifications blocked. Enable them in your browser settings.
            </p>
          )}
        </div>

        {/* Sound Notifications Toggle */}
        <div className="bg-card border rounded-xl p-4 mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Sound Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Subtle audio feedback for actions
                </p>
              </div>
            </div>
            <Switch
              checked={soundOn}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">Settings</h3>
        <div className="space-y-2">
          <button
            className="w-full flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/broker/help")}
            className="w-full flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <BrokerBottomNav activeTab="profile" />
    </div>
  );
};

export default BrokerProfile;
