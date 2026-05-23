-- Security Sprint S3B replacement
-- Critical + high-risk Supabase RLS hardening, excluding storage.objects changes
--
-- IMPORTANT:
-- - This replacement migration is intended to supersede the failed non-applied
--   migration `20260523023000_security_sprint_s3b_rls_security_hardening.sql`
--   for production rollout.
-- - No tables are dropped.
-- - No data is deleted.
-- - Existing rows are preserved.
-- - storage.objects policy changes are intentionally deferred because the
--   migration execution role does not own storage.objects and previously failed
--   with: ERROR: 42501: must be owner of relation objects
--
-- Frontend follow-up is required before applying this safely in production:
-- - Public routes that still read public.profiles directly should switch to
--   public.public_profile_badges.
-- - Public routes that still read public.dealer_profiles directly should switch to
--   public.public_dealer_profiles.
-- - Client-side notification inserts should move to trusted triggers/server logic.
-- - Public dealer lead creation will require an authenticated or trusted server flow.

-- =====================================================
-- 1. PROFILES: remove public full-row access
-- =====================================================
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.public_profile_badges AS
SELECT
  id,
  name,
  avatar_url,
  verification_level
FROM public.profiles;

REVOKE ALL ON public.public_profile_badges FROM PUBLIC;
GRANT SELECT ON public.public_profile_badges TO anon, authenticated;

COMMENT ON VIEW public.public_profile_badges IS
  'Public-safe seller profile fields only. Excludes email, phone, document URLs, verification timestamps, and admin metadata.';

-- =====================================================
-- 2. DEALER PROFILES: remove public full-row access
-- =====================================================
DROP POLICY IF EXISTS "Dealer profiles viewable by all" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Dealers manage own profile" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Admins manage dealer verification" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Dealer owners can view own full profile" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Dealer owners can insert own profile" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Dealer owners can update own profile" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Admins can view all dealer profiles" ON public.dealer_profiles;
DROP POLICY IF EXISTS "Admins can update all dealer profiles" ON public.dealer_profiles;

CREATE POLICY "Dealer owners can view own full profile"
ON public.dealer_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Dealer owners can insert own profile"
ON public.dealer_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dealer owners can update own profile"
ON public.dealer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all dealer profiles"
ON public.dealer_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all dealer profiles"
ON public.dealer_profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.public_dealer_profiles AS
SELECT
  id,
  slug,
  business_name,
  description,
  district,
  location,
  brands,
  logo_url,
  banner_url,
  verified,
  active_listings_count,
  years_in_business,
  opening_hours,
  showroom_photos,
  facebook_url,
  instagram_url,
  youtube_url,
  tiktok_url,
  exchange_accepted,
  financing_available,
  service_centre,
  average_rating,
  total_reviews,
  followers_count
FROM public.dealer_profiles
WHERE COALESCE(flagged, false) = false;

REVOKE ALL ON public.public_dealer_profiles FROM PUBLIC;
GRANT SELECT ON public.public_dealer_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_dealer_profiles IS
  'Public-safe dealer display fields only. Excludes private contact/address fields, moderation flags, verification notes, owner metadata, and internal/admin fields.';

-- =====================================================
-- 3. USER ROLES: stop public role enumeration
-- =====================================================
DROP POLICY IF EXISTS "Roles viewable by all" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 4. NOTIFICATIONS: remove arbitrary client inserts
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert self notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage all notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.notifications IS
  'Client-side arbitrary notification inserts are disabled by policy. Notification creation should come from trusted triggers, server functions, or admin-only actions.';

-- =====================================================
-- 5. LISTINGS: replace legacy public-read policy safely
-- =====================================================
DROP POLICY IF EXISTS "Active listings viewable by all" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active non-deleted listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;

DO $$
DECLARE
  public_status TEXT := 'active';
  policy_using TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typnamespace = 'public'::regnamespace
      AND t.typname = 'listing_status'
      AND e.enumlabel = 'approved'
  ) THEN
    public_status := 'approved';
  END IF;

  policy_using := format('(status::text = %L)', public_status);

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'deleted_at'
  ) THEN
    policy_using := policy_using || ' AND deleted_at IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'is_active'
  ) THEN
    policy_using := policy_using || ' AND is_active = true';
  END IF;

  EXECUTE format(
    'CREATE POLICY "Public can view approved listings" ON public.listings FOR SELECT TO public USING (%s);',
    policy_using
  );
END $$;

COMMENT ON TABLE public.listings IS
  'Public read policy is restricted to the approved/active non-deleted listing state only. The policy uses approved when the enum/value exists, otherwise active for backward compatibility.';

-- =====================================================
-- 6. STORAGE POLICIES: deferred intentionally
-- =====================================================
-- NOTE:
-- storage.objects / blog-images policy hardening is intentionally NOT included
-- in this replacement migration. The prior attempt failed because the migration
-- role does not own storage.objects:
--   ERROR: 42501: must be owner of relation objects
-- Apply storage bucket policy changes separately through a role/context that
-- owns storage.objects, such as the appropriate Supabase dashboard or owner
-- execution path.

-- =====================================================
-- 7. DEALER LEADS: disable anonymous spam path
-- =====================================================
DROP POLICY IF EXISTS "Dealers can view their own leads" ON public.dealer_leads;
DROP POLICY IF EXISTS "Dealers can update their own leads" ON public.dealer_leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.dealer_leads;
DROP POLICY IF EXISTS "Authenticated users can create basic dealer leads" ON public.dealer_leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.dealer_leads;
DROP POLICY IF EXISTS "Admins manage all dealer leads" ON public.dealer_leads;

CREATE POLICY "Dealers can view their own leads"
ON public.dealer_leads
FOR SELECT
TO authenticated
USING (
  dealer_id IN (
    SELECT dp.id
    FROM public.dealer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
);

CREATE POLICY "Dealers can update their own leads"
ON public.dealer_leads
FOR UPDATE
TO authenticated
USING (
  dealer_id IN (
    SELECT dp.id
    FROM public.dealer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
)
WITH CHECK (
  dealer_id IN (
    SELECT dp.id
    FROM public.dealer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create basic dealer leads"
ON public.dealer_leads
FOR INSERT
TO authenticated
WITH CHECK (
  dealer_id IS NOT NULL
  AND stage = 'new'
  AND buyer_name IS NULL
  AND buyer_contact IS NULL
  AND notes IS NULL
  AND source IN ('direct', 'profile_contact', 'listing_contact')
  AND (COALESCE(whatsapp_click, false) OR COALESCE(phone_click, false))
);

CREATE POLICY "Admins manage all dealer leads"
ON public.dealer_leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.dealer_leads IS
  'Anonymous/public lead creation is disabled in this hardening step to close the spam path. If anonymous lead capture is required later, route it through a rate-limited trusted endpoint or Edge Function.';
