-- Add sold_at and sold_price columns to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sold_price INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.listings.sold_at IS 'Timestamp when listing was marked as sold';
COMMENT ON COLUMN public.listings.sold_price IS 'Final sale price in NPR (optional, provided by seller)';
