import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { OpsRole } from "@/data/opsNavigation";

interface OpsUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  roles: OpsRole[];
  status: string;
  city_filter: string | null;
}

interface OpsAuthContextType {
  opsUser: OpsUser | null;
  isOpsAuthenticated: boolean;
  isOpsLoading: boolean;
  hasRole: (role: OpsRole) => boolean;
  hasAnyRole: (roles: OpsRole[]) => boolean;
  isSuperAdmin: boolean;
}

const OpsAuthContext = createContext<OpsAuthContextType | undefined>(undefined);

// For development: mock ops user when no DB record exists
const MOCK_OPS_USER: OpsUser = {
  id: "ops-mock-001",
  user_id: "mock-user",
  email: "admin@drivex.com",
  full_name: "DriveX Admin",
  phone: "+91 98765 00000",
  roles: ["super_admin"],
  status: "active",
  city_filter: null,
};

export function OpsAuthProvider({ children }: { children: ReactNode }) {
  const { session, isAuthenticated } = useAuth();
  const [opsUser, setOpsUser] = useState<OpsUser | null>(null);
  const [isOpsLoading, setIsOpsLoading] = useState(true);

  useEffect(() => {
    const fetchOpsUser = async () => {
      if (!session?.user?.id) {
        // For dev: allow mock access
        setOpsUser(MOCK_OPS_USER);
        setIsOpsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ops_users")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error || !data) {
          // Fallback to mock for development
          setOpsUser(MOCK_OPS_USER);
        } else {
          setOpsUser({
            id: data.id,
            user_id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            roles: (data.roles as OpsRole[]) || [],
            status: data.status,
            city_filter: data.city_filter,
          });
        }
      } catch {
        setOpsUser(MOCK_OPS_USER);
      }
      setIsOpsLoading(false);
    };

    fetchOpsUser();
  }, [session?.user?.id]);

  const hasRole = (role: OpsRole) => {
    if (!opsUser) return false;
    return opsUser.roles.includes("super_admin") || opsUser.roles.includes(role);
  };

  const hasAnyRole = (roles: OpsRole[]) => {
    if (!opsUser) return false;
    if (opsUser.roles.includes("super_admin")) return true;
    return roles.some((r) => opsUser.roles.includes(r));
  };

  const isSuperAdmin = opsUser?.roles.includes("super_admin") ?? false;

  return (
    <OpsAuthContext.Provider
      value={{
        opsUser,
        isOpsAuthenticated: !!opsUser,
        isOpsLoading,
        hasRole,
        hasAnyRole,
        isSuperAdmin,
      }}
    >
      {children}
    </OpsAuthContext.Provider>
  );
}

export function useOpsAuth() {
  const context = useContext(OpsAuthContext);
  if (!context) {
    throw new Error("useOpsAuth must be used within OpsAuthProvider");
  }
  return context;
}
