-- Phase 1 Dealer Migration (Safe Version with IF NOT EXISTS)
-- This version safely adds columns only if they don't already exist

-- Add new columns to dealer_profiles (using DO block for safe execution)
DO $$
BEGIN
  -- Contact Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'district') THEN
    ALTER TABLE dealer_profiles ADD COLUMN district TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'full_address') THEN
    ALTER TABLE dealer_profiles ADD COLUMN full_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'phone') THEN
    ALTER TABLE dealer_profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'whatsapp') THEN
    ALTER TABLE dealer_profiles ADD COLUMN whatsapp TEXT;
  END IF;
  
  -- Social Media
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'facebook_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN facebook_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'tiktok_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN tiktok_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'youtube_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN youtube_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'instagram_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN instagram_url TEXT;
  END IF;
  
  -- Business Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'years_in_business') THEN
    ALTER TABLE dealer_profiles ADD COLUMN years_in_business INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'opening_hours') THEN
    ALTER TABLE dealer_profiles ADD COLUMN opening_hours JSONB;
  END IF;
  
  -- Services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'exchange_accepted') THEN
    ALTER TABLE dealer_profiles ADD COLUMN exchange_accepted BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'financing_available') THEN
    ALTER TABLE dealer_profiles ADD COLUMN financing_available BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'service_centre') THEN
    ALTER TABLE dealer_profiles ADD COLUMN service_centre BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'service_area') THEN
    ALTER TABLE dealer_profiles ADD COLUMN service_area TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
  
  -- Admin/Stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flagged') THEN
    ALTER TABLE dealer_profiles ADD COLUMN flagged BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'active_listings_count') THEN
    ALTER TABLE dealer_profiles ADD COLUMN active_listings_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  -- Future placeholders (Phase 2)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'average_rating') THEN
    ALTER TABLE dealer_profiles ADD COLUMN average_rating NUMERIC(3,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE dealer_profiles ADD COLUMN total_reviews INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_district ON dealer_profiles(district);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flagged ON dealer_profiles(flagged);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_years ON dealer_profiles(years_in_business);

-- Comments for documentation
COMMENT ON COLUMN dealer_profiles.district IS 'Nepal district (replaces location field)';
COMMENT ON COLUMN dealer_profiles.full_address IS 'Complete street address';
COMMENT ON COLUMN dealer_profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN dealer_profiles.whatsapp IS 'WhatsApp number';
COMMENT ON COLUMN dealer_profiles.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN dealer_profiles.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN dealer_profiles.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN dealer_profiles.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN dealer_profiles.years_in_business IS 'Years operating as dealer';
COMMENT ON COLUMN dealer_profiles.opening_hours IS 'Business hours in JSONB format';
COMMENT ON COLUMN dealer_profiles.exchange_accepted IS 'Accepts bikes in exchange';
COMMENT ON COLUMN dealer_profiles.financing_available IS 'Offers financing/loan options';
COMMENT ON COLUMN dealer_profiles.service_centre IS 'Has repair/maintenance service';
COMMENT ON COLUMN dealer_profiles.service_area IS 'Districts served';
COMMENT ON COLUMN dealer_profiles.flagged IS 'Flagged by admin for review';
COMMENT ON COLUMN dealer_profiles.active_listings_count IS 'Count of active listings';
COMMENT ON COLUMN dealer_profiles.average_rating IS 'Average review rating (Phase 2)';
COMMENT ON COLUMN dealer_profiles.total_reviews IS 'Total review count (Phase 2)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 dealer migration completed successfully!';
  RAISE NOTICE 'All columns have been added to dealer_profiles table.';
END $$;
