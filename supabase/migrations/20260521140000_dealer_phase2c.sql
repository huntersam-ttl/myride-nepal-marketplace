-- Phase 2C: Dealer Reviews, Showroom Gallery, Verification, Dead Stock, Admin Moderation
-- Safe migration with IF NOT EXISTS checks

-- 1. Add new columns to dealer_profiles if not exists
DO $$
BEGIN
  -- Showroom photos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'showroom_photos') THEN
    ALTER TABLE dealer_profiles ADD COLUMN showroom_photos TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
  
  -- Verification documents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'verification_documents') THEN
    ALTER TABLE dealer_profiles ADD COLUMN verification_documents TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
  
  -- Phone verified
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'phone_verified') THEN
    ALTER TABLE dealer_profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  -- Verification checklist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'verified_checklist') THEN
    ALTER TABLE dealer_profiles ADD COLUMN verified_checklist JSONB DEFAULT '{}' NOT NULL;
  END IF;
  
  -- Suspended
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'suspended') THEN
    ALTER TABLE dealer_profiles ADD COLUMN suspended BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  -- Moderation note
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'moderation_note') THEN
    ALTER TABLE dealer_profiles ADD COLUMN moderation_note TEXT;
  END IF;
  
  -- Flag count (may already exist from Phase 2B)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flag_count') THEN
    ALTER TABLE dealer_profiles ADD COLUMN flag_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2. Create dealer_reviews table
CREATE TABLE IF NOT EXISTS dealer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  dealer_response TEXT,
  admin_removed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dealer_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer_id ON dealer_reviews(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_rating ON dealer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_created_at ON dealer_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_admin_removed ON dealer_reviews(admin_removed);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_verified ON dealer_profiles(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flagged ON dealer_profiles(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_suspended ON dealer_profiles(suspended) WHERE suspended = true;
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flag_count ON dealer_profiles(flag_count) WHERE flag_count > 0;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for dealer_reviews

-- Public can read non-removed reviews
DROP POLICY IF EXISTS "Public can read non-removed reviews" ON dealer_reviews;
CREATE POLICY "Public can read non-removed reviews"
  ON dealer_reviews
  FOR SELECT
  TO public
  USING (admin_removed = false);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON dealer_reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON dealer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Dealers can respond to reviews on their profile
DROP POLICY IF EXISTS "Dealers can respond to reviews" ON dealer_reviews;
CREATE POLICY "Dealers can respond to reviews"
  ON dealer_reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dealer_profiles
      WHERE dealer_profiles.id = dealer_reviews.dealer_id
      AND dealer_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dealer_profiles
      WHERE dealer_profiles.id = dealer_reviews.dealer_id
      AND dealer_profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all reviews
DROP POLICY IF EXISTS "Admins can manage reviews" ON dealer_reviews;
CREATE POLICY "Admins can manage reviews"
  ON dealer_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Create function to update dealer rating stats
CREATE OR REPLACE FUNCTION update_dealer_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average_rating and total_reviews for the dealer
  UPDATE dealer_profiles
  SET 
    average_rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM dealer_reviews
      WHERE dealer_id = COALESCE(NEW.dealer_id, OLD.dealer_id)
      AND admin_removed = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM dealer_reviews
      WHERE dealer_id = COALESCE(NEW.dealer_id, OLD.dealer_id)
      AND admin_removed = false
    )
  WHERE id = COALESCE(NEW.dealer_id, OLD.dealer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for rating stats updates
DROP TRIGGER IF EXISTS update_dealer_rating_stats_trigger ON dealer_reviews;
CREATE TRIGGER update_dealer_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dealer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_rating_stats();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_dealer_reviews_updated_at ON dealer_reviews;
CREATE TRIGGER update_dealer_reviews_updated_at
  BEFORE UPDATE ON dealer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Add comment documentation
COMMENT ON TABLE dealer_reviews IS 'Stores reviews and ratings for dealers';
COMMENT ON COLUMN dealer_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN dealer_reviews.dealer_response IS 'Optional response from dealer to the review';
COMMENT ON COLUMN dealer_reviews.admin_removed IS 'If true, review is hidden from public view';
COMMENT ON COLUMN dealer_profiles.showroom_photos IS 'Array of showroom photo URLs';
COMMENT ON COLUMN dealer_profiles.verification_documents IS 'Array of verification document URLs';
COMMENT ON COLUMN dealer_profiles.phone_verified IS 'Whether phone number has been verified';
COMMENT ON COLUMN dealer_profiles.verified_checklist IS 'JSON object tracking verification progress';
COMMENT ON COLUMN dealer_profiles.suspended IS 'If true, dealer is suspended and hidden from public';
COMMENT ON COLUMN dealer_profiles.moderation_note IS 'Internal admin note about dealer moderation';
COMMENT ON COLUMN dealer_profiles.flag_count IS 'Number of unresolved reports against dealer';

-- Success message
SELECT 'Phase 2C dealer migration completed successfully!' AS status,
       'New table: dealer_reviews' AS tables_created,
       'New columns: showroom_photos, verification_documents, phone_verified, verified_checklist, suspended, moderation_note' AS columns_added,
       'RLS policies, triggers, and indexes created' AS security;
