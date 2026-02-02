-- Create broker_won_vehicles table for post-sale service tracking
CREATE TABLE public.broker_won_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES public.broker_bids(id) ON DELETE CASCADE,
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Payment tracking
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Pickup tracking
  pickup_status TEXT NOT NULL DEFAULT 'pending',
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  pickup_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery tracking
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- RC Transfer tracking (critical - 6 month deadline)
  rc_transfer_status TEXT NOT NULL DEFAULT 'pending',
  rc_transfer_deadline DATE NOT NULL,
  rc_transfer_proof_uri TEXT,
  rc_transferred_at TIMESTAMP WITH TIME ZONE,
  
  -- Name Transfer tracking
  name_transfer_status TEXT NOT NULL DEFAULT 'pending',
  name_transferred_at TIMESTAMP WITH TIME ZONE,
  
  -- Insurance tracking
  insurance_status TEXT NOT NULL DEFAULT 'pending',
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(auction_id, broker_id)
);

-- Create service_documents table for proof uploads
CREATE TABLE public.service_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  won_vehicle_id UUID NOT NULL REFERENCES public.broker_won_vehicles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_uri TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.broker_won_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for broker_won_vehicles
CREATE POLICY "Brokers can view their own won vehicles"
ON public.broker_won_vehicles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.brokers
  WHERE brokers.id = broker_won_vehicles.broker_id
  AND brokers.user_id = auth.uid()
));

CREATE POLICY "Brokers can update their own won vehicles"
ON public.broker_won_vehicles
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.brokers
  WHERE brokers.id = broker_won_vehicles.broker_id
  AND brokers.user_id = auth.uid()
));

-- System can insert won vehicles (via triggers or admin)
CREATE POLICY "System can insert won vehicles"
ON public.broker_won_vehicles
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.brokers
  WHERE brokers.id = broker_won_vehicles.broker_id
  AND brokers.user_id = auth.uid()
));

-- RLS policies for service_documents
CREATE POLICY "Brokers can view their service documents"
ON public.service_documents
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.broker_won_vehicles bwv
  JOIN public.brokers b ON b.id = bwv.broker_id
  WHERE bwv.id = service_documents.won_vehicle_id
  AND b.user_id = auth.uid()
));

CREATE POLICY "Brokers can insert their service documents"
ON public.service_documents
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.broker_won_vehicles bwv
  JOIN public.brokers b ON b.id = bwv.broker_id
  WHERE bwv.id = service_documents.won_vehicle_id
  AND b.user_id = auth.uid()
));

CREATE POLICY "Brokers can delete their service documents"
ON public.service_documents
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.broker_won_vehicles bwv
  JOIN public.brokers b ON b.id = bwv.broker_id
  WHERE bwv.id = service_documents.won_vehicle_id
  AND b.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_broker_won_vehicles_updated_at
BEFORE UPDATE ON public.broker_won_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for service documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-documents', 'service-documents', false);

-- Storage RLS policies
CREATE POLICY "Brokers can upload service documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brokers can view their service documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'service-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brokers can delete their service documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'service-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_won_vehicles;