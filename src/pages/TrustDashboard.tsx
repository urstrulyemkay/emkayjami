import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Flame, Coins, TrendingUp, Shield, Star, Target, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TRUST_LEVELS = [
  { level: "Bronze", min: 0, max: 249, color: "bg-amber-600" },
  { level: "Silver", min: 250, max: 499, color: "bg-gray-400" },
  { level: "Gold", min: 500, max: 749, color: "bg-yellow-500" },
  { level: "Platinum", min: 750, max: 1000, color: "bg-gradient-to-r from-cyan-400 to-blue-500" },
];

const ACHIEVEMENTS = [
  { id: "first_inspection", title: "First Steps", description: "Complete your first inspection", icon: Star, earned: true },
  { id: "streak_7", title: "Week Warrior", description: "7-day inspection streak", icon: Flame, earned: true },
  { id: "accuracy_95", title: "Sharp Eye", description: "Maintain 95%+ accuracy", icon: Target, earned: false },
  { id: "inspections_100", title: "Centurion", description: "Complete 100 inspections", icon: Award, earned: false },
];

const TrustDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const trustScore = user?.trustScore || 720;
  const trustLevel = user?.trustLevel || "Gold";
  const coins = user?.coins || 2450;
  const streak = user?.streak || 12;

  const currentLevelData = TRUST_LEVELS.find((l) => l.level === trustLevel) || TRUST_LEVELS[2];
  const progressInLevel = ((trustScore - currentLevelData.min) / (currentLevelData.max - currentLevelData.min)) * 100;
  const pointsToNext = currentLevelData.max - trustScore;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Trust Dashboard</h1>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Trust Score Card */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${currentLevelData.color} flex items-center justify-center`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trust Level</p>
                <p className="text-xl font-bold text-foreground">{trustLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-foreground">{trustScore}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to next level</span>
              <span className="text-foreground font-medium">{pointsToNext} points away</span>
            </div>
            <Progress value={progressInLevel} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentLevelData.min}</span>
              <span>{currentLevelData.max}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-warning" />
              <span className="text-sm text-muted-foreground">Coins</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{coins.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">earned</p>
          </div>
        </div>

        {/* Trust Level Progress */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-4">Trust Levels</p>
          <div className="space-y-3">
            {TRUST_LEVELS.map((level) => {
              const isCurrentLevel = level.level === trustLevel;
              const isPastLevel = trustScore > level.max;
              return (
                <div key={level.level} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${level.color} flex items-center justify-center ${
                      !isCurrentLevel && !isPastLevel ? "opacity-40" : ""
                    }`}
                  >
                    {isPastLevel ? (
                      <Trophy className="w-4 h-4 text-white" />
                    ) : (
                      <Shield className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          isCurrentLevel ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {level.level}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {level.min} - {level.max} pts
                      </span>
                    </div>
                    {isCurrentLevel && (
                      <Progress value={progressInLevel} className="h-1 mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Achievements</p>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border ${
                  achievement.earned
                    ? "bg-success/10 border-success/20"
                    : "bg-card border-border opacity-50"
                }`}
              >
                <achievement.icon
                  className={`w-6 h-6 mb-2 ${
                    achievement.earned ? "text-success" : "text-muted-foreground"
                  }`}
                />
                <p className="font-medium text-foreground text-sm">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <p className="font-medium text-foreground">How to Earn Points</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete inspection</span>
              <span className="text-success font-medium">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">All 12 images captured</span>
              <span className="text-success font-medium">+5 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Video evidence</span>
              <span className="text-success font-medium">+5 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily streak bonus</span>
              <span className="text-success font-medium">+2 pts/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer consent</span>
              <span className="text-success font-medium">+3 pts</span>
            </div>
          </div>
        </div>

        {/* Redeem Button */}
        <Button className="w-full h-12" variant="outline">
          <Coins className="w-5 h-5 mr-2 text-warning" />
          Redeem {coins.toLocaleString()} Coins
        </Button>
      </div>
    </div>
  );
};

export default TrustDashboard;
