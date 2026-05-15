-- Add report_count column to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_report_count ON public.listings(report_count) WHERE report_count > 0;

-- Create function to increment report count
CREATE OR REPLACE FUNCTION increment_listing_report_count(listing_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.listings
  SET report_count = COALESCE(report_count, 0) + 1
  WHERE id = listing_id_param;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_listing_report_count(UUID) TO authenticated;

-- Add comment
COMMENT ON COLUMN public.listings.report_count IS 'Number of times this listing has been reported';
