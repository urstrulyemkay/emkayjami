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

// Mock transaction data
const MOCK_TRANSACTIONS = [
  { id: 1, type: "earned", amount: 100, reason: "Deal completed (TVS Apache)", date: "Feb 5, 2026" },
  { id: 2, type: "earned", amount: 200, reason: "RC transferred on-time (Bajaj Pulsar)", date: "Feb 3, 2026" },
  { id: 3, type: "spent", amount: 250, reason: "Priority Support (7 days)", date: "Feb 1, 2026" },
  { id: 4, type: "earned", amount: 300, reason: "Zero disputes streak (10 deals)", date: "Jan 30, 2026" },
  { id: 5, type: "earned", amount: 500, reason: "KYC completion bonus", date: "Jan 15, 2026" },
];

// Mock shop items
const SHOP_ITEMS = [
  { id: 1, name: "Priority Support", description: "7 days faster support", cost: 100, icon: "⚡" },
  { id: 2, name: "Boosted Visibility", description: "Stand out to OEMs", cost: 150, icon: "🔥" },
  { id: 3, name: "Premium Insights", description: "Market analytics", cost: 250, icon: "📊" },
  { id: 4, name: "Early Access", description: "Rare vehicles first", cost: 750, icon: "🌟" },
];

const BrokerWallet = () => {
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading } = useBrokerAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "shop">("overview");

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
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeSection === "overview"
                ? "bg-amber-500 text-white"
                : "text-muted-foreground"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveSection("shop")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeSection === "shop"
                ? "bg-amber-500 text-white"
                : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Coin Shop
          </button>
        </div>
      </div>

      {activeSection === "overview" ? (
        <div className="px-4 mt-6">
          {/* Earning Tips */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              💰 Ways to Earn Coins
            </h3>
            <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <p>• Complete deals: +100 coins each</p>
              <p>• RC transfer on-time: +200 coins</p>
              <p>• Zero disputes streak: +300-500 coins</p>
              <p>• 7-day login streak: +100 coins</p>
            </div>
          </div>

          {/* Transaction History */}
          <h3 className="font-semibold mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-card rounded-xl border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "earned"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tx.type === "earned" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.reason}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <p
                  className={`font-semibold ${
                    tx.type === "earned" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "earned" ? "+" : "-"}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
                <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
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

      <BrokerBottomNav activeTab="wallet" />
    </div>
  );
};

export default BrokerWallet;
