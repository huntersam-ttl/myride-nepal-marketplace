-- Phase 1 security hardening: repair authenticated RLS and narrow public listings.
--
-- Scope:
-- - Remove legacy full-profile reads.
-- - Replace RLS calls to has_role() on affected tables with a private, caller-bound
--   admin helper. The helper has no user-id argument, so callers cannot inspect
--   another user's role.
-- - Remove anonymous access to the listings base table.
-- - Add explicit public-safe listing projections. Seller phone and WhatsApp are
--   intentionally exposed only by public_listing_details for the public contact
--   buttons on an individual active listing page.
--
-- No data is deleted. Storage policies are intentionally unchanged.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Remove any remaining policies in this phase's tables that call the revoked
-- public.has_role() helper. Recreate the intended admin policies below.
DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles',
        'listings',
        'user_roles',
        'dealer_profiles',
        'notifications',
        'dealer_leads'
      )
      AND (
        COALESCE(qual, '') ILIKE '%has_role%'
        OR COALESCE(with_check, '') ILIKE '%has_role%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END
$$;

-- Profiles: remove legacy broad reads and preserve owner/admin access.
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (private.is_admin());

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Dealer profiles: preserve owner policies and repair admin moderation access.
DROP POLICY IF EXISTS "Admins can view all dealer profiles" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Admins can update all dealer profiles" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Admins manage dealer verification" ON public.dealer_profiles;

CREATE POLICY "Admins can view all dealer profiles"
ON public.dealer_profiles
FOR SELECT
TO authenticated
USING (private.is_admin());

CREATE POLICY "Admins can update all dealer profiles"
ON public.dealer_profiles
FOR UPDATE
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- User roles: users may read their own role; only admins may enumerate/manage.
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Notifications: preserve owner policies and repair admin access.
DROP POLICY IF EXISTS "Admins manage all notifications" ON public.notifications;

CREATE POLICY "Admins manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Dealer leads: preserve authenticated lead capture and dealer-owner policies.
DROP POLICY IF EXISTS "Admins manage all dealer leads" ON public.dealer_leads;

CREATE POLICY "Admins manage all dealer leads"
ON public.dealer_leads
FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Listings: owners and admins keep base-table access. Anonymous and ordinary
-- authenticated browsing moves to the public projections below.
DROP POLICY IF EXISTS "Active listings viewable by all" ON public.listings;
DROP POLICY IF EXISTS "Public can read active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active non-deleted listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.listings;

CREATE POLICY "Admins can view all listings"
ON public.listings
FOR SELECT
TO authenticated
USING (private.is_admin());

CREATE POLICY "Admins can update all listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

CREATE POLICY "Admins can delete all listings"
ON public.listings
FOR DELETE
TO authenticated
USING (private.is_admin());

REVOKE SELECT ON public.listings FROM PUBLIC, anon;
GRANT SELECT ON public.listings TO authenticated;

CREATE OR REPLACE VIEW public.public_listings
WITH (security_barrier = true)
AS
SELECT
  id,
  user_id,
  dealer_id,
  title,
  brand,
  model,
  year,
  condition,
  fuel_type,
  bike_type,
  price,
  mileage,
  colour,
  district,
  description,
  images,
  status,
  featured,
  views,
  created_at,
  num_owners,
  accident_history,
  accident_details,
  service_history,
  last_service_date,
  registration_expiry,
  insurance_valid,
  original_parts,
  modifications,
  has_bluebook,
  has_insurance,
  has_tax_clearance,
  has_registration,
  bluebook_name_match,
  shares,
  youtube_url,
  engine_cc,
  transmission
FROM public.listings
WHERE status::text = 'active'
  AND deleted_at IS NULL;

CREATE OR REPLACE VIEW public.public_listing_details
WITH (security_barrier = true)
AS
SELECT
  public_listings.*,
  listings.phone,
  listings.whatsapp
FROM public.public_listings
JOIN public.listings USING (id);

REVOKE ALL ON public.public_listings FROM PUBLIC;
REVOKE ALL ON public.public_listing_details FROM PUBLIC;
GRANT SELECT ON public.public_listings TO anon, authenticated;
GRANT SELECT ON public.public_listing_details TO anon, authenticated;

COMMENT ON VIEW public.public_listings IS
  'Public-safe active listing projection. Excludes seller contact, moderation notes, rejection reasons, counters, and sold metadata.';

COMMENT ON VIEW public.public_listing_details IS
  'Public active listing detail projection. Phone and WhatsApp are intentionally exposed for direct seller contact buttons.';
