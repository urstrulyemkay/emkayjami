-- First, create the app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'executive', 'broker', 'customer');

-- Create user_roles table for proper role management (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create brokers table
CREATE TABLE public.brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    city TEXT NOT NULL,
    operating_radius INTEGER DEFAULT 100,
    business_type TEXT DEFAULT 'retail_dealer',
    gstin TEXT,
    pan TEXT,
    bank_account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    
    -- Preferences
    preferred_makes TEXT[] DEFAULT '{}',
    preferred_categories TEXT[] DEFAULT '{}',
    price_band_min INTEGER DEFAULT 10000,
    price_band_max INTEGER DEFAULT 200000,
    kms_range_max INTEGER DEFAULT 100000,
    age_range TEXT DEFAULT '0-5',
    preferred_auction_types TEXT[] DEFAULT '{}',
    
    -- Status
    account_status TEXT NOT NULL DEFAULT 'pending_kyc',
    kyc_status TEXT DEFAULT 'pending',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Gamification
    trust_score INTEGER NOT NULL DEFAULT 50,
    level INTEGER NOT NULL DEFAULT 1,
    coins_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_coins_earned INTEGER NOT NULL DEFAULT 0,
    lifetime_coins_spent INTEGER NOT NULL DEFAULT 0,
    strikes_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brokers
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;

-- Broker RLS policies
CREATE POLICY "Brokers can view their own profile"
ON public.brokers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Brokers can create their own profile"
ON public.brokers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brokers can update their own profile"
ON public.brokers FOR UPDATE
USING (auth.uid() = user_id);

-- Create auctions table (for broker view)
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
    auction_type TEXT NOT NULL DEFAULT 'flexible',
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    
    -- Broker network settings
    broker_network TEXT DEFAULT 'drivex_network',
    selected_broker_ids UUID[] DEFAULT '{}',
    geo_targeting_city TEXT,
    geo_targeting_radius INTEGER,
    
    -- Bid data
    current_highest_bid INTEGER DEFAULT 0,
    current_highest_commission INTEGER DEFAULT 0,
    bid_count INTEGER DEFAULT 0,
    reserve_price INTEGER,
    minimum_bid_increment INTEGER DEFAULT 500,
    
    -- Result
    winning_bid_id UUID,
    winning_broker_id UUID,
    allocation_timestamp TIMESTAMP WITH TIME ZONE,
    outcome_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on auctions
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;

-- Auction RLS policies
CREATE POLICY "Executives can manage their auctions"
ON public.auctions FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.inspections
    WHERE inspections.id = auctions.inspection_id
    AND inspections.executive_id = auth.uid()
));

CREATE POLICY "Active brokers can view live and upcoming auctions"
ON public.auctions FOR SELECT
USING (
    status IN ('scheduled', 'live', 'ended')
    AND EXISTS (
        SELECT 1 FROM public.brokers
        WHERE brokers.user_id = auth.uid()
        AND brokers.account_status = 'active'
    )
);

-- Create broker_bids table
CREATE TABLE public.broker_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
    broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
    
    -- Bid components
    bid_amount INTEGER NOT NULL,
    commission_amount INTEGER NOT NULL DEFAULT 0,
    effective_score NUMERIC GENERATED ALWAYS AS (
        (bid_amount * 0.85) + (commission_amount * 0.15)
    ) STORED,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    bid_type TEXT DEFAULT 'initial',
    
    -- Timing
    placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    time_offset_ms INTEGER,
    
    -- Metadata
    device_info TEXT,
    
    CONSTRAINT commission_range CHECK (commission_amount >= 0 AND commission_amount <= 2000)
);

-- Enable RLS on broker_bids
ALTER TABLE public.broker_bids ENABLE ROW LEVEL SECURITY;

-- Bid RLS policies
CREATE POLICY "Brokers can view their own bids"
ON public.broker_bids FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.brokers
    WHERE brokers.id = broker_bids.broker_id
    AND brokers.user_id = auth.uid()
));

CREATE POLICY "Brokers can place bids"
ON public.broker_bids FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.brokers
    WHERE brokers.id = broker_bids.broker_id
    AND brokers.user_id = auth.uid()
    AND brokers.account_status = 'active'
));

-- Executives can see bids on their auctions
CREATE POLICY "Executives can view bids on their auctions"
ON public.broker_bids FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.auctions
    JOIN public.inspections ON inspections.id = auctions.inspection_id
    WHERE auctions.id = broker_bids.auction_id
    AND inspections.executive_id = auth.uid()
));

-- Create broker_wallet_transactions table
CREATE TABLE public.broker_wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    related_entity_type TEXT,
    related_entity_id UUID,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view their wallet transactions"
ON public.broker_wallet_transactions FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.brokers
    WHERE brokers.id = broker_wallet_transactions.broker_id
    AND brokers.user_id = auth.uid()
));

-- Create broker_strikes table
CREATE TABLE public.broker_strikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'minor',
    penalty_coins INTEGER DEFAULT 0,
    penalty_trust_score INTEGER DEFAULT 0,
    related_entity_type TEXT,
    related_entity_id UUID,
    appeal_status TEXT DEFAULT 'not_appealed',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_strikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view their strikes"
ON public.broker_strikes FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.brokers
    WHERE brokers.id = broker_strikes.broker_id
    AND brokers.user_id = auth.uid()
));

-- Create broker_badges table
CREATE TABLE public.broker_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID REFERENCES public.brokers(id) ON DELETE CASCADE NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT,
    description TEXT,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 100,
    earned_at TIMESTAMP WITH TIME ZONE,
    coins_reward INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broker_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view their badges"
ON public.broker_badges FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.brokers
    WHERE brokers.id = broker_badges.broker_id
    AND brokers.user_id = auth.uid()
));

-- Create triggers for updated_at
CREATE TRIGGER update_brokers_updated_at
BEFORE UPDATE ON public.brokers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at
BEFORE UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for auctions and bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_bids;