
-- Drop overly permissive policies
DROP POLICY "Authenticated users can insert OEM organizations" ON public.oem_organizations;
DROP POLICY "Authenticated users can update OEM organizations" ON public.oem_organizations;
DROP POLICY "Authenticated users can insert KYC submissions" ON public.kyc_submissions;
DROP POLICY "Authenticated users can update KYC submissions" ON public.kyc_submissions;

-- Recreate with ops_users check
CREATE POLICY "Ops users can insert OEM organizations"
  ON public.oem_organizations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_users WHERE user_id = auth.uid()));

CREATE POLICY "Ops users can update OEM organizations"
  ON public.oem_organizations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_users WHERE user_id = auth.uid()));

CREATE POLICY "Ops users can insert KYC submissions"
  ON public.kyc_submissions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_users WHERE user_id = auth.uid()));

CREATE POLICY "Ops users can update KYC submissions"
  ON public.kyc_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_users WHERE user_id = auth.uid()));
