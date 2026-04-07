
-- Create oem_organizations table
CREATE TABLE public.oem_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id TEXT NOT NULL UNIQUE DEFAULT 'ORG-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
  company_name TEXT NOT NULL,
  trade_name TEXT,
  gst_number TEXT,
  pan_number TEXT,
  registered_address TEXT,
  primary_city TEXT NOT NULL,
  signatory_name TEXT,
  signatory_designation TEXT,
  signatory_phone TEXT,
  signatory_email TEXT,
  brands TEXT[] DEFAULT '{}',
  estimated_monthly_volume TEXT,
  assigned_kam TEXT,
  registration_doc_status TEXT NOT NULL DEFAULT 'not_started',
  legal_agreement_status TEXT NOT NULL DEFAULT 'not_started',
  entity_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kyc_submissions table for broker KYC review queue
CREATE TABLE public.kyc_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE DEFAULT 'KYC-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
  broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'pan_card',
  document_uri TEXT,
  ocr_confidence NUMERIC,
  ocr_extracted_data JSONB,
  flag_reason TEXT,
  assigned_to UUID REFERENCES public.ops_users(id),
  review_status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oem_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- OEM: authenticated users can read
CREATE POLICY "Authenticated users can view OEM organizations"
  ON public.oem_organizations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert OEM organizations"
  ON public.oem_organizations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update OEM organizations"
  ON public.oem_organizations FOR UPDATE TO authenticated
  USING (true);

-- KYC: authenticated users can read
CREATE POLICY "Authenticated users can view KYC submissions"
  ON public.kyc_submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert KYC submissions"
  ON public.kyc_submissions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update KYC submissions"
  ON public.kyc_submissions FOR UPDATE TO authenticated
  USING (true);

-- Triggers
CREATE TRIGGER update_oem_organizations_updated_at
  BEFORE UPDATE ON public.oem_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
