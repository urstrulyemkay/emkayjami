import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PickupSchedule {
  id?: string;
  pickupDate: Date;
  pickupTime: string;
  notes?: string;
}

interface AuctionDocument {
  id: string;
  name: string;
  uri: string;
  type: string;
  size?: number;
  preview?: string;
}

interface UseAuctionActionsReturn {
  // State
  pickupSchedule: PickupSchedule | null;
  documents: AuctionDocument[];
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  savePickupSchedule: (date: Date, time: string, notes?: string) => Promise<boolean>;
  uploadDocument: (file: File) => Promise<AuctionDocument | null>;
  removeDocument: (docId: string) => Promise<boolean>;
  loadExistingData: () => Promise<void>;
}

export const useAuctionActions = (inspectionId: string | null): UseAuctionActionsReturn => {
  const { toast } = useToast();
  const [pickupSchedule, setPickupSchedule] = useState<PickupSchedule | null>(null);
  const [documents, setDocuments] = useState<AuctionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Load existing data when inspectionId is available
  const loadExistingData = useCallback(async () => {
    if (!inspectionId) return;
    
    setIsLoading(true);
    try {
      // Load pickup schedule
      const { data: pickupData, error: pickupError } = await supabase
        .from("auction_pickups")
        .select("*")
        .eq("inspection_id", inspectionId)
        .maybeSingle();

      if (pickupError) {
        console.error("Error loading pickup:", pickupError);
      } else if (pickupData) {
        setPickupSchedule({
          id: pickupData.id,
          pickupDate: new Date(pickupData.pickup_date),
          pickupTime: pickupData.pickup_time,
          notes: pickupData.notes || undefined,
        });
      }

      // Load documents
      const { data: docsData, error: docsError } = await supabase
        .from("auction_documents")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("created_at", { ascending: false });

      if (docsError) {
        console.error("Error loading documents:", docsError);
      } else if (docsData) {
        // Generate signed URLs for documents
        const docsWithUrls = await Promise.all(
          docsData.map(async (doc) => {
            const { data: signedData } = await supabase.storage
              .from("auction-documents")
              .createSignedUrl(doc.file_uri, 3600);

            return {
              id: doc.id,
              name: doc.file_name,
              uri: doc.file_uri,
              type: doc.file_type || "file",
              size: doc.file_size || undefined,
              preview: doc.file_type?.startsWith("image/") ? signedData?.signedUrl : undefined,
            };
          })
        );
        setDocuments(docsWithUrls);
      }
    } catch (error) {
      console.error("Error loading auction actions data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId) {
      loadExistingData();
    }
  }, [inspectionId, loadExistingData]);

  const savePickupSchedule = async (date: Date, time: string, notes?: string): Promise<boolean> => {
    if (!inspectionId) {
      toast({
        title: "Error",
        description: "No inspection ID available",
        variant: "destructive",
      });
      return false;
    }

    setIsSaving(true);
    try {
      const pickupData = {
        inspection_id: inspectionId,
        pickup_date: date.toISOString().split("T")[0],
        pickup_time: time,
        notes: notes || null,
      };

      if (pickupSchedule?.id) {
        // Update existing
        const { error } = await supabase
          .from("auction_pickups")
          .update(pickupData)
          .eq("id", pickupSchedule.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("auction_pickups")
          .insert(pickupData)
          .select()
          .single();

        if (error) throw error;
        
        setPickupSchedule({
          id: data.id,
          pickupDate: date,
          pickupTime: time,
          notes,
        });
      }

      setPickupSchedule({ ...pickupSchedule, pickupDate: date, pickupTime: time, notes });
      return true;
    } catch (error) {
      console.error("Error saving pickup schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save pickup schedule",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadDocument = async (file: File): Promise<AuctionDocument | null> => {
    if (!inspectionId || !userId) {
      toast({
        title: "Error",
        description: "Unable to upload document",
        variant: "destructive",
      });
      return null;
    }

    setIsSaving(true);
    try {
      // Upload file to storage
      const timestamp = Date.now();
      const filePath = `${userId}/${inspectionId}/${timestamp}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("auction-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record to database
      const { data, error: insertError } = await supabase
        .from("auction_documents")
        .insert({
          inspection_id: inspectionId,
          file_name: file.name,
          file_uri: filePath,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get signed URL for preview
      const { data: signedData } = await supabase.storage
        .from("auction-documents")
        .createSignedUrl(filePath, 3600);

      const newDoc: AuctionDocument = {
        id: data.id,
        name: file.name,
        uri: filePath,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith("image/") ? signedData?.signedUrl : undefined,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const removeDocument = async (docId: string): Promise<boolean> => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return false;

    setIsSaving(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("auction-documents")
        .remove([doc.uri]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("auction_documents")
        .delete()
        .eq("id", docId);

      if (dbError) throw dbError;

      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      return true;
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    pickupSchedule,
    documents,
    isLoading,
    isSaving,
    savePickupSchedule,
    uploadDocument,
    removeDocument,
    loadExistingData,
  };
};
