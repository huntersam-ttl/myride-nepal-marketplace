-- Create seller_reviews table
CREATE TABLE IF NOT EXISTS seller_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(buyer_id, listing_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_seller_reviews_seller_id ON seller_reviews(seller_id);
CREATE INDEX idx_seller_reviews_buyer_id ON seller_reviews(buyer_id);
CREATE INDEX idx_seller_reviews_listing_id ON seller_reviews(listing_id);
CREATE INDEX idx_seller_reviews_created_at ON seller_reviews(created_at DESC);

-- Add RLS policies
ALTER TABLE seller_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON seller_reviews FOR SELECT
  USING (true);

-- Buyers can insert their own reviews
CREATE POLICY "Buyers can insert their own reviews"
  ON seller_reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own reviews
CREATE POLICY "Buyers can update their own reviews"
  ON seller_reviews FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Buyers can delete their own reviews
CREATE POLICY "Buyers can delete their own reviews"
  ON seller_reviews FOR DELETE
  USING (auth.uid() = buyer_id);

-- Add average_rating and total_reviews columns to profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'average_rating') THEN
    ALTER TABLE profiles ADD COLUMN average_rating NUMERIC(3,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create a function to update seller ratings
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM seller_reviews
      WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM seller_reviews
      WHERE seller_id = COALESCE(NEW.seller_id, OLD.seller_id)
    )
  WHERE id = COALESCE(NEW.seller_id, OLD.seller_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update seller ratings
DROP TRIGGER IF EXISTS trigger_update_seller_rating ON seller_reviews;
CREATE TRIGGER trigger_update_seller_rating
  AFTER INSERT OR UPDATE OR DELETE ON seller_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_rating();

-- Create updated_at trigger for seller_reviews
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_seller_reviews_updated_at ON seller_reviews;
CREATE TRIGGER update_seller_reviews_updated_at
  BEFORE UPDATE ON seller_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
