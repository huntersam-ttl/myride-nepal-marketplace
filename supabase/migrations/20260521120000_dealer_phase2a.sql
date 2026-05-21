-- Phase 2A: Dealer Dashboard, Leads, Analytics, and Inventory Management
-- Safe migration with IF NOT EXISTS checks

-- 1. Update listing_status enum to include 'reserved' and 'draft'
DO $$
BEGIN
  -- Add new enum values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reserved' AND enumtypid = 'listing_status'::regtype) THEN
    ALTER TYPE listing_status ADD VALUE 'reserved';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'draft' AND enumtypid = 'listing_status'::regtype) THEN
    ALTER TYPE listing_status ADD VALUE 'draft';
  END IF;
END $$;

-- 2. Add new columns to listings table
ALTER TABLE listings 
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS leads_count INTEGER DEFAULT 0 NOT NULL;

-- Migrate existing views data if views column exists and views_count is 0
UPDATE listings SET views_count = COALESCE(views, 0) WHERE views_count = 0 AND views IS NOT NULL;

-- 3. Create dealer_leads table
CREATE TABLE IF NOT EXISTS dealer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_name TEXT,
  buyer_contact TEXT,
  source TEXT DEFAULT 'direct' NOT NULL,
  stage TEXT DEFAULT 'new' NOT NULL,
  notes TEXT,
  whatsapp_click BOOLEAN DEFAULT false NOT NULL,
  phone_click BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dealer_leads_stage_check CHECK (stage IN ('new', 'contacted', 'negotiating', 'visit_booked', 'sold', 'lost'))
);

-- Create indexes for dealer_leads
CREATE INDEX IF NOT EXISTS idx_dealer_leads_dealer_id ON dealer_leads(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_leads_listing_id ON dealer_leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_dealer_leads_stage ON dealer_leads(stage);
CREATE INDEX IF NOT EXISTS idx_dealer_leads_created_at ON dealer_leads(created_at DESC);

-- 4. Create dealer_analytics_events table
CREATE TABLE IF NOT EXISTS dealer_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dealer_analytics_events_type_check CHECK (event_type IN ('profile_view', 'listing_view', 'whatsapp_click', 'phone_click'))
);

-- Create indexes for dealer_analytics_events
CREATE INDEX IF NOT EXISTS idx_dealer_analytics_dealer_id ON dealer_analytics_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_analytics_listing_id ON dealer_analytics_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_dealer_analytics_event_type ON dealer_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dealer_analytics_created_at ON dealer_analytics_events(created_at DESC);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for dealer_leads updated_at
DROP TRIGGER IF EXISTS update_dealer_leads_updated_at ON dealer_leads;
CREATE TRIGGER update_dealer_leads_updated_at
  BEFORE UPDATE ON dealer_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE dealer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_analytics_events ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for dealer_leads

-- Dealers can read their own leads
CREATE POLICY IF NOT EXISTS "Dealers can view their own leads"
  ON dealer_leads
  FOR SELECT
  TO authenticated
  USING (
    dealer_id IN (
      SELECT id FROM dealer_profiles WHERE user_id = auth.uid()
    )
  );

-- Dealers can update their own leads
CREATE POLICY IF NOT EXISTS "Dealers can update their own leads"
  ON dealer_leads
  FOR UPDATE
  TO authenticated
  USING (
    dealer_id IN (
      SELECT id FROM dealer_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    dealer_id IN (
      SELECT id FROM dealer_profiles WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert leads (for tracking clicks from buyers)
CREATE POLICY IF NOT EXISTS "Anyone can create leads"
  ON dealer_leads
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all leads
CREATE POLICY IF NOT EXISTS "Admins can view all leads"
  ON dealer_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 9. Create RLS policies for dealer_analytics_events

-- Dealers can read their own analytics
CREATE POLICY IF NOT EXISTS "Dealers can view their own analytics"
  ON dealer_analytics_events
  FOR SELECT
  TO authenticated
  USING (
    dealer_id IN (
      SELECT id FROM dealer_profiles WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert analytics events (for tracking)
CREATE POLICY IF NOT EXISTS "Anyone can create analytics events"
  ON dealer_analytics_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all analytics
CREATE POLICY IF NOT EXISTS "Admins can view all analytics"
  ON dealer_analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 10. Add comment documentation
COMMENT ON TABLE dealer_leads IS 'Stores leads generated from dealer listings and profiles';
COMMENT ON TABLE dealer_analytics_events IS 'Tracks dealer profile and listing interactions for analytics';
COMMENT ON COLUMN listings.youtube_url IS 'YouTube video URL for the listing';
COMMENT ON COLUMN listings.views_count IS 'Number of times this listing has been viewed';
COMMENT ON COLUMN listings.leads_count IS 'Number of leads generated from this listing';

-- Success message
SELECT 'Phase 2A dealer migration completed successfully!' AS status;
