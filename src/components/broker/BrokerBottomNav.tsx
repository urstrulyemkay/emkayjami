import { useNavigate } from "react-router-dom";
import { Home, Gavel, Wallet, User, HelpCircle } from "lucide-react";

interface BrokerBottomNavProps {
  activeTab: "home" | "bids" | "wallet" | "profile" | "help";
}

const BrokerBottomNav = ({ activeTab }: BrokerBottomNavProps) => {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/broker" },
    { id: "bids", icon: Gavel, label: "Bids", path: "/broker/bids" },
    { id: "wallet", icon: Wallet, label: "Wallet", path: "/broker/wallet" },
    { id: "profile", icon: User, label: "Profile", path: "/broker/profile" },
    { id: "help", icon: HelpCircle, label: "Help", path: "/broker/help" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-1 px-2 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${
              activeTab === id ? "bg-primary text-primary-foreground" : ""
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === id ? "text-foreground" : ""}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrokerBottomNav;
