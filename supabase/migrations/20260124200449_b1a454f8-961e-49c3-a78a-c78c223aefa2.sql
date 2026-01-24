-- Add DELETE policies for storage buckets that are missing them

-- Delete policy for inspection-images bucket
CREATE POLICY "Users can delete their own inspection images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete policy for inspection-videos bucket
CREATE POLICY "Users can delete their own inspection videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete policy for voice-recordings bucket
CREATE POLICY "Users can delete their own voice recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);