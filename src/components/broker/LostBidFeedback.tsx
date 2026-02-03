import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LostBidStats {
  totalLost: number;
  avgDifference: number;
  closeCalls: number; // Lost by < 5%
  timingIssues: number; // Lost in last 30 seconds
}

interface LostBidFeedbackProps {
  stats: LostBidStats;
  onTipClick?: (tipId: string) => void;
}

// Educational tips based on loss patterns
const getPersonalizedTips = (stats: LostBidStats) => {
  const tips: Array<{
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    actionText: string;
    category: "strategy" | "timing" | "pricing" | "general";
    priority: number;
  }> = [];

  // Close calls - almost won
  if (stats.closeCalls > 0) {
    tips.push({
      id: "close-calls",
      icon: <Target className="w-4 h-4" />,
      title: "So Close!",
      description: `You lost ${stats.closeCalls} auction${stats.closeCalls > 1 ? "s" : ""} by a small margin. Consider adding commission to strengthen your bids.`,
      actionText: "Learn about Effective Score",
      category: "pricing",
      priority: 1,
    });
  }

  // Timing issues
  if (stats.timingIssues > 0) {
    tips.push({
      id: "timing",
      icon: <Clock className="w-4 h-4" />,
      title: "Watch the Clock",
      description: "Some auctions were lost in the final seconds. Enable notifications to stay alert during closing time.",
      actionText: "Enable Smart Alerts",
      category: "timing",
      priority: 2,
    });
  }

  // Average difference analysis
  if (stats.avgDifference > 10000) {
    tips.push({
      id: "pricing-gap",
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Know Your Market",
      description: "Your bids are often below the winning amount. Research similar vehicles to calibrate your pricing.",
      actionText: "View Market Insights",
      category: "pricing",
      priority: 3,
    });
  }

  // General tips
  tips.push({
    id: "commission-boost",
    icon: <Zap className="w-4 h-4" />,
    title: "Commission Power",
    description: "Higher commission = higher Effective Score. This can help you win even with a slightly lower bid amount.",
    actionText: "How it Works",
    category: "strategy",
    priority: 4,
  });

  tips.push({
    id: "auction-types",
    icon: <Brain className="w-4 h-4" />,
    title: "Pick Your Battles",
    description: "Different auction types suit different strategies. Quick auctions favor speed, Extended auctions favor research.",
    actionText: "Auction Types Guide",
    category: "strategy",
    priority: 5,
  });

  return tips.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

// Positive reinforcement messages
const getPositiveMessage = (stats: LostBidStats) => {
  if (stats.totalLost === 0) {
    return {
      emoji: "🏆",
      message: "Perfect record! You haven't lost any bids.",
    };
  }
  if (stats.closeCalls > stats.totalLost * 0.5) {
    return {
      emoji: "💪",
      message: "You're competitive! Most losses were close calls.",
    };
  }
  if (stats.totalLost <= 3) {
    return {
      emoji: "🌟",
      message: "Great start! Every loss is a learning opportunity.",
    };
  }
  return {
    emoji: "📈",
    message: "Keep improving! Review tips below to boost your win rate.",
  };
};

const LostBidFeedback = ({ stats, onTipClick }: LostBidFeedbackProps) => {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const tips = getPersonalizedTips(stats);
  const positiveMessage = getPositiveMessage(stats);

  if (stats.totalLost === 0) return null;

  return (
    <div className="space-y-4">
      {/* Positive Reinforcement Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{positiveMessage.emoji}</div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{positiveMessage.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.closeCalls > 0 && `${stats.closeCalls} close call${stats.closeCalls > 1 ? "s" : ""} • `}
                Learning from losses makes you stronger
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-primary/60" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{stats.totalLost}</p>
          <p className="text-[10px] text-muted-foreground">Total Lost</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-warning">₹{(stats.avgDifference / 1000).toFixed(0)}k</p>
          <p className="text-[10px] text-muted-foreground">Avg Gap</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-accent">{stats.closeCalls}</p>
          <p className="text-[10px] text-muted-foreground">Close Calls</p>
        </div>
      </div>

      {/* Improvement Tips Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h3 className="font-medium text-sm">Tips to Improve</h3>
        </div>

        {tips.map((tip) => (
          <Card
            key={tip.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/30",
              expandedTip === tip.id && "border-primary/40 bg-primary/5"
            )}
            onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  tip.category === "pricing" && "bg-warning/10 text-warning",
                  tip.category === "timing" && "bg-info/10 text-info",
                  tip.category === "strategy" && "bg-accent/10 text-accent",
                  tip.category === "general" && "bg-primary/10 text-primary"
                )}>
                  {tip.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground">{tip.title}</h4>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
                      {tip.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {tip.description}
                  </p>
                  {expandedTip === tip.id && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-2 text-xs text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTipClick?.(tip.id);
                      }}
                    >
                      {tip.actionText}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LostBidFeedback;
