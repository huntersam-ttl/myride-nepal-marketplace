-- Dealer Phase 3C: Bulk Listing Tools
-- Add soft delete support and indexes for bulk operations

-- Add deleted_at column for soft delete
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add sold_at column if not exists (for marking sold)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

-- Add engine_cc column if not exists (for CSV import)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS engine_cc INTEGER;

-- Add transmission column if not exists (for CSV import)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS transmission TEXT;

-- Add youtube_url column if not exists (for CSV import)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add dealer_id column if not exists (links to dealer_profiles)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS dealer_id UUID REFERENCES public.dealer_profiles(id) ON DELETE SET NULL;

-- Add leads_count if not exists
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS leads_count INTEGER DEFAULT 0;

-- Add views_count if not exists (may already exist as views)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create index for deleted_at (for filtering out deleted listings)
CREATE INDEX IF NOT EXISTS idx_listings_deleted_at ON public.listings(deleted_at) WHERE deleted_at IS NULL;

-- Create index for sold_at
CREATE INDEX IF NOT EXISTS idx_listings_sold_at ON public.listings(sold_at);

-- Create index for dealer_id
CREATE INDEX IF NOT EXISTS idx_listings_dealer_id ON public.listings(dealer_id);

-- Update existing listings to sync views to views_count if needed
UPDATE public.listings SET views_count = views WHERE views_count = 0 AND views > 0;

-- Update RLS policies to exclude soft-deleted listings from public queries
-- Drop old policy if exists
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;

-- Create new policy that excludes deleted listings
CREATE POLICY "Public can view active non-deleted listings"
  ON public.listings
  FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Policy: Users can view their own listings (including deleted)
DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
CREATE POLICY "Users can view own listings including deleted"
  ON public.listings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own listings
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings"
  ON public.listings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert listings
DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
CREATE POLICY "Users can insert listings"
  ON public.listings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin can manage all listings
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings"
  ON public.listings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Comment
COMMENT ON COLUMN public.listings.deleted_at IS 'Soft delete timestamp - listings with this set are hidden from public';
COMMENT ON COLUMN public.listings.sold_at IS 'Timestamp when listing was marked as sold';
COMMENT ON COLUMN public.listings.dealer_id IS 'Reference to dealer_profiles if listing belongs to dealer';
