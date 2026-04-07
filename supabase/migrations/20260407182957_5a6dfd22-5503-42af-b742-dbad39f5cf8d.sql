
-- Create ops_role enum
CREATE TYPE public.ops_role AS ENUM (
  'super_admin', 'ops_manager', 'onboarding_ops', 'kam', 
  'auction_ops', 'logistics_coordinator', 'runner', 
  'finance_ops', 'doc_exec', 'doc_lead', 'qa_audit'
);

-- Create ops_users table
CREATE TABLE public.ops_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  roles ops_role[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  city_filter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create ops_audit_log table
CREATE TABLE public.ops_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ops_user_id UUID REFERENCES public.ops_users(id) NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ops_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS for ops_users: ops users can view their own record
CREATE POLICY "Ops users can view their own profile"
  ON public.ops_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Super admins can view all ops users
CREATE POLICY "Super admins can view all ops users"
  ON public.ops_users FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.user_id = auth.uid() AND 'super_admin' = ANY(ou.roles)
    )
  );

-- Super admins can insert ops users
CREATE POLICY "Super admins can insert ops users"
  ON public.ops_users FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.user_id = auth.uid() AND 'super_admin' = ANY(ou.roles)
    )
  );

-- Super admins can update ops users
CREATE POLICY "Super admins can update ops users"
  ON public.ops_users FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.user_id = auth.uid() AND 'super_admin' = ANY(ou.roles)
    )
  );

-- Ops users can view audit logs for their own actions
CREATE POLICY "Ops users can view their audit logs"
  ON public.ops_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.id = ops_audit_log.ops_user_id AND ou.user_id = auth.uid()
    )
  );

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON public.ops_audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.user_id = auth.uid() AND 'super_admin' = ANY(ou.roles)
    )
  );

-- Any ops user can insert audit logs (for their own actions)
CREATE POLICY "Ops users can insert audit logs"
  ON public.ops_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ops_users ou
      WHERE ou.id = ops_audit_log.ops_user_id AND ou.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at on ops_users
CREATE TRIGGER update_ops_users_updated_at
  BEFORE UPDATE ON public.ops_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
