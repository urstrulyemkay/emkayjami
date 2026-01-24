-- Create table for auction scheduled pickups
CREATE TABLE public.auction_pickups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_pickups ENABLE ROW LEVEL SECURITY;

-- RLS policies for auction_pickups
CREATE POLICY "Users can view pickups for their inspections"
ON public.auction_pickups
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_pickups.inspection_id
  AND inspections.executive_id = auth.uid()
));

CREATE POLICY "Users can insert pickups for their inspections"
ON public.auction_pickups
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_pickups.inspection_id
  AND inspections.executive_id = auth.uid()
));

CREATE POLICY "Users can update pickups for their inspections"
ON public.auction_pickups
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_pickups.inspection_id
  AND inspections.executive_id = auth.uid()
));

-- Create table for auction documents
CREATE TABLE public.auction_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_uri TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for auction_documents
CREATE POLICY "Users can view documents for their inspections"
ON public.auction_documents
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_documents.inspection_id
  AND inspections.executive_id = auth.uid()
));

CREATE POLICY "Users can insert documents for their inspections"
ON public.auction_documents
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_documents.inspection_id
  AND inspections.executive_id = auth.uid()
));

CREATE POLICY "Users can delete documents for their inspections"
ON public.auction_documents
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM inspections
  WHERE inspections.id = auction_documents.inspection_id
  AND inspections.executive_id = auth.uid()
));

-- Create trigger for updated_at on auction_pickups
CREATE TRIGGER update_auction_pickups_updated_at
BEFORE UPDATE ON public.auction_pickups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for auction documents
INSERT INTO storage.buckets (id, name, public) VALUES ('auction-documents', 'auction-documents', false);

-- Storage policies for auction-documents bucket
CREATE POLICY "Users can upload their auction documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'auction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their auction documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'auction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their auction documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'auction-documents' AND auth.uid()::text = (storage.foldername(name))[1]);