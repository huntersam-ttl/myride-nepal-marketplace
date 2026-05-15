-- Add document fields to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS has_bluebook BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bluebook_name_match BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_tax_clearance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_registration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS document_notes TEXT;

-- Add constraint for document_notes length
ALTER TABLE public.listings
ADD CONSTRAINT document_notes_length CHECK (char_length(document_notes) <= 200);

-- Add comments
COMMENT ON COLUMN public.listings.has_bluebook IS 'Seller has the bluebook for this bike';
COMMENT ON COLUMN public.listings.bluebook_name_match IS 'Bluebook is in the seller''s name';
COMMENT ON COLUMN public.listings.has_insurance IS 'Current insurance document available';
COMMENT ON COLUMN public.listings.has_tax_clearance IS 'Tax clearance certificate available';
COMMENT ON COLUMN public.listings.has_registration IS 'Vehicle registration certificate available';
COMMENT ON COLUMN public.listings.document_notes IS 'Additional notes about documents (max 200 chars)';
