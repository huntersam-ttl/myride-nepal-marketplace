-- Dealer Report Spam Fix
--
-- Require an authenticated reporter, prevent unresolved duplicate reports,
-- and constrain user-controlled report details. Existing report rows are
-- preserved. Admin SELECT and UPDATE policies remain unchanged.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.dealer_reports
    WHERE resolved = false
      AND reporter_id IS NOT NULL
    GROUP BY reporter_id, dealer_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot add unresolved dealer report uniqueness index: duplicate reporter/dealer pairs require moderation';
  END IF;
END
$$;

DROP POLICY IF EXISTS "Anyone can create dealer reports" ON public.dealer_reports;
DROP POLICY IF EXISTS "Authenticated users can create dealer reports" ON public.dealer_reports;

REVOKE INSERT ON TABLE public.dealer_reports FROM PUBLIC, anon;
GRANT INSERT ON TABLE public.dealer_reports TO authenticated;

CREATE POLICY "Authenticated users can create dealer reports"
ON public.dealer_reports
FOR INSERT
TO authenticated
WITH CHECK (
  reporter_id = auth.uid()
  AND resolved = false
  AND resolved_at IS NULL
  AND resolved_by IS NULL
);

ALTER TABLE public.dealer_reports
  DROP CONSTRAINT IF EXISTS dealer_reports_details_length_check;

-- NOT VALID preserves legacy rows while enforcing the limit for new inserts.
-- Validate separately after confirming whether older rows need moderation.
ALTER TABLE public.dealer_reports
  ADD CONSTRAINT dealer_reports_details_length_check
  CHECK (details IS NULL OR char_length(details) <= 1000)
  NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_reports_one_unresolved_per_reporter_dealer
  ON public.dealer_reports (reporter_id, dealer_id)
  WHERE resolved = false;

-- The trigger updates dealer_profiles.flag_count after a report is inserted or
-- resolved. Run it with the function owner's privileges so ordinary reporters
-- do not need UPDATE permission on dealer_profiles. Direct client execution
-- remains disabled.
ALTER FUNCTION public.update_dealer_flag_count() SECURITY DEFINER;
ALTER FUNCTION public.update_dealer_flag_count() SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.update_dealer_flag_count() FROM PUBLIC, anon, authenticated;
