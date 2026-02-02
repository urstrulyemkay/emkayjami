import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WonVehicle } from "./useBrokerWonVehicles";
import { playSoundIfEnabled } from "@/hooks/useSoundNotifications";

export interface ServiceDocument {
  id: string;
  won_vehicle_id: string;
  service_type: string;
  file_name: string;
  file_uri: string;
  file_type: string | null;
  uploaded_at: string;
  verified_at: string | null;
  verification_status: string;
  rejection_reason: string | null;
}

type ServiceType = "payment" | "pickup" | "delivery" | "rc_transfer" | "name_transfer" | "insurance";

// Mock data for demo when database is empty
const MOCK_VEHICLES: Record<string, WonVehicle> = {
  "mock-wv-1": {
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
  "mock-wv-2": {
    id: "mock-wv-2", broker_id: "mock-broker", auction_id: "mock-auction-won-2", bid_id: "mock-won-2",
    won_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: "completed", payment_completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    pickup_status: "completed", pickup_scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), pickup_completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    delivery_status: "completed", delivered_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    rc_transfer_status: "in_progress", rc_transfer_deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], rc_transfer_proof_uri: null, rc_transferred_at: null,
    name_transfer_status: "pending", name_transferred_at: null,
    insurance_status: "completed", notes: "Customer very happy",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(),
    auction: { id: "mock-auction-won-2", status: "ended", current_highest_bid: 38000, inspections: { vehicle_make: "Yamaha", vehicle_model: "FZ-S V3", vehicle_year: 2022, vehicle_registration: "KA-03-XY-9012", vehicle_color: "Blue", odometer_reading: 15800 } },
    bid: { bid_amount: 38000, commission_amount: 1500 }
  },
  "mock-wv-3": {
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
  "mock-wv-4": {
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
};

const MOCK_DOCUMENTS: Record<string, ServiceDocument[]> = {
  "mock-wv-2": [
    { id: "doc-1", won_vehicle_id: "mock-wv-2", service_type: "insurance", file_name: "insurance_policy.pdf", file_uri: "/mock/insurance.pdf", file_type: "application/pdf", uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), verified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), verification_status: "verified", rejection_reason: null },
    { id: "doc-2", won_vehicle_id: "mock-wv-2", service_type: "rc_transfer", file_name: "rc_application.jpg", file_uri: "/mock/rc.jpg", file_type: "image/jpeg", uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), verified_at: null, verification_status: "pending", rejection_reason: null },
  ],
  "mock-wv-3": [
    { id: "doc-3", won_vehicle_id: "mock-wv-3", service_type: "rc_transfer", file_name: "rc_transfer_complete.pdf", file_uri: "/mock/rc3.pdf", file_type: "application/pdf", uploaded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), verified_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), verification_status: "verified", rejection_reason: null },
    { id: "doc-4", won_vehicle_id: "mock-wv-3", service_type: "name_transfer", file_name: "name_transfer_proof.jpg", file_uri: "/mock/name3.jpg", file_type: "image/jpeg", uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), verified_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), verification_status: "verified", rejection_reason: null },
    { id: "doc-5", won_vehicle_id: "mock-wv-3", service_type: "insurance", file_name: "new_insurance.pdf", file_uri: "/mock/ins3.pdf", file_type: "application/pdf", uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), verified_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), verification_status: "verified", rejection_reason: null },
  ],
};

interface UseServiceTrackingReturn {
  vehicle: WonVehicle | null;
  documents: ServiceDocument[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateServiceStatus: (
    serviceType: ServiceType,
    status: string,
    additionalData?: Record<string, unknown>
  ) => Promise<boolean>;
  uploadProof: (
    serviceType: ServiceType,
    file: File
  ) => Promise<ServiceDocument | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  getRemainingDays: () => number;
  refetch: () => Promise<void>;
  isMockData: boolean;
}

export function useServiceTracking(wonVehicleId: string | undefined): UseServiceTrackingReturn {
  const [vehicle, setVehicle] = useState<WonVehicle | null>(null);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!wonVehicleId) {
      setLoading(false);
      return;
    }

    // Check if this is a mock ID
    if (wonVehicleId.startsWith("mock-")) {
      const mockVehicle = MOCK_VEHICLES[wonVehicleId];
      const mockDocs = MOCK_DOCUMENTS[wonVehicleId] || [];
      
      if (mockVehicle) {
        setVehicle(mockVehicle);
        setDocuments(mockDocs);
        setIsMockData(true);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch vehicle and documents in parallel
      const [vehicleResult, docsResult] = await Promise.all([
        supabase
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
          .eq("id", wonVehicleId)
          .single(),
        supabase
          .from("service_documents")
          .select("*")
          .eq("won_vehicle_id", wonVehicleId)
          .order("uploaded_at", { ascending: false }),
      ]);

      if (vehicleResult.error) throw vehicleResult.error;
      if (docsResult.error) throw docsResult.error;

      const transformedVehicle = {
        ...vehicleResult.data,
        bid: Array.isArray(vehicleResult.data.bid)
          ? vehicleResult.data.bid[0]
          : vehicleResult.data.bid,
      };

      setVehicle(transformedVehicle);
      setDocuments(docsResult.data || []);
      setIsMockData(false);
    } catch (err) {
      console.error("Error fetching service tracking data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      
      // Fallback to first mock vehicle if database fetch fails
      const firstMockKey = Object.keys(MOCK_VEHICLES)[0];
      const mockVehicle = MOCK_VEHICLES[firstMockKey];
      if (mockVehicle) {
        setVehicle({ ...mockVehicle, id: wonVehicleId });
        setDocuments([]);
        setIsMockData(true);
      }
    } finally {
      setLoading(false);
    }
  }, [wonVehicleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateServiceStatus = useCallback(
    async (
      serviceType: ServiceType,
      status: string,
      additionalData?: Record<string, unknown>
    ): Promise<boolean> => {
      if (!wonVehicleId) return false;

      try {
        setSaving(true);
        setError(null);

        const updateData: Record<string, unknown> = {
          [`${serviceType}_status`]: status,
          ...additionalData,
        };

        // Add completion timestamp if status is completed
        if (status === "completed") {
          const timestampField = serviceType === "rc_transfer"
            ? "rc_transferred_at"
            : serviceType === "name_transfer"
            ? "name_transferred_at"
            : serviceType === "delivery"
            ? "delivered_at"
            : serviceType === "payment"
            ? "payment_completed_at"
            : serviceType === "pickup"
            ? "pickup_completed_at"
            : null;

          if (timestampField) {
            updateData[timestampField] = new Date().toISOString();
          }
        }

        const { error: updateError } = await supabase
          .from("broker_won_vehicles")
          .update(updateData)
          .eq("id", wonVehicleId);

        if (updateError) throw updateError;

        await fetchData();
        
        // Play success sound for status updates
        if (status === "completed") {
          playSoundIfEnabled('success');
        } else {
          playSoundIfEnabled('tick');
        }
        
        return true;
      } catch (err) {
        console.error("Error updating service status:", err);
        setError(err instanceof Error ? err.message : "Failed to update status");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [wonVehicleId, fetchData]
  );

  const uploadProof = useCallback(
    async (serviceType: ServiceType, file: File): Promise<ServiceDocument | null> => {
      if (!wonVehicleId) return null;

      try {
        setSaving(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Upload file to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${wonVehicleId}/${serviceType}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("service-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from("service_documents")
          .insert({
            won_vehicle_id: wonVehicleId,
            service_type: serviceType,
            file_name: file.name,
            file_uri: filePath,
            file_type: file.type,
          })
          .select()
          .single();

        if (docError) throw docError;

        // Update the vehicle's proof URI if it's RC transfer
        if (serviceType === "rc_transfer") {
          await supabase
            .from("broker_won_vehicles")
            .update({
              rc_transfer_proof_uri: filePath,
              rc_transfer_status: "in_progress",
            })
            .eq("id", wonVehicleId);
        }

        await fetchData();
        
        // Play tick sound for successful upload
        playSoundIfEnabled('tick');
        
        return docData;
      } catch (err) {
        console.error("Error uploading proof:", err);
        setError(err instanceof Error ? err.message : "Failed to upload proof");
        playSoundIfEnabled('error');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [wonVehicleId, fetchData]
  );

  const deleteDocument = useCallback(
    async (documentId: string): Promise<boolean> => {
      try {
        setSaving(true);
        setError(null);

        // Find the document to get the file path
        const doc = documents.find((d) => d.id === documentId);
        if (!doc) throw new Error("Document not found");

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("service-documents")
          .remove([doc.file_uri]);

        if (storageError) {
          console.warn("Error deleting from storage:", storageError);
        }

        // Delete document record
        const { error: deleteError } = await supabase
          .from("service_documents")
          .delete()
          .eq("id", documentId);

        if (deleteError) throw deleteError;

        await fetchData();
        return true;
      } catch (err) {
        console.error("Error deleting document:", err);
        setError(err instanceof Error ? err.message : "Failed to delete document");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [documents, fetchData]
  );

  const getRemainingDays = useCallback((): number => {
    if (!vehicle?.rc_transfer_deadline) return 180;
    
    const deadline = new Date(vehicle.rc_transfer_deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [vehicle?.rc_transfer_deadline]);

  return {
    vehicle,
    documents,
    loading,
    saving,
    error,
    updateServiceStatus,
    uploadProof,
    deleteDocument,
    getRemainingDays,
    refetch: fetchData,
    isMockData,
  };
}
