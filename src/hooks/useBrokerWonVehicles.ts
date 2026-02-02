import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WonVehicle {
  id: string;
  broker_id: string;
  auction_id: string;
  bid_id: string;
  won_at: string;
  payment_status: string;
  payment_completed_at: string | null;
  pickup_status: string;
  pickup_scheduled_at: string | null;
  pickup_completed_at: string | null;
  delivery_status: string;
  delivered_at: string | null;
  rc_transfer_status: string;
  rc_transfer_deadline: string;
  rc_transfer_proof_uri: string | null;
  rc_transferred_at: string | null;
  name_transfer_status: string;
  name_transferred_at: string | null;
  insurance_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  auction?: {
    id: string;
    status: string;
    current_highest_bid: number | null;
    inspections?: {
      vehicle_make: string;
      vehicle_model: string;
      vehicle_year: number | null;
      vehicle_registration: string;
      vehicle_color: string | null;
      odometer_reading: number | null;
    };
  };
  bid?: {
    bid_amount: number;
    commission_amount: number;
  };
}

interface UseBrokerWonVehiclesReturn {
  wonVehicles: WonVehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  activeCount: number;
  completedCount: number;
  urgentCount: number;
}

export function useBrokerWonVehicles(brokerId: string | undefined): UseBrokerWonVehiclesReturn {
  const [wonVehicles, setWonVehicles] = useState<WonVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWonVehicles = useCallback(async () => {
    if (!brokerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("broker_won_vehicles")
        .select(`
          *,
          auction:auctions(
            id,
            status,
            current_highest_bid,
            inspections(
              vehicle_make,
              vehicle_model,
              vehicle_year,
              vehicle_registration,
              vehicle_color,
              odometer_reading
            )
          ),
          bid:broker_bids(
            bid_amount,
            commission_amount
          )
        `)
        .eq("broker_id", brokerId)
        .order("rc_transfer_deadline", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to flatten nested arrays
      const transformedData = (data || []).map((item) => ({
        ...item,
        auction: item.auction,
        bid: Array.isArray(item.bid) ? item.bid[0] : item.bid,
      }));

      setWonVehicles(transformedData);
    } catch (err) {
      console.error("Error fetching won vehicles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch won vehicles");
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  useEffect(() => {
    fetchWonVehicles();
  }, [fetchWonVehicles]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!brokerId) return;

    const channel = supabase
      .channel("won-vehicles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_won_vehicles",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => {
          fetchWonVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId, fetchWonVehicles]);

  // Calculate counts
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const activeCount = wonVehicles.filter(
    (v) => v.rc_transfer_status !== "completed" || v.name_transfer_status !== "completed"
  ).length;

  const completedCount = wonVehicles.filter(
    (v) => v.rc_transfer_status === "completed" && v.name_transfer_status === "completed"
  ).length;

  const urgentCount = wonVehicles.filter((v) => {
    const deadline = new Date(v.rc_transfer_deadline);
    return deadline <= thirtyDaysFromNow && v.rc_transfer_status !== "completed";
  }).length;

  return {
    wonVehicles,
    loading,
    error,
    refetch: fetchWonVehicles,
    activeCount,
    completedCount,
    urgentCount,
  };
}
