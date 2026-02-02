-- Enable realtime for remaining broker-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_strikes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brokers;

-- Allow brokers to insert their own wallet transactions (for coin shop purchases)
CREATE POLICY "Brokers can insert their own wallet transactions"
ON public.broker_wallet_transactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brokers
    WHERE brokers.id = broker_wallet_transactions.broker_id
    AND brokers.user_id = auth.uid()
  )
);