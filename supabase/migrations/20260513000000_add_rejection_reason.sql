-- Add rejection_reason column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.listings.rejection_reason IS 'Reason provided by admin when rejecting a listing';
