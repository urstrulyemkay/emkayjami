import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/inspection";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data enrichment for development
const getMockUserData = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
  role: "executive",
  email: supabaseUser.email,
  phone: supabaseUser.phone || "+91 98765 43210",
  trustScore: 847,
  trustLevel: "Gold",
  coins: 2450,
  streak: 15,
});

// Fallback mock users for role-based login
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
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          setUser(getMockUserData(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        setUser(getMockUserData(session.user));
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock login for role-based testing (fallback)
  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user || !!session,
        isLoading,
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
