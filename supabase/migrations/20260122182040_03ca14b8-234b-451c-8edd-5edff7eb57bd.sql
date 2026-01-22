-- Create inspections table for 2-wheeler inspections
CREATE TABLE public.inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  executive_id UUID NOT NULL,
  customer_id UUID,
  vehicle_registration TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  vehicle_vin TEXT,
  odometer_reading INTEGER,
  engine_cc INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_consent', 'consented', 'second_inspection', 'completed')),
  condition_score DECIMAL(4,2),
  ai_confidence DECIMAL(4,2),
  consented_at TIMESTAMP WITH TIME ZONE,
  frozen_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create captured_images table
CREATE TABLE public.captured_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  angle TEXT NOT NULL CHECK (angle IN ('front', 'rear', 'left', 'right', 'engine', 'chassis', 'odometer', 'front_tyre', 'rear_tyre', 'handlebar', 'fuel_tank', 'exhaust')),
  uri TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  hash TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create captured_videos table
CREATE TABLE public.captured_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  video_type TEXT NOT NULL CHECK (video_type IN ('walkaround', 'engine_start', 'idle_sound', 'acceleration')),
  uri TEXT NOT NULL,
  duration INTEGER NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  hash TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create defects table
CREATE TABLE public.defects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('engine', 'transmission', 'electricals', 'frame', 'body', 'tyres', 'suspension', 'brakes')),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  extracted_from TEXT NOT NULL CHECK (extracted_from IN ('voice', 'ai', 'manual')),
  confidence DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice_recordings table
CREATE TABLE public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('engine', 'transmission', 'electricals', 'frame', 'body', 'tyres', 'suspension', 'brakes')),
  audio_uri TEXT NOT NULL,
  transcript TEXT NOT NULL,
  duration INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table for trust scores
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'executive' CHECK (role IN ('executive', 'customer', 'admin')),
  phone TEXT,
  email TEXT,
  trust_score INTEGER NOT NULL DEFAULT 50,
  trust_level TEXT NOT NULL DEFAULT 'Bronze' CHECK (trust_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  coins INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inspection_deltas table for comparing inspections
CREATE TABLE public.inspection_deltas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_inspection_id UUID NOT NULL REFERENCES public.inspections(id),
  second_inspection_id UUID NOT NULL REFERENCES public.inspections(id),
  attribution TEXT NOT NULL CHECK (attribution IN ('customer', 'inspector', 'platform')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_deltas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inspections
CREATE POLICY "Executives can view their own inspections" ON public.inspections FOR SELECT USING (auth.uid() = executive_id);
CREATE POLICY "Executives can create inspections" ON public.inspections FOR INSERT WITH CHECK (auth.uid() = executive_id);
CREATE POLICY "Executives can update their own inspections" ON public.inspections FOR UPDATE USING (auth.uid() = executive_id);

-- RLS Policies for captured_images
CREATE POLICY "Users can view images for their inspections" ON public.captured_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can insert images for their inspections" ON public.captured_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));

-- RLS Policies for captured_videos
CREATE POLICY "Users can view videos for their inspections" ON public.captured_videos FOR SELECT USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can insert videos for their inspections" ON public.captured_videos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));

-- RLS Policies for defects
CREATE POLICY "Users can view defects for their inspections" ON public.defects FOR SELECT USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can insert defects for their inspections" ON public.defects FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can update defects for their inspections" ON public.defects FOR UPDATE USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));

-- RLS Policies for voice_recordings
CREATE POLICY "Users can view recordings for their inspections" ON public.voice_recordings FOR SELECT USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can insert recordings for their inspections" ON public.voice_recordings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.inspections WHERE id = inspection_id AND executive_id = auth.uid()));

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for inspection_deltas
CREATE POLICY "Users can view deltas for their inspections" ON public.inspection_deltas FOR SELECT USING (EXISTS (SELECT 1 FROM public.inspections WHERE id = first_inspection_id AND executive_id = auth.uid()));
CREATE POLICY "Users can create deltas for their inspections" ON public.inspection_deltas FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.inspections WHERE id = first_inspection_id AND executive_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();