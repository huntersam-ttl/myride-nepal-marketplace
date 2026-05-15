-- Add seller_role column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_role text DEFAULT 'user';

-- Add rejection_reason column to listings table (if not already exists)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add comment to explain the seller_role column
COMMENT ON COLUMN listings.seller_role IS 'Role of the seller: user, dealer, or admin';
