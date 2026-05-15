-- Create listing_reports table
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON public.listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON public.listing_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);

-- Add RLS policies
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.listing_reports;
CREATE POLICY "Users can view their own reports"
  ON public.listing_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- Users can create reports
DROP POLICY IF EXISTS "Users can create reports" ON public.listing_reports;
CREATE POLICY "Users can create reports"
  ON public.listing_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.listing_reports;
CREATE POLICY "Admins can view all reports"
  ON public.listing_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
DROP POLICY IF EXISTS "Admins can update reports" ON public.listing_reports;
CREATE POLICY "Admins can update reports"
  ON public.listing_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.listing_reports IS 'User-submitted reports for suspicious or problematic listings';
