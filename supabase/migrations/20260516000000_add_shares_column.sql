-- Add shares column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Add index for sorting by shares
CREATE INDEX IF NOT EXISTS idx_listings_shares ON listings(shares DESC);

-- Add comment
COMMENT ON COLUMN listings.shares IS 'Number of times this listing has been shared';
