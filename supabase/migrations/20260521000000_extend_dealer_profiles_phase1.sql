-- Phase 1: Extend dealer_profiles table with all required fields for 3-month free beta
-- Safe migration: extends existing table without breaking current data

-- Add new columns to dealer_profiles
ALTER TABLE public.dealer_profiles 
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{"monday":"9:00-18:00","tuesday":"9:00-18:00","wednesday":"9:00-18:00","thursday":"9:00-18:00","friday":"9:00-18:00","saturday":"9:00-18:00","sunday":"10:00-16:00"}',
  ADD COLUMN IF NOT EXISTS exchange_accepted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS financing_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_centre BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_listings_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Create index for district filtering
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_district ON public.dealer_profiles(district);

-- Create index for verified dealers (most common query)
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_verified ON public.dealer_profiles(verified) WHERE verified = true;

-- Create index for flagged dealers (admin filtering)
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flagged ON public.dealer_profiles(flagged);

-- Add admin RLS policy for managing dealer verification and flags
CREATE POLICY "Admins manage dealer verification" ON public.dealer_profiles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_dealer_profile_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_dealer_profiles_timestamp ON public.dealer_profiles;
CREATE TRIGGER update_dealer_profiles_timestamp
  BEFORE UPDATE ON public.dealer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dealer_profile_timestamp();

-- Function to update active listings count (can be called manually or via trigger)
CREATE OR REPLACE FUNCTION public.update_dealer_active_listings_count(dealer_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.dealer_profiles
  SET active_listings_count = (
    SELECT COUNT(*) 
    FROM public.listings 
    WHERE user_id = dealer_user_id AND status = 'active'
  )
  WHERE user_id = dealer_user_id;
END;
$$;

COMMENT ON TABLE public.dealer_profiles IS 'Phase 1: Dealer showroom profiles for 3-month free beta program';
COMMENT ON COLUMN public.dealer_profiles.verified IS 'Admin-verified dealer badge';
COMMENT ON COLUMN public.dealer_profiles.flagged IS 'Admin flag for problematic dealers';
COMMENT ON COLUMN public.dealer_profiles.active_listings_count IS 'Cached count of active listings for performance';
