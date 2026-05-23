-- Hotfix: clean up conflicting listings RLS after S3B hardening
--
-- Purpose:
-- - Remove legacy conflicting listings policies that still reference has_role()
--   on public paths.
-- - Recreate a minimal, explicit listings policy set that preserves:
--   * public read of active non-deleted listings
--   * owner read/update/delete of own listings
--   * authenticated insert of own listings
--   * admin read/update/delete via user_roles lookup
--
-- Safety:
-- - No tables are dropped.
-- - No data is deleted.
-- - No storage.objects policies are touched.

-- Remove legacy/duplicate listings policies.
DROP POLICY IF EXISTS "Active listings viewable by all" ON public.listings;
DROP POLICY IF EXISTS "Public can read active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active non-deleted listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view own listings including deleted" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users create listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
DROP POLICY IF EXISTS "listings_select_policy" ON public.listings;
DROP POLICY IF EXISTS "listings_update_policy" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_policy" ON public.listings;

-- Public read policy with no admin-role function calls.
DO $$
DECLARE
  status_clause TEXT := '(status::text = ''active'')';
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
    status_clause := '(status::text IN (''active'', ''approved''))';
  END IF;

  policy_using := status_clause;

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

-- Owner policies.
CREATE POLICY "Users can view own listings including deleted"
ON public.listings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
ON public.listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert listings"
ON public.listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin policies using direct user_roles lookup instead of has_role().
CREATE POLICY "Admins can view all listings"
ON public.listings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update all listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete all listings"
ON public.listings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);
