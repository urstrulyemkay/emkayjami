import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WonVehicle } from "./useBrokerWonVehicles";

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
}

export function useServiceTracking(wonVehicleId: string | undefined): UseServiceTrackingReturn {
  const [vehicle, setVehicle] = useState<WonVehicle | null>(null);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!wonVehicleId) {
      setLoading(false);
      return;
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
    } catch (err) {
      console.error("Error fetching service tracking data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
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
        return docData;
      } catch (err) {
        console.error("Error uploading proof:", err);
        setError(err instanceof Error ? err.message : "Failed to upload proof");
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
  };
}
