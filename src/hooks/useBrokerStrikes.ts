import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrokerStrike {
  id: string;
  broker_id: string;
  severity: string;
  reason: string;
  penalty_coins: number | null;
  penalty_trust_score: number | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
  expires_at: string;
  appeal_status: string | null;
}

interface UseBrokerStrikesReturn {
  activeStrikes: BrokerStrike[];
  expiredStrikes: BrokerStrike[];
  loading: boolean;
  strikesCount: number;
  refetch: () => Promise<void>;
}

export const useBrokerStrikes = (brokerId: string | undefined): UseBrokerStrikesReturn => {
  const [activeStrikes, setActiveStrikes] = useState<BrokerStrike[]>([]);
  const [expiredStrikes, setExpiredStrikes] = useState<BrokerStrike[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStrikes = useCallback(async () => {
    if (!brokerId) return;

    try {
      const { data, error } = await supabase
        .from("broker_strikes")
        .select("*")
        .eq("broker_id", brokerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching broker strikes:", error);
        return;
      }

      const strikes = (data as BrokerStrike[]) || [];
      const now = new Date();

      // Separate active vs expired strikes
      const active = strikes.filter(s => new Date(s.expires_at) > now);
      const expired = strikes.filter(s => new Date(s.expires_at) <= now);

      setActiveStrikes(active);
      setExpiredStrikes(expired);
    } catch (err) {
      console.error("Error in fetchStrikes:", err);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!brokerId) return;

    fetchStrikes();

    const channel = supabase
      .channel(`broker-strikes-${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_strikes",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => {
          fetchStrikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId, fetchStrikes]);

  return {
    activeStrikes,
    expiredStrikes,
    loading,
    strikesCount: activeStrikes.length,
    refetch: fetchStrikes,
  };
};
