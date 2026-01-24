import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStorageUpload } from "./useStorageUpload";
import { ImageAngle, CapturedImage } from "@/types/inspection";
import { useToast } from "./use-toast";

interface InspectionData {
  registration: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineCC?: number;
  odometerReading?: number;
  customerName?: string;
  customerPhone?: string;
}

interface UseInspectionPersistenceReturn {
  inspectionId: string | null;
  userId: string | null;
  isLoading: boolean;
  capturedImages: CapturedImage[];
  createInspection: (data: InspectionData) => Promise<string | null>;
  saveImage: (angle: ImageAngle, blob: Blob) => Promise<CapturedImage | null>;
  loadExistingImages: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useInspectionPersistence(
  initialInspectionId?: string
): UseInspectionPersistenceReturn {
  const { toast } = useToast();
  const { uploadFile, isUploading } = useStorageUpload();
  
  const [inspectionId, setInspectionId] = useState<string | null>(initialInspectionId || null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get current user on mount - require authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setIsAuthenticated(true);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    getUser();
  }, []);

  // Create a new inspection record - requires authentication
  const createInspection = useCallback(async (data: InspectionData): Promise<string | null> => {
    if (!userId || !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an inspection",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data: inspection, error } = await supabase
        .from("inspections")
        .insert({
          executive_id: userId,
          vehicle_registration: data.registration,
          vehicle_make: data.make,
          vehicle_model: data.model,
          vehicle_year: data.year,
          vehicle_color: data.color,
          engine_cc: data.engineCC || null,
          odometer_reading: data.odometerReading || null,
          status: "in_progress",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating inspection:", error);
        toast({
          title: "Failed to create inspection",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      setInspectionId(inspection.id);
      return inspection.id;
    } catch (err) {
      console.error("Error creating inspection:", err);
      return null;
    }
  }, [userId, isAuthenticated, toast]);

  // Save a captured image to storage and database - requires authentication
  const saveImage = useCallback(async (
    angle: ImageAngle,
    blob: Blob
  ): Promise<CapturedImage | null> => {
    if (!inspectionId) {
      console.error("No inspection ID available");
      return null;
    }

    if (!userId || !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save images",
        variant: "destructive",
      });
      return null;
    }

    const timestamp = Date.now();
    const fileName = `${inspectionId}_${angle}_${timestamp}.jpg`;

    try {
      // Upload to storage
      const result = await uploadFile("inspection-images", blob, fileName, userId);
      
      if (!result) {
        throw new Error("Failed to upload image");
      }

      // Save to database
      const { data: savedImage, error } = await supabase
        .from("captured_images")
        .insert({
          inspection_id: inspectionId,
          angle: angle,
          uri: result.path,
          latitude: 0,
          longitude: 0,
          captured_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error saving image to DB:", error);
        throw error;
      }

      const newImage: CapturedImage = {
        id: savedImage.id,
        angle,
        uri: result.path,
        timestamp: new Date().toISOString(),
        location: { latitude: 0, longitude: 0 },
      };

      // Update local state
      setCapturedImages((prev) => {
        const filtered = prev.filter((img) => img.angle !== angle);
        return [...filtered, newImage];
      });

      return newImage;
    } catch (err) {
      console.error("Error saving image:", err);
      toast({
        title: "Failed to save image",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    }
  }, [inspectionId, userId, isAuthenticated, uploadFile, toast]);

  // Load existing images for an inspection
  const loadExistingImages = useCallback(async () => {
    if (!inspectionId || !isAuthenticated) {
      return;
    }

    try {
      const { data: images, error } = await supabase
        .from("captured_images")
        .select("*")
        .eq("inspection_id", inspectionId);

      if (error) {
        console.error("Error loading images:", error);
        return;
      }

      if (images && images.length > 0) {
        const loadedImages: CapturedImage[] = images.map((img) => ({
          id: img.id,
          angle: img.angle as ImageAngle,
          uri: img.uri,
          timestamp: img.captured_at,
          location: {
            latitude: Number(img.latitude) || 0,
            longitude: Number(img.longitude) || 0,
          },
          hash: img.hash || undefined,
        }));

        setCapturedImages(loadedImages);
        
        if (loadedImages.length > 0) {
          toast({
            title: "Progress restored",
            description: `${loadedImages.length} images loaded from previous session`,
          });
        }
      }
    } catch (err) {
      console.error("Error loading existing images:", err);
    }
  }, [inspectionId, isAuthenticated, toast]);

  // Load existing images when inspection ID is set
  useEffect(() => {
    if (inspectionId && isAuthenticated) {
      loadExistingImages();
    }
  }, [inspectionId, isAuthenticated, loadExistingImages]);

  return {
    inspectionId,
    userId,
    isLoading,
    capturedImages,
    createInspection,
    saveImage,
    loadExistingImages,
    isAuthenticated,
  };
}
