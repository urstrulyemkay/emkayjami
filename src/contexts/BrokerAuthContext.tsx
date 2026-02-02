import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface BrokerProfile {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string;
  mobile: string;
  email?: string;
  city: string;
  operating_radius: number;
  business_type: string;
  account_status: string;
  kyc_status: string;
  trust_score: number;
  level: number;
  coins_balance: number;
  lifetime_coins_earned: number;
  lifetime_coins_spent: number;
  strikes_count: number;
  preferred_makes: string[];
  preferred_categories: string[];
  price_band_min: number;
  price_band_max: number;
}

interface BrokerAuthContextType {
  user: User | null;
  session: Session | null;
  broker: BrokerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (data: BrokerSignupData) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshBroker: () => Promise<void>;
}

export interface BrokerSignupData {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  city: string;
}

const BrokerAuthContext = createContext<BrokerAuthContextType | undefined>(undefined);

export function BrokerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [broker, setBroker] = useState<BrokerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBrokerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("brokers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.log("No broker profile found:", error.message);
        return null;
      }
      return data as BrokerProfile;
    } catch (err) {
      console.error("Error fetching broker profile:", err);
      return null;
    }
  };

  const refreshBroker = async () => {
    if (user) {
      const profile = await fetchBrokerProfile(user.id);
      setBroker(profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchBrokerProfile(session.user.id).then(setBroker);
          }, 0);
        } else {
          setBroker(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchBrokerProfile(session.user.id).then((profile) => {
          setBroker(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signup = async (data: BrokerSignupData) => {
    try {
      const redirectUrl = `${window.location.origin}/broker`;
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create broker role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "broker",
        });

      if (roleError) console.error("Role creation error:", roleError);

      // Create broker profile with auto-approve KYC
      const { error: brokerError } = await supabase
        .from("brokers")
        .insert({
          user_id: authData.user.id,
          business_name: data.businessName,
          owner_name: data.ownerName,
          mobile: data.mobile,
          email: data.email,
          city: data.city,
          account_status: "active", // Auto-approve for MVP
          kyc_status: "approved",
          kyc_verified_at: new Date().toISOString(),
          coins_balance: 500, // Welcome bonus
          lifetime_coins_earned: 500,
        });

      if (brokerError) throw brokerError;

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setBroker(null);
  };

  return (
    <BrokerAuthContext.Provider
      value={{
        user,
        session,
        broker,
        isAuthenticated: !!user && !!broker,
        isLoading,
        login,
        signup,
        logout,
        refreshBroker,
      }}
    >
      {children}
    </BrokerAuthContext.Provider>
  );
}

export function useBrokerAuth() {
  const context = useContext(BrokerAuthContext);
  if (context === undefined) {
    throw new Error("useBrokerAuth must be used within a BrokerAuthProvider");
  }
  return context;
}
