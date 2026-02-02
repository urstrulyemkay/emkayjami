import { useNavigate } from "react-router-dom";
import { Home, Gavel, Wallet, User, HelpCircle } from "lucide-react";

interface BrokerBottomNavProps {
  activeTab: "home" | "bids" | "wallet" | "profile" | "help";
}

const BrokerBottomNav = ({ activeTab }: BrokerBottomNavProps) => {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/broker" },
    { id: "bids", icon: Gavel, label: "My Bids", path: "/broker/bids" },
    { id: "wallet", icon: Wallet, label: "Wallet", path: "/broker/wallet" },
    { id: "profile", icon: User, label: "Profile", path: "/broker/profile" },
    { id: "help", icon: HelpCircle, label: "Help", path: "/broker/help" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              activeTab === id
                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrokerBottomNav;
