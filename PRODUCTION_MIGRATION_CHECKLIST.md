# Production Migration Checklist

**Date:** 22 May 2026  
**Purpose:** Safe step-by-step guide to apply all pending MyRideNepal migrations to production database

⚠️ **CRITICAL:** Read this entire document before applying any migrations.

---

## Migration Status Overview

### ✅ Already Applied (Base Schema - May 15-16)
These migrations were applied during initial development:
- `20260508150224_*` — Initial schema (profiles, listings, saved_listings)
- `20260513000000_*` — Rejection reason
- `20260515000000_*` → `20260516000000_*` — Core features (offers, notifications, verification, reviews, reports, documents)

### ⚠️ Partially Applied (May 21-22 Dealer Features)
These migrations were applied via SQL query but not tracked by Supabase:
- ✅ `20260521130000_dealer_phase2b.sql` — dealer_reports table, flag_count column
- ✅ `20260522120000_dealer_phase3c_bulk_tools.sql` — listings soft delete columns
- ✅ `20260522130000_dealer_phase3d_onboarding.sql` — onboarding columns

### ❌ NOT Applied (Critical Pending)
These migrations **MUST** be applied before launch:
- ❌ `20260521000000_extend_dealer_profiles_phase1.sql` — Dealer profile extensions
- ❌ `20260521000001_extend_dealer_profiles_phase1_safe.sql` — Safe dealer profile extensions
- ❌ `20260521120000_dealer_phase2a.sql` — dealer_leads, dealer_analytics_events tables
- ❌ `20260521140000_dealer_phase2c.sql` — dealer_reviews, dealer_followers tables  
- ❌ `20260521160000_dealer_phase3a.sql` — dealer_staff table
- ❌ `20260522100000_dealer_phase3b.sql` — Dealer analytics enhancements
- ❌ `20260522110000_dealer_notification_prefs.sql` — dealer_notification_preferences table

---

## Pre-Migration Safety Checklist

Before applying ANY migrations:

- [ ] **Backup database** — Go to Supabase Dashboard → Database → Backups → Create backup
- [ ] **Test locally** — If using local Supabase, test migrations there first
- [ ] **Read all SQL** — Review each migration file below to understand changes
- [ ] **Off-peak time** — Apply during low traffic (e.g., 2-4 AM Nepal time)
- [ ] **Team notification** — Alert team migrations are being applied
- [ ] **Maintenance mode** — Consider showing maintenance message to users

---

## Migration Order (MUST follow this order)

### Phase 1: Dealer Profile Foundation

#### Migration 1a: `20260521000000_extend_dealer_profiles_phase1.sql`

**What it does:**
- Adds 15+ columns to dealer_profiles: phone, whatsapp, website, district, location, brands, service_area, opening_hours, facebook_url, instagram_url, tiktok_url, youtube_url, google_maps_url, profile_completion_percentage, active_listings_count, verified

**Apply:**
```bash
# Method 1: Via Supabase Dashboard SQL Editor
# 1. Go to: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/sql
# 2. Paste contents of supabase/migrations/20260521000000_extend_dealer_profiles_phase1.sql
# 3. Click "Run"

# Method 2: Via CLI
npx supabase db query --linked -f supabase/migrations/20260521000000_extend_dealer_profiles_phase1.sql
```

**Verification:**
```sql
-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('phone', 'whatsapp', 'district', 'opening_hours')
ORDER BY column_name;

-- Should return 4 rows
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS, can run multiple times

---

#### Migration 1b: `20260521000001_extend_dealer_profiles_phase1_safe.sql`

**What it does:**
- Safe version with additional checks
- Adds same columns as 1a but with more defensive SQL

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260521000001_extend_dealer_profiles_phase1_safe.sql
```

**Verification:**
```sql
-- Verify all 15+ columns exist
SELECT COUNT(*) as dealer_profile_columns
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles';

-- Should return count >= 30 (base + extensions)
```

**Safety:** ✅ Safe - Idempotent, can run after 1a

---

### Phase 2A: Dealer Dashboard Core

#### Migration 2: `20260521120000_dealer_phase2a.sql`

**What it does:**
- Creates `dealer_leads` table (for tracking buyer contacts)
- Creates `dealer_analytics_events` table (for tracking profile/listing views)
- Adds youtube_url, views_count, leads_count to listings table
- Creates indexes for performance

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260521120000_dealer_phase2a.sql
```

**Verification:**
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('dealer_leads', 'dealer_analytics_events')
ORDER BY table_name;

-- Should return 2 rows

-- Check listings columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'listings' 
  AND column_name IN ('youtube_url', 'views_count', 'leads_count')
ORDER BY column_name;

-- Should return 3 rows
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS

---

### Phase 2C: Reviews & Social

#### Migration 3: `20260521140000_dealer_phase2c.sql`

**What it does:**
- Creates `dealer_reviews` table (buyer reviews of dealers)
- Creates `dealer_followers` table (users following dealers)
- Adds average_rating, total_reviews to dealer_profiles
- Creates RLS policies for reviews/followers

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260521140000_dealer_phase2c.sql
```

**Verification:**
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('dealer_reviews', 'dealer_followers')
ORDER BY table_name;

-- Should return 2 rows

-- Check dealer_profiles columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('average_rating', 'total_reviews')
ORDER BY column_name;

-- Should return 2 rows
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS, DROP POLICY IF EXISTS

---

### Phase 3A: Team Management

#### Migration 4: `20260521160000_dealer_phase3a.sql`

**What it does:**
- Creates `dealer_staff` table (for multi-user dealer accounts)
- Adds role (owner/manager/sales), permissions tracking
- Creates RLS policies for staff management

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260521160000_dealer_phase3a.sql
```

**Verification:**
```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'dealer_staff';

-- Should return 1 row

-- Check structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dealer_staff'
ORDER BY ordinal_position;

-- Should show: id, dealer_id, user_id, role, permissions, invited_by, etc.
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS

---

### Phase 3B: Analytics Enhancements

#### Migration 5: `20260522100000_dealer_phase3b.sql`

**What it does:**
- Enhances dealer_analytics_events with more event types
- Adds engagement tracking columns
- Creates indexes for analytics queries

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260522100000_dealer_phase3b.sql
```

**Verification:**
```sql
-- Check analytics table structure
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dealer_analytics_events'
ORDER BY column_name;

-- Verify event_type enum has all values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'dealer_event_type'
)
ORDER BY enumlabel;
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS

---

### Phase 3B: Notification Preferences

#### Migration 6: `20260522110000_dealer_notification_prefs.sql`

**What it does:**
- Creates `dealer_notification_preferences` table
- Allows dealers to control email/push notification settings
- Creates RLS policies

**Apply:**
```bash
npx supabase db query --linked -f supabase/migrations/20260522110000_dealer_notification_prefs.sql
```

**Verification:**
```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'dealer_notification_preferences';

-- Should return 1 row

-- Check structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dealer_notification_preferences'
ORDER BY ordinal_position;
```

**Safety:** ✅ Safe - Uses IF NOT EXISTS

---

## Already Applied Migrations (Confirmation Only)

These were applied earlier via direct SQL query. Verify they exist:

### Phase 2B: Reports (ALREADY APPLIED ✅)

```sql
-- Verify dealer_reports table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'dealer_reports';

-- Verify flag_count and showroom_photos columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('flag_count', 'showroom_photos');
```

### Phase 3C: Bulk Tools (ALREADY APPLIED ✅)

```sql
-- Verify listings has soft delete columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'listings' 
  AND column_name IN ('deleted_at', 'sold_at', 'dealer_id');
```

### Phase 3D: Onboarding (ALREADY APPLIED ✅)

```sql
-- Verify onboarding columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('onboarding_stage', 'beta_started_at', 'beta_ends_at', 'verification_requested_at');
```

---

## Post-Migration Checklist

After applying ALL migrations:

- [ ] **Verify all tables exist:**
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name LIKE 'dealer%'
  ORDER BY table_name;
  
  -- Should return:
  -- dealer_analytics_events
  -- dealer_followers
  -- dealer_leads
  -- dealer_notification_preferences
  -- dealer_profiles
  -- dealer_reports
  -- dealer_reviews
  -- dealer_staff
  ```

- [ ] **Regenerate TypeScript types:**
  ```bash
  npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
  ```

- [ ] **Build frontend:**
  ```bash
  npm run build
  ```

- [ ] **Test critical flows:**
  - Dealer signup
  - Dealer profile view
  - Dealer dashboard load
  - Create listing
  - View analytics
  - Share listing
  - Report dealer

- [ ] **Check RLS policies:**
  ```sql
  SELECT schemaname, tablename, policyname 
  FROM pg_policies 
  WHERE tablename LIKE 'dealer%'
  ORDER BY tablename, policyname;
  ```

- [ ] **Monitor errors:**
  - Check Supabase logs for SQL errors
  - Check frontend console for API errors
  - Check Sentry/error tracking if configured

---

## Rollback Plan

If something goes wrong:

1. **Restore from backup:**
   - Go to Supabase Dashboard → Database → Backups
   - Select pre-migration backup
   - Click "Restore"

2. **Manual rollback (if needed):**
   ```sql
   -- Drop tables in reverse order
   DROP TABLE IF EXISTS dealer_notification_preferences CASCADE;
   DROP TABLE IF EXISTS dealer_staff CASCADE;
   DROP TABLE IF EXISTS dealer_followers CASCADE;
   DROP TABLE IF EXISTS dealer_reviews CASCADE;
   DROP TABLE IF EXISTS dealer_analytics_events CASCADE;
   DROP TABLE IF EXISTS dealer_leads CASCADE;
   DROP TABLE IF EXISTS dealer_reports CASCADE;
   
   -- Remove columns from dealer_profiles
   ALTER TABLE dealer_profiles 
     DROP COLUMN IF EXISTS onboarding_stage,
     DROP COLUMN IF EXISTS beta_started_at,
     DROP COLUMN IF EXISTS beta_ends_at,
     DROP COLUMN IF EXISTS verification_requested_at,
     DROP COLUMN IF EXISTS flag_count,
     DROP COLUMN IF EXISTS showroom_photos,
     DROP COLUMN IF EXISTS phone,
     DROP COLUMN IF EXISTS whatsapp,
     DROP COLUMN IF EXISTS district,
     DROP COLUMN IF EXISTS opening_hours;
   
   -- Remove columns from listings
   ALTER TABLE listings 
     DROP COLUMN IF EXISTS deleted_at,
     DROP COLUMN IF EXISTS sold_at,
     DROP COLUMN IF EXISTS dealer_id,
     DROP COLUMN IF EXISTS youtube_url;
   ```

3. **Redeploy previous version:**
   - Revert code to last known good commit
   - Deploy via Vercel

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Migration is idempotent. Safe to continue.

### Error: "column already exists"
**Solution:** Migration is idempotent. Safe to continue.

### Error: "permission denied"
**Solution:** Ensure you're logged in as project owner/admin.

### Error: "foreign key constraint"
**Solution:** Apply migrations in order. Some tables depend on others.

### Error: "enum value already exists"
**Solution:** Migration handles this. Safe to continue.

---

## Timeline Estimate

- **Backup:** 2 minutes
- **Apply migrations 1-6:** 5-10 minutes
- **Verification:** 5 minutes
- **Type regeneration:** 2 minutes
- **Build & deploy:** 5 minutes
- **Testing:** 15-20 minutes

**Total:** ~30-45 minutes

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Review error messages carefully
3. Consult this guide's Troubleshooting section
4. Restore from backup if needed

---

**Last Updated:** 22 May 2026  
**Migration Guide Version:** 1.0  
**Project:** MyRideNepal Production Deployment
