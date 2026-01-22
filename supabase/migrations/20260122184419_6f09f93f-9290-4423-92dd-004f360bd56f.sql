-- Create storage bucket for inspection images
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-images', 'inspection-images', false);

-- Create storage bucket for inspection videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-videos', 'inspection-videos', false);

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', false);

-- RLS policies for inspection-images bucket
CREATE POLICY "Users can upload images for their inspections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own inspection images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for inspection-videos bucket
CREATE POLICY "Users can upload videos for their inspections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own inspection videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for voice-recordings bucket
CREATE POLICY "Users can upload voice recordings for their inspections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own voice recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);