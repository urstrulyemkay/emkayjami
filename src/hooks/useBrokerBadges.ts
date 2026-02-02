import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrokerBadge {
  id: string;
  broker_id: string;
  badge_name: string;
  badge_icon: string | null;
  description: string | null;
  progress: number | null;
  target: number | null;
  coins_reward: number | null;
  earned_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface UseBrokerBadgesReturn {
  earnedBadges: BrokerBadge[];
  inProgressBadges: BrokerBadge[];
  loading: boolean;
  refetch: () => Promise<void>;
  updateProgress: (badgeId: string, newProgress: number) => Promise<boolean>;
}

export const useBrokerBadges = (brokerId: string | undefined): UseBrokerBadgesReturn => {
  const [earnedBadges, setEarnedBadges] = useState<BrokerBadge[]>([]);
  const [inProgressBadges, setInProgressBadges] = useState<BrokerBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!brokerId) return;

    try {
      const { data, error } = await supabase
        .from("broker_badges")
        .select("*")
        .eq("broker_id", brokerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching broker badges:", error);
        return;
      }

      const badges = (data as BrokerBadge[]) || [];
      
      // Separate earned vs in-progress
      const earned = badges.filter(b => b.earned_at !== null);
      const inProgress = badges.filter(b => b.earned_at === null);

      setEarnedBadges(earned);
      setInProgressBadges(inProgress);
    } catch (err) {
      console.error("Error in fetchBadges:", err);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  const updateProgress = async (badgeId: string, newProgress: number): Promise<boolean> => {
    try {
      // Get badge target
      const badge = [...earnedBadges, ...inProgressBadges].find(b => b.id === badgeId);
      if (!badge) return false;

      const updateData: Record<string, unknown> = { progress: newProgress };
      
      // Check if badge is now complete
      if (badge.target && newProgress >= badge.target && !badge.earned_at) {
        updateData.earned_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("broker_badges")
        .update(updateData)
        .eq("id", badgeId);

      if (error) throw error;

      await fetchBadges();
      return true;
    } catch (err) {
      console.error("Error updating badge progress:", err);
      return false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!brokerId) return;

    fetchBadges();

    const channel = supabase
      .channel(`broker-badges-${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_badges",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => {
          fetchBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId, fetchBadges]);

  return {
    earnedBadges,
    inProgressBadges,
    loading,
    refetch: fetchBadges,
    updateProgress,
  };
};
