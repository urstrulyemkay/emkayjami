import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types/inspection";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const mockUsers: Record<UserRole, User> = {
  executive: {
    id: "exec-001",
    name: "Rajesh Kumar",
    role: "executive",
    phone: "+91 98765 43210",
    trustScore: 847,
    trustLevel: "Gold",
    coins: 2450,
    streak: 15,
  },
  customer: {
    id: "cust-001",
    name: "Priya Sharma",
    role: "customer",
    phone: "+91 87654 32109",
    trustScore: 720,
    trustLevel: "Silver",
    coins: 500,
    streak: 3,
  },
  admin: {
    id: "admin-001",
    name: "Admin User",
    role: "admin",
    email: "admin@drivex.com",
    trustScore: 1000,
    trustLevel: "Platinum",
    coins: 10000,
    streak: 100,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
