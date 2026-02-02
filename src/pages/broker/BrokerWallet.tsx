import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Coins, TrendingUp, TrendingDown, Gift,
  Trophy, Star, Award, ShoppingBag, Clock
} from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import {
  WALLET_TRANSACTIONS,
  SHOP_ITEMS,
  EARNING_OPPORTUNITIES,
  BROKER_BADGES,
} from "@/data/brokerMockData";

const BrokerWallet = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "shop" | "badges">("overview");

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const earnedBadges = BROKER_BADGES.filter(b => b.earnedAt);
  const inProgressBadges = BROKER_BADGES.filter(b => !b.earnedAt);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate("/broker")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Wallet & Coins</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/20 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Current Balance</p>
              <p className="text-3xl font-bold">{broker.coins_balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-75">Lifetime Earned</p>
              <p className="font-semibold">{broker.lifetime_coins_earned.toLocaleString()}</p>
            </div>
            <div>
              <p className="opacity-75">Lifetime Spent</p>
              <p className="font-semibold">{broker.lifetime_coins_spent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl border shadow-sm flex p-1">
          <button
            onClick={() => setActiveSection("overview")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "overview"
                ? "bg-amber-500 text-white"
                : "text-muted-foreground"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveSection("shop")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeSection === "shop"
                ? "bg-amber-500 text-white"
                : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Shop
          </button>
          <button
            onClick={() => setActiveSection("badges")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              activeSection === "badges"
                ? "bg-amber-500 text-white"
                : "text-muted-foreground"
            }`}
          >
            <Award className="w-4 h-4" />
            Badges
          </button>
        </div>
      </div>

      {activeSection === "overview" && (
        <div className="px-4 mt-6">
          {/* Earning Tips */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              💰 Ways to Earn Coins
            </h3>
            <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
              {EARNING_OPPORTUNITIES.map((opp, idx) => (
                <p key={idx}>• {opp.action}: <span className="font-semibold">+{opp.coins}</span> coins</p>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <h3 className="font-semibold mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {WALLET_TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "earned" || tx.type === "bonus"
                        ? "bg-green-100 text-green-600"
                        : tx.type === "spent"
                        ? "bg-red-100 text-red-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {tx.type === "earned" || tx.type === "bonus" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.type === "earned" || tx.type === "bonus" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "earned" || tx.type === "bonus" ? "+" : "-"}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "shop" && (
        <div className="px-4 mt-6">
          <h3 className="font-semibold mb-4">💰 Coin Shop – Unlock Perks</h3>
          <div className="grid grid-cols-2 gap-3">
            {SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-xl p-4 flex flex-col"
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                {item.duration && (
                  <p className="text-xs text-amber-600 mb-3">{item.duration}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-auto"
                  disabled={broker.coins_balance < item.cost}
                >
                  <Coins className="w-3 h-3 mr-1" />
                  {item.cost}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "badges" && (
        <div className="px-4 mt-6">
          {/* Earned Badges */}
          <h3 className="font-semibold mb-3">🏆 Earned Badges ({earnedBadges.length})</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center"
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="text-xs font-medium mt-1">{badge.name}</p>
                <p className="text-xs text-green-600">+{badge.coinsReward}</p>
              </div>
            ))}
          </div>

          {/* In Progress Badges */}
          <h3 className="font-semibold mb-3">🎯 In Progress ({inProgressBadges.length})</h3>
          <div className="space-y-3">
            {inProgressBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-card border rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <span className="text-xs text-amber-600">+{badge.coinsReward}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{badge.progress} / {badge.target}</span>
                      </div>
                      <Progress value={(badge.progress / badge.target) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BrokerBottomNav activeTab="wallet" />
    </div>
  );
};

export default BrokerWallet;
