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
import { useBrokerWallet } from "@/hooks/useBrokerWallet";
import { useBrokerBadges } from "@/hooks/useBrokerBadges";
import { useToast } from "@/hooks/use-toast";
import {
  SHOP_ITEMS,
  EARNING_OPPORTUNITIES,
} from "@/data/brokerMockData";

const BrokerWallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { broker, isAuthenticated, isLoading, refreshBroker } = useBrokerAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "shop" | "badges">("overview");

  // Real-time hooks
  const { transactions, loading: txLoading, addTransaction } = useBrokerWallet(broker?.id);
  const { earnedBadges, inProgressBadges, loading: badgesLoading } = useBrokerBadges(broker?.id);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePurchaseItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (broker.coins_balance < item.cost) {
      toast({
        title: "Insufficient coins",
        description: `You need ${item.cost} coins but only have ${broker.coins_balance}`,
        variant: "destructive",
      });
      return;
    }

    const success = await addTransaction(
      "spent",
      item.cost,
      `${item.name} (${item.duration || "one-time"})`,
      "shop",
      item.id
    );

    if (success) {
      toast({
        title: "Purchase successful!",
        description: `You purchased ${item.name} for ${item.cost} coins`,
      });
      await refreshBroker();
    }
  };

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
          {txLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Start bidding to earn coins!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-card rounded-xl border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.transaction_type === "earned" || tx.transaction_type === "bonus"
                          ? "bg-green-100 text-green-600"
                          : tx.transaction_type === "spent"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {tx.transaction_type === "earned" || tx.transaction_type === "bonus" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.reason || tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.transaction_type === "earned" || tx.transaction_type === "bonus" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.transaction_type === "earned" || tx.transaction_type === "bonus" ? "+" : "-"}{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
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
                  onClick={() => handlePurchaseItem(item)}
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
          {badgesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Earned Badges */}
              <h3 className="font-semibold mb-3">🏆 Earned Badges ({earnedBadges.length})</h3>
              {earnedBadges.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground mb-6">
                  <p className="text-sm">No badges earned yet. Keep participating!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center"
                    >
                      <span className="text-3xl">{badge.badge_icon || "🏅"}</span>
                      <p className="text-xs font-medium mt-1">{badge.badge_name}</p>
                      <p className="text-xs text-green-600">+{badge.coins_reward || 0}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* In Progress Badges */}
              <h3 className="font-semibold mb-3">🎯 In Progress ({inProgressBadges.length})</h3>
              {inProgressBadges.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">All badges completed! New badges coming soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inProgressBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-card border rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{badge.badge_icon || "🎯"}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{badge.badge_name}</h4>
                            <span className="text-xs text-amber-600">+{badge.coins_reward || 0}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{badge.progress || 0} / {badge.target || 100}</span>
                            </div>
                            <Progress 
                              value={((badge.progress || 0) / (badge.target || 100)) * 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <BrokerBottomNav activeTab="wallet" />
    </div>
  );
};

export default BrokerWallet;
