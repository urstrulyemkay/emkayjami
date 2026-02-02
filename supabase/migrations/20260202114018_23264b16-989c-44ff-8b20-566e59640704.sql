-- Create table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(broker_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Brokers can manage their own subscriptions
CREATE POLICY "Brokers can view their subscriptions"
ON public.push_subscriptions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM brokers WHERE brokers.id = push_subscriptions.broker_id AND brokers.user_id = auth.uid()
));

CREATE POLICY "Brokers can insert their subscriptions"
ON public.push_subscriptions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM brokers WHERE brokers.id = push_subscriptions.broker_id AND brokers.user_id = auth.uid()
));

CREATE POLICY "Brokers can delete their subscriptions"
ON public.push_subscriptions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM brokers WHERE brokers.id = push_subscriptions.broker_id AND brokers.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();