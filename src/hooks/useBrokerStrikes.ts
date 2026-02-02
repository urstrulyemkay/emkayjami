import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playSoundIfEnabled } from "@/hooks/useSoundNotifications";
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
  const prevStrikesCountRef = useRef<number>(0);

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

      // Play error sound if new strike received
      if (active.length > prevStrikesCountRef.current && prevStrikesCountRef.current > 0) {
        playSoundIfEnabled('error');
      }
      prevStrikesCountRef.current = active.length;

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
