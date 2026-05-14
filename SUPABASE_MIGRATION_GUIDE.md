# 🔧 Supabase Migration Guide

## ✅ Supabase Connection Status
- **Project ID**: `nukeyvnsvsgwyvbtertf`
- **URL**: `https://nukeyvnsvsgwyvbtertf.supabase.co`
- **Connection**: ✅ Active (profiles, user_roles accessible)

## ⚠️ Issues Found

### 1. **RLS Policy Error** - `permission denied for function has_role`

The `has_role` function needs proper permissions for RLS policies to work correctly.

### 2. **Missing `rejection_reason` Column**

The new `rejection_reason` column needs to be added to the `listings` table.

---

## 🔨 **FIX: Apply This SQL**

Please run this SQL in your Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/editor
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the following SQL:

```sql
-- ================================================================
-- MyRideNepal - Production Fix Migration
-- ================================================================

-- 1. Add rejection_reason column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON COLUMN public.listings.rejection_reason IS 
'Reason provided by admin when rejecting a listing';

-- 2. Grant execute permissions on has_role function
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO anon, authenticated;

-- 3. Grant execute permissions on handle_new_user function  
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- 4. Verify the listings RLS policy
-- This ensures the policy can use the has_role function
DO $$ 
BEGIN
  -- Drop and recreate the policy with proper permissions
  DROP POLICY IF EXISTS "Active listings viewable by all" ON public.listings;
  
  CREATE POLICY "Active listings viewable by all" 
  ON public.listings FOR SELECT 
  USING (
    status = 'active' 
    OR auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );
END $$;

-- 5. Verify user_roles RLS policy
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
  
  CREATE POLICY "Admins manage roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
END $$;

-- 6. Verify other policies that use has_role
DO $$ 
BEGIN
  -- Users update own listings or admin can update
  DROP POLICY IF EXISTS "Users update own listings" ON public.listings;
  
  CREATE POLICY "Users update own listings" 
  ON public.listings FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );
  
  -- Users delete own listings or admin can delete
  DROP POLICY IF EXISTS "Users delete own listings" ON public.listings;
  
  CREATE POLICY "Users delete own listings" 
  ON public.listings FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin')
  );
END $$;

-- 7. Verify blog_posts policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Published posts viewable by all" ON public.blog_posts;
  DROP POLICY IF EXISTS "Admins manage blog" ON public.blog_posts;
  
  CREATE POLICY "Published posts viewable by all" 
  ON public.blog_posts FOR SELECT 
  USING (
    published = true 
    OR public.has_role(auth.uid(), 'admin')
  );
  
  CREATE POLICY "Admins manage blog" 
  ON public.blog_posts FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
END $$;

-- 8. Verify price_estimates policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins manage price estimates" ON public.price_estimates;
  
  CREATE POLICY "Admins manage price estimates" 
  ON public.price_estimates FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'All RLS policies updated with proper permissions';
  RAISE NOTICE 'rejection_reason column added to listings table';
END $$;
```

5. Click **"Run"** button at the bottom

---

## ✅ What This Migration Does

1. ✅ **Adds `rejection_reason` column** - Allows admins to provide feedback when rejecting listings
2. ✅ **Fixes function permissions** - Grants execute permissions to anon/authenticated roles
3. ✅ **Recreates all RLS policies** - Ensures policies work correctly with the has_role function
4. ✅ **Maintains security** - All existing security rules remain intact

---

## 🧪 After Running the Migration

Test the connection again:

```bash
cd /Users/cc/myridenepal/myride-nepal-marketplace
npm run dev
```

Then visit: http://localhost:8080/

---

## 🔐 What's Already Working

- ✅ Profiles table accessible
- ✅ User roles table accessible  
- ✅ Saved listings table accessible
- ✅ Dealer profiles table accessible
- ✅ Authentication configured
- ✅ Environment variables set

---

## 📝 Notes

- This migration is **idempotent** (safe to run multiple times)
- All changes are **backward compatible**
- No existing data will be lost
- The migration recreates policies to ensure proper permissions

---

## 🆘 If You Need Help

If the migration doesn't work:

1. Check the Supabase logs in the dashboard
2. Verify you have the necessary database permissions (project owner/admin)
3. Try running each DO block separately if there are errors

---

**Once completed, your MyRideNepal app will be fully production-ready! 🚀**
