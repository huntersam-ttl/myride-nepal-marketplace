# Database Migration Application Guide

**Date:** 22 May 2026  
**Project:** MyRideNepal Marketplace  
**Total Migrations:** 7 files (Phase 2B through 3D)  
**⚠️ CRITICAL:** Apply migrations in the exact order listed below

---

## Prerequisites

- [ ] Database backup created via Supabase Dashboard
- [ ] Logged into Supabase Dashboard
- [ ] SQL Editor open: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/sql

---

## Migration Order & Instructions

### Migration 1 of 7: Phase 2B (Analytics, Share, Report System)

**File:** `supabase/migrations/20260521130000_dealer_phase2b.sql`

**What it creates:**
- Table: `dealer_reports`
- Columns: `dealer_profiles.flag_count`, `dealer_profiles.showroom_photos`
- Indexes: 5 new indexes
- Trigger: `update_dealer_flag_count_trigger`
- RLS Policies: Report creation and admin access

**Steps:**
1. Open Supabase Dashboard SQL Editor
2. Copy the SQL below
3. Paste into SQL Editor
4. Click "Run" (or Cmd+Enter)
5. Wait for success message
6. Verify: Should see "Phase 2B dealer migration completed successfully!"

**SQL to Copy:**

```sql
-- Phase 2B: Dealer Analytics, Share Cards, and Report System
-- Safe migration with IF NOT EXISTS checks

-- 1. Add new columns to dealer_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flag_count') THEN
    ALTER TABLE dealer_profiles ADD COLUMN flag_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'showroom_photos') THEN
    ALTER TABLE dealer_profiles ADD COLUMN showroom_photos TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
END $$;

-- 2. Create dealer_reports table
CREATE TABLE IF NOT EXISTS dealer_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  resolved BOOLEAN DEFAULT false NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dealer_reports_reason_check CHECK (reason IN ('fake_listing', 'wrong_price', 'scam', 'unresponsive', 'other'))
);

-- Create indexes for dealer_reports
CREATE INDEX IF NOT EXISTS idx_dealer_reports_dealer_id ON dealer_reports(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_reason ON dealer_reports(reason);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_resolved ON dealer_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_dealer_reports_created_at ON dealer_reports(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE dealer_reports ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for dealer_reports

-- Anyone can create a report (anonymous or authenticated)
DROP POLICY IF EXISTS "Anyone can create dealer reports" ON dealer_reports;
CREATE POLICY "Anyone can create dealer reports"
  ON dealer_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all reports
DROP POLICY IF EXISTS "Admins can view all dealer reports" ON dealer_reports;
CREATE POLICY "Admins can view all dealer reports"
  ON dealer_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can update reports (to resolve them)
DROP POLICY IF EXISTS "Admins can update dealer reports" ON dealer_reports;
CREATE POLICY "Admins can update dealer reports"
  ON dealer_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. Create function to update flag_count
CREATE OR REPLACE FUNCTION update_dealer_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update flag_count when a new unresolved report is added
  IF TG_OP = 'INSERT' AND NEW.resolved = false THEN
    UPDATE dealer_profiles
    SET flag_count = flag_count + 1
    WHERE id = NEW.dealer_id;
  END IF;
  
  -- Update flag_count when a report is resolved
  IF TG_OP = 'UPDATE' AND OLD.resolved = false AND NEW.resolved = true THEN
    UPDATE dealer_profiles
    SET flag_count = GREATEST(flag_count - 1, 0)
    WHERE id = NEW.dealer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for flag_count updates
DROP TRIGGER IF EXISTS update_dealer_flag_count_trigger ON dealer_reports;
CREATE TRIGGER update_dealer_flag_count_trigger
  AFTER INSERT OR UPDATE ON dealer_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_flag_count();

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flag_count ON dealer_profiles(flag_count) WHERE flag_count > 0;

-- 8. Add comment documentation
COMMENT ON TABLE dealer_reports IS 'Stores reports about dealers for admin review';
COMMENT ON COLUMN dealer_profiles.flag_count IS 'Number of unresolved reports against this dealer';
COMMENT ON COLUMN dealer_profiles.showroom_photos IS 'Array of showroom photo URLs';
COMMENT ON COLUMN dealer_reports.reason IS 'Reason for report: fake_listing, wrong_price, scam, unresponsive, other';
COMMENT ON COLUMN dealer_reports.resolved IS 'Whether the report has been reviewed and resolved by admin';

-- Success message
SELECT 'Phase 2B dealer migration completed successfully!' AS status,
       'New table: dealer_reports' AS tables_created,
       'New columns: flag_count, showroom_photos' AS columns_added,
       'RLS policies and triggers created' AS security;
```

**Verification Query:**
```sql
-- Run this after Migration 1 to verify success
SELECT 
  (SELECT COUNT(*) FROM dealer_reports) as dealer_reports_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flag_count') as flag_count_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'showroom_photos') as showroom_photos_exists;
-- Expected: All should return 0 or 1 (1 = exists)
```

---

### ⏸️ STOP: Before Proceeding to Migration 2

Check Migration 1 results:
- [ ] Success message appeared
- [ ] No error messages
- [ ] Verification query shows all columns exist

If any errors, STOP and troubleshoot before continuing.

---

### Migration 2 of 7: Phase 2C (Reviews & Social)

**File:** `supabase/migrations/20260521140000_dealer_phase2c.sql`

**What it creates:**
- Tables: `dealer_reviews`, `dealer_followers`
- Columns: `dealer_profiles.total_reviews`, `average_rating`, `followers_count`
- Indexes: 8 new indexes
- Triggers: Rating calculation, follower count

**Steps:**
1. In same SQL Editor
2. Clear previous query
3. Copy SQL below
4. Paste and Run
5. Wait for success message

**SQL to Copy:**

```sql
-- Copy entire content from supabase/migrations/20260521140000_dealer_phase2c.sql
-- (File is too long to display here - approximately 200 lines)
-- Open the file in your editor and copy all content
```

**Note:** This file is approximately 7.8KB. Please open `supabase/migrations/20260521140000_dealer_phase2c.sql` in your editor and copy the entire contents.

**Verification Query:**
```sql
-- Run after Migration 2
SELECT 
  (SELECT COUNT(*) FROM dealer_reviews) as dealer_reviews_exists,
  (SELECT COUNT(*) FROM dealer_followers) as dealer_followers_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'total_reviews') as total_reviews_exists;
```

---

### Migration 3 of 7: Phase 3A (Team Management & Notifications)

**File:** `supabase/migrations/20260521160000_dealer_phase3a.sql`  
**Size:** 9.1KB

Open `supabase/migrations/20260521160000_dealer_phase3a.sql` and copy all content.

**What it creates:**
- Tables: `dealer_staff`, `notifications`
- Columns: `dealer_profiles.owner_id`, `team_size`
- RLS policies for staff access

**Verification Query:**
```sql
SELECT 
  (SELECT COUNT(*) FROM dealer_staff) as staff_table_exists,
  (SELECT COUNT(*) FROM notifications) as notifications_exists;
```

---

### Migration 4 of 7: Phase 3B (Notification System Updates)

**File:** `supabase/migrations/20260522100000_dealer_phase3b.sql`  
**Size:** 8.4KB

Open `supabase/migrations/20260522100000_dealer_phase3b.sql` and copy all content.

**What it updates:**
- Table: `notifications` (adds type, related_type, related_id, action_url)
- Table: `dealer_leads` (adds notes, follow_up_date, priority)

**Verification Query:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('type', 'related_type', 'related_id', 'action_url');
```

---

### Migration 5 of 7: Phase 3B (Notification Preferences)

**File:** `supabase/migrations/20260522110000_dealer_notification_prefs.sql`  
**Size:** 2.1KB

Open `supabase/migrations/20260522110000_dealer_notification_prefs.sql` and copy all content.

**What it creates:**
- Table: `dealer_notification_preferences`
- Default preferences per dealer

**Verification Query:**
```sql
SELECT COUNT(*) FROM dealer_notification_preferences;
```

---

### Migration 6 of 7: Phase 3C (Bulk Tools & Tracking)

**File:** `supabase/migrations/20260522120000_dealer_phase3c_bulk_tools.sql`  
**Size:** 3.4KB

Open `supabase/migrations/20260522120000_dealer_phase3c_bulk_tools.sql` and copy all content.

**What it adds:**
- Columns: `listings.youtube_url`, `views_count`, `leads_count`
- Functions: `update_listing_views()`, `update_listing_leads()`

**Verification Query:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name IN ('youtube_url', 'views_count', 'leads_count');
```

---

### Migration 7 of 7: Phase 3D (Onboarding Progress)

**File:** `supabase/migrations/20260522130000_dealer_phase3d_onboarding.sql`  
**Size:** 4.4KB

Open `supabase/migrations/20260522130000_dealer_phase3d_onboarding.sql` and copy all content.

**What it adds:**
- Columns: `dealer_profiles.onboarding_completed`, `onboarding_progress`

**Verification Query:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
AND column_name IN ('onboarding_completed', 'onboarding_progress');
```

---

## Final Verification (After All 7 Migrations)

Run this comprehensive check:

```sql
-- Check all dealer tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'dealer_%'
ORDER BY table_name;

-- Expected tables:
-- dealer_analytics_events
-- dealer_followers
-- dealer_leads
-- dealer_notification_preferences
-- dealer_profiles
-- dealer_reports
-- dealer_reviews
-- dealer_staff

-- Check notifications table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- Check new listing columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
  AND column_name IN ('deleted_at', 'sold_at', 'youtube_url', 'views_count', 'leads_count', 'dealer_id')
ORDER BY column_name;

-- Check new dealer_profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('flag_count', 'showroom_photos', 'total_reviews', 'average_rating', 
                      'followers_count', 'owner_id', 'team_size', 'onboarding_completed', 
                      'onboarding_progress')
ORDER BY column_name;

-- Count check
SELECT 
  'All migrations completed successfully!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'dealer_%') as dealer_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'listings' AND column_name IN ('youtube_url', 'views_count', 'leads_count')) as listing_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name IN ('flag_count', 'onboarding_completed')) as profile_columns;
```

**Expected Results:**
- 8 dealer tables
- 6 listing columns (including dealer_id if exists)
- 9 new dealer_profiles columns

---

## Next Steps After Migrations

1. **Regenerate TypeScript Types**
   ```bash
   npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
   ```

2. **Rebuild Project**
   ```bash
   rm -rf dist/
   npm run build
   ```

3. **Verify Build Passes**
   - Should complete in ~9 seconds
   - 0 TypeScript errors

4. **Proceed with Commits**
   - Follow DEPLOYMENT_PLAN.md Step 4

---

## Troubleshooting

**If a migration fails:**

1. **Read error message carefully**
2. **Common issues:**
   - Table already exists (safe to ignore if using IF NOT EXISTS)
   - Column already exists (safe to ignore if checking first)
   - Foreign key constraint failed (check referenced table exists)
   - RLS policy name conflict (DROP POLICY IF EXISTS should handle)

3. **If error is critical:**
   - Note which migration failed
   - Check Supabase Dashboard → Database → Tables to see what was created
   - May need to restore from backup
   - Contact support or review migration file

4. **Safe to retry:**
   - All migrations use IF NOT EXISTS
   - Can safely re-run if no errors occurred
   - If partial completion, re-run will complete remaining items

---

## Rollback Plan

**If you need to undo migrations:**

**Option 1: Restore from Backup (Safest)**
1. Go to Supabase Dashboard → Database → Backups
2. Find backup from before migration
3. Click "Restore"
4. Wait 5-10 minutes

**Option 2: Manual Cleanup (Advanced)**
```sql
-- Only if you know what you're doing
-- Drop tables in reverse order
DROP TABLE IF EXISTS dealer_notification_preferences CASCADE;
DROP TABLE IF EXISTS dealer_staff CASCADE;
DROP TABLE IF EXISTS dealer_followers CASCADE;
DROP TABLE IF EXISTS dealer_reviews CASCADE;
DROP TABLE IF EXISTS dealer_reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop added columns
ALTER TABLE dealer_profiles DROP COLUMN IF EXISTS onboarding_progress;
ALTER TABLE dealer_profiles DROP COLUMN IF EXISTS onboarding_completed;
-- ... etc (see migration files for full list)
```

---

## Migration Checklist

- [ ] Database backup created
- [ ] Migration 1 (Phase 2B) applied successfully
- [ ] Migration 2 (Phase 2C) applied successfully
- [ ] Migration 3 (Phase 3A) applied successfully
- [ ] Migration 4 (Phase 3B updates) applied successfully
- [ ] Migration 5 (Phase 3B prefs) applied successfully
- [ ] Migration 6 (Phase 3C) applied successfully
- [ ] Migration 7 (Phase 3D) applied successfully
- [ ] Final verification query passed
- [ ] All expected tables exist
- [ ] All expected columns exist
- [ ] TypeScript types regenerated
- [ ] Project rebuilt successfully

---

**Status:** Ready to apply migrations manually  
**Estimated Time:** 15-30 minutes total  
**Last Updated:** 22 May 2026

⚠️ **IMPORTANT:** Apply migrations ONE AT A TIME in the exact order listed. Verify success before proceeding to next migration.
