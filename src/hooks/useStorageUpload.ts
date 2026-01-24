import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type BucketType = "inspection-images" | "inspection-videos" | "voice-recordings";

interface UploadResult {
  path: string;
  signedUrl: string;
}

export function useStorageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(
    async (
      bucket: BucketType,
      file: Blob,
      fileName: string,
      userId: string
    ): Promise<UploadResult | null> => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const filePath = `${userId}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        // Use signed URLs for private buckets instead of public URLs
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600); // 1 hour expiry

        if (urlError) {
          console.error("Error creating signed URL:", urlError);
          throw urlError;
        }

        setUploadProgress(100);
        
        return {
          path: data.path,
          signedUrl: signedUrlData.signedUrl,
        };
      } catch (error) {
        console.error("Failed to upload file:", error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadDataUrl = useCallback(
    async (
      bucket: BucketType,
      dataUrl: string,
      fileName: string,
      userId: string
    ): Promise<UploadResult | null> => {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      return uploadFile(bucket, blob, fileName, userId);
    },
    [uploadFile]
  );

  const getSignedUrl = useCallback(
    async (bucket: BucketType, path: string): Promise<string | null> => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        console.error("Failed to get signed URL:", error);
        return null;
      }

      return data.signedUrl;
    },
    []
  );

  return {
    uploadFile,
    uploadDataUrl,
    getSignedUrl,
    isUploading,
    uploadProgress,
  };
}
