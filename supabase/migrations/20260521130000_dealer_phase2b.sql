-- Phase 2B: Dealer Analytics, Share Cards, and Report System
-- Safe migration with IF NOT EXISTS checks

-- 1. Add new columns to dealer_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flag_count') THEN
    ALTER TABLE dealer_profiles ADD COLUMN flag_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'showroom_photos') THEN
    ALTER TABLE dealer_profiles ADD COLUMN showroom_photos TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
END $$;

-- 2. Create dealer_reports table
CREATE TABLE IF NOT EXISTS dealer_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  resolved BOOLEAN DEFAULT false NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dealer_reports_reason_check CHECK (reason IN ('fake_listing', 'wrong_price', 'scam', 'unresponsive', 'other'))
);

-- Create indexes for dealer_reports
CREATE INDEX IF NOT EXISTS idx_dealer_reports_dealer_id ON dealer_reports(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_reason ON dealer_reports(reason);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_resolved ON dealer_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_created_at ON dealer_reports(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE dealer_reports ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for dealer_reports

-- Anyone can create a report (anonymous or authenticated)
DROP POLICY IF EXISTS "Anyone can create dealer reports" ON dealer_reports;
CREATE POLICY "Anyone can create dealer reports"
  ON dealer_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all dealer reports" ON dealer_reports;
CREATE POLICY "Admins can view all dealer reports"
  ON dealer_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can update reports (to resolve them)
DROP POLICY IF EXISTS "Admins can update dealer reports" ON dealer_reports;
CREATE POLICY "Admins can update dealer reports"
  ON dealer_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. Create function to update flag_count
CREATE OR REPLACE FUNCTION update_dealer_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update flag_count when a new unresolved report is added
  IF TG_OP = 'INSERT' AND NEW.resolved = false THEN
    UPDATE dealer_profiles
    SET flag_count = flag_count + 1
    WHERE id = NEW.dealer_id;
  END IF;
  
  -- Update flag_count when a report is resolved
  IF TG_OP = 'UPDATE' AND OLD.resolved = false AND NEW.resolved = true THEN
    UPDATE dealer_profiles
    SET flag_count = GREATEST(flag_count - 1, 0)
    WHERE id = NEW.dealer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for flag_count updates
DROP TRIGGER IF EXISTS update_dealer_flag_count_trigger ON dealer_reports;
CREATE TRIGGER update_dealer_flag_count_trigger
  AFTER INSERT OR UPDATE ON dealer_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_flag_count();

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flag_count ON dealer_profiles(flag_count) WHERE flag_count > 0;

-- 8. Add comment documentation
COMMENT ON TABLE dealer_reports IS 'Stores reports about dealers for admin review';
COMMENT ON COLUMN dealer_profiles.flag_count IS 'Number of unresolved reports against this dealer';
COMMENT ON COLUMN dealer_profiles.showroom_photos IS 'Array of showroom photo URLs';
COMMENT ON COLUMN dealer_reports.reason IS 'Reason for report: fake_listing, wrong_price, scam, unresponsive, other';
COMMENT ON COLUMN dealer_reports.resolved IS 'Whether the report has been reviewed and resolved by admin';

-- Success message
SELECT 'Phase 2B dealer migration completed successfully!' AS status,
       'New table: dealer_reports' AS tables_created,
       'New columns: flag_count, showroom_photos' AS columns_added,
       'RLS policies and triggers created' AS security;
