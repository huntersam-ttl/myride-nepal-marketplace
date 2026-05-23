-- Security Hardening 1A
-- This migration documents the live hardening already applied.
-- It is intended to preserve that state in version control.
-- Do not re-run against production without explicit confirmation.

-- dealer_analytics_events RLS
-- Keep analytics private: dealers can only see/insert events for their own dealer profile.
-- Admins retain full management access for moderation and support.
DROP POLICY IF EXISTS "Dealers can view own analytics events" ON public.dealer_analytics_events;
DROP POLICY IF EXISTS "Dealers can insert own analytics events" ON public.dealer_analytics_events;
DROP POLICY IF EXISTS "Admins manage analytics events" ON public.dealer_analytics_events;
DROP POLICY IF EXISTS "Dealers and admins can view analytics events" ON public.dealer_analytics_events;
DROP POLICY IF EXISTS "Dealers and admins can insert analytics events" ON public.dealer_analytics_events;

CREATE POLICY "Dealers can view own analytics events"
ON public.dealer_analytics_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.dealer_profiles dp
    WHERE dp.id = dealer_analytics_events.dealer_id
      AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Dealers can insert own analytics events"
ON public.dealer_analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.dealer_profiles dp
    WHERE dp.id = dealer_analytics_events.dealer_id
      AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage analytics events"
ON public.dealer_analytics_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function hardening
-- Pin search_path to public without changing function logic.
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.increment_listing_report_count(uuid) SET search_path = public;
ALTER FUNCTION public.update_seller_rating() SET search_path = public;
ALTER FUNCTION public.update_dealer_flag_count() SET search_path = public;
ALTER FUNCTION public.update_dealer_followers_count() SET search_path = public;
ALTER FUNCTION public.update_dealer_review_stats() SET search_path = public;
ALTER FUNCTION public.update_dealer_team_size() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Function execute grants
-- has_role() is used by RLS and does not need direct client execution.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- increment_listing_report_count(uuid) is intentionally kept for authenticated users
-- because the deployed listing report flow still calls it from the app.
REVOKE EXECUTE ON FUNCTION public.increment_listing_report_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_listing_report_count(uuid) TO authenticated;

-- Trigger-only functions should not be callable by clients.
REVOKE EXECUTE ON FUNCTION public.update_seller_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_dealer_flag_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_dealer_followers_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_dealer_review_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_dealer_team_size() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Intentionally not changed here:
-- 1. Public storage bucket listing warnings for `blog-images` and `listings`.
--    Those need a separate policy review so public asset URLs keep working while object listing is narrowed safely.
-- 2. Supabase Auth leaked password protection.
--    Enable manually in Supabase Dashboard -> Authentication -> Security -> Leaked password protection.
