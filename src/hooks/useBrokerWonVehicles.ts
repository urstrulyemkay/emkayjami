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

// Mock won vehicles data for demo
const MOCK_WON_VEHICLES: WonVehicle[] = [
  {
    id: "mock-wv-1", broker_id: "mock-broker", auction_id: "mock-auction-won-1", bid_id: "mock-won-1",
    won_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: "completed", payment_completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pickup_status: "completed", pickup_scheduled_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), pickup_completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: "pending", delivered_at: null,
    rc_transfer_status: "pending", rc_transfer_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], rc_transfer_proof_uri: null, rc_transferred_at: null,
    name_transfer_status: "pending", name_transferred_at: null,
    insurance_status: "pending", notes: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    auction: { id: "mock-auction-won-1", status: "ended", current_highest_bid: 45000, inspections: { vehicle_make: "Bajaj", vehicle_model: "Pulsar NS200", vehicle_year: 2023, vehicle_registration: "KA-01-MN-5678", vehicle_color: "Red", odometer_reading: 8500 } },
    bid: { bid_amount: 45000, commission_amount: 1800 }
  },
  {
    id: "mock-wv-2", broker_id: "mock-broker", auction_id: "mock-auction-won-2", bid_id: "mock-won-2",
    won_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: "completed", payment_completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    pickup_status: "completed", pickup_scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), pickup_completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: "completed", delivered_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    rc_transfer_status: "pending", rc_transfer_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], rc_transfer_proof_uri: null, rc_transferred_at: null,
    name_transfer_status: "pending", name_transferred_at: null,
    insurance_status: "completed", notes: "Customer very happy",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    auction: { id: "mock-auction-won-2", status: "ended", current_highest_bid: 38000, inspections: { vehicle_make: "Yamaha", vehicle_model: "FZ-S V3", vehicle_year: 2022, vehicle_registration: "KA-03-XY-9012", vehicle_color: "Blue", odometer_reading: 15800 } },
    bid: { bid_amount: 38000, commission_amount: 1500 }
  },
  {
    id: "mock-wv-3", broker_id: "mock-broker", auction_id: "mock-auction-won-3", bid_id: "mock-won-3",
    won_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: "completed", payment_completed_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    pickup_status: "completed", pickup_scheduled_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), pickup_completed_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: "completed", delivered_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    rc_transfer_status: "completed", rc_transfer_deadline: new Date(Date.now() + 166 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], rc_transfer_proof_uri: "https://example.com/rc.jpg", rc_transferred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    name_transfer_status: "completed", name_transferred_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    insurance_status: "completed", notes: "Completed all formalities",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    auction: { id: "mock-auction-won-3", status: "ended", current_highest_bid: 28000, inspections: { vehicle_make: "Hero", vehicle_model: "Splendor Plus", vehicle_year: 2021, vehicle_registration: "MH-12-AB-3456", vehicle_color: "Black", odometer_reading: 32000 } },
    bid: { bid_amount: 28000, commission_amount: 1200 }
  },
  {
    id: "mock-wv-4", broker_id: "mock-broker", auction_id: "mock-auction-won-4", bid_id: "mock-won-4",
    won_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: "completed", payment_completed_at: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    pickup_status: "completed", pickup_scheduled_at: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(), pickup_completed_at: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: "completed", delivered_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    rc_transfer_status: "completed", rc_transfer_deadline: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], rc_transfer_proof_uri: "https://example.com/rc2.jpg", rc_transferred_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    name_transfer_status: "completed", name_transferred_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    insurance_status: "completed", notes: "Smooth transaction",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    auction: { id: "mock-auction-won-4", status: "ended", current_highest_bid: 42000, inspections: { vehicle_make: "Suzuki", vehicle_model: "Access 125", vehicle_year: 2023, vehicle_registration: "DL-05-CD-7890", vehicle_color: "Pearl White", odometer_reading: 5200 } },
    bid: { bid_amount: 42000, commission_amount: 2000 }
  },
];

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
      // No broker ID - use mock data for demo
      setWonVehicles(MOCK_WON_VEHICLES);
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
        console.error("Error fetching won vehicles:", fetchError);
        // On error, use mock data
        setWonVehicles(MOCK_WON_VEHICLES);
        setLoading(false);
        return;
      }

      // Transform data to flatten nested arrays
      const transformedData = (data || []).map((item) => ({
        ...item,
        auction: item.auction,
        bid: Array.isArray(item.bid) ? item.bid[0] : item.bid,
      }));

      // Use mock data if database is empty
      if (transformedData.length === 0) {
        setWonVehicles(MOCK_WON_VEHICLES);
      } else {
        setWonVehicles(transformedData);
      }
    } catch (err) {
      console.error("Error fetching won vehicles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch won vehicles");
      // On error, use mock data
      setWonVehicles(MOCK_WON_VEHICLES);
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
