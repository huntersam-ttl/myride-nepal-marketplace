# Admin Data Cleanup Guide

**Purpose:** Safely clean test data before soft launch  
**Date:** 22 May 2026  
**Status:** Ready to use  
**Risk Level:** MEDIUM — Always backup before cleanup

---

## ⚠️ CRITICAL: Backup First

**Before any cleanup, create a database backup:**

1. Go to: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/database/backups
2. Click "Create backup"
3. Name it: "Pre-Cleanup-$(date +%Y%m%d)"
4. Wait for completion
5. Download backup for extra safety

**Alternative CLI backup:**
```bash
npx supabase db dump --linked > backup-pre-cleanup-$(date +%Y%m%d-%H%M%S).sql
```

---

## Test Data Identification

### How to Identify Test Listings

Test listings typically have:
- ❌ Titles like "Test Bike", "Test Listing", "Dummy", "Sample", "Delete This"
- ❌ Unrealistic prices: NPR 1, NPR 9999999, NPR 123
- ❌ Fake districts: "Test District", non-Nepal locations
- ❌ Placeholder brands: "Test Brand", "Unknown"
- ❌ No images or placeholder images
- ❌ Created by known test accounts
- ❌ Description containing "test", "dummy", "delete", "fake"

### How to Identify Test Dealers

Test dealers typically have:
- ❌ Business names: "Test Dealer", "Demo Shop", "Delete Me"
- ❌ Fake phone numbers: 9800000000, 1234567890
- ❌ No actual location or fake addresses
- ❌ Created during development/testing periods

### How to Identify Test Users

Test users typically have:
- ❌ Email patterns: test@, demo@, fake@, temp@
- ❌ No real activity (no listings, no leads, no saved items)
- ❌ Created during known testing periods

---

## Safe Cleanup Strategy

### ✅ Recommended: Soft Delete (Safest)

**Soft delete** marks records as deleted without removing them from database.  
Can be reversed if needed.

**For Listings:**
```sql
-- Mark test listings as deleted (soft delete)
UPDATE listings 
SET 
  deleted_at = NOW(),
  status = 'deleted'
WHERE 
  title ILIKE '%test%' 
  OR title ILIKE '%dummy%'
  OR title ILIKE '%sample%'
  OR title ILIKE '%delete%'
  OR title ILIKE '%fake%'
  OR price < 10000  -- Unrealistically low
  OR price > 5000000  -- Unrealistically high
  OR description ILIKE '%test%'
  OR description ILIKE '%dummy%';

-- Verify before committing
SELECT id, title, price, brand, district, created_at, deleted_at
FROM listings
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 20;
```

**For Dealers:**
```sql
-- Mark test dealers as suspended (soft delete)
UPDATE dealer_profiles
SET 
  suspended = true,
  moderation_note = 'Test account - suspended during cleanup'
WHERE 
  business_name ILIKE '%test%'
  OR business_name ILIKE '%demo%'
  OR business_name ILIKE '%fake%'
  OR phone LIKE '9800000000'
  OR phone LIKE '1234567890';

-- Verify
SELECT id, business_name, phone, suspended, moderation_note
FROM dealer_profiles
WHERE suspended = true
ORDER BY updated_at DESC;
```

### ⚠️ Use with Caution: Mark as Draft

Alternative to deletion - makes listings invisible but preserves data:

```sql
-- Mark test listings as draft instead of deleting
UPDATE listings
SET status = 'draft'
WHERE 
  title ILIKE '%test%'
  OR title ILIKE '%dummy%';

-- Verify
SELECT id, title, status, created_at
FROM listings
WHERE status = 'draft'
ORDER BY updated_at DESC
LIMIT 20;
```

### 🚫 Not Recommended: Hard Delete

**Only use hard delete if absolutely necessary.**  
Cannot be reversed. Violates foreign key constraints.

```sql
-- ⚠️ DANGER: Hard delete (not recommended)
-- DELETE FROM listings WHERE title ILIKE '%test%';

-- Instead, use soft delete above
```

---

## Cleanup Workflows by Data Type

### 1. Clean Test Listings

**Step 1: Identify test listings**
```sql
-- Find potential test listings
SELECT 
  id,
  title,
  brand,
  price,
  district,
  status,
  created_at,
  CASE 
    WHEN title ILIKE '%test%' THEN 'Test in title'
    WHEN price < 10000 THEN 'Unrealistic price'
    WHEN description ILIKE '%test%' THEN 'Test in description'
    ELSE 'Other'
  END AS reason
FROM listings
WHERE 
  title ILIKE '%test%'
  OR title ILIKE '%dummy%'
  OR title ILIKE '%sample%'
  OR price < 10000
  OR price > 5000000
ORDER BY created_at DESC;
```

**Step 2: Review the list**  
Manually verify each listing is actually a test listing.

**Step 3: Soft delete confirmed test listings**
```sql
-- Option A: Soft delete by IDs (safest)
UPDATE listings
SET 
  deleted_at = NOW(),
  status = 'deleted'
WHERE id IN (
  'listing-id-1',
  'listing-id-2',
  'listing-id-3'
  -- Add specific IDs from Step 1
);

-- Option B: Soft delete by pattern (more risky)
UPDATE listings
SET 
  deleted_at = NOW(),
  status = 'deleted'
WHERE 
  title ILIKE '%test bike%'
  OR title ILIKE '%test listing%';
```

**Step 4: Verify deletion**
```sql
-- Check recently soft-deleted listings
SELECT id, title, status, deleted_at
FROM listings
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC
LIMIT 20;

-- Check active listings remain
SELECT COUNT(*) AS active_count
FROM listings
WHERE status = 'active' AND deleted_at IS NULL;
```

---

### 2. Clean Test Dealers

**Step 1: Identify test dealers**
```sql
-- Find potential test dealers
SELECT 
  id,
  business_name,
  phone,
  whatsapp,
  district,
  suspended,
  created_at
FROM dealer_profiles
WHERE 
  business_name ILIKE '%test%'
  OR business_name ILIKE '%demo%'
  OR business_name ILIKE '%fake%'
  OR phone LIKE '9800000000'
ORDER BY created_at DESC;
```

**Step 2: Review and soft delete**
```sql
-- Suspend test dealers
UPDATE dealer_profiles
SET 
  suspended = true,
  moderation_note = 'Test account - suspended during pre-launch cleanup'
WHERE id IN (
  'dealer-id-1',
  'dealer-id-2'
  -- Add specific IDs
);

-- Verify
SELECT business_name, suspended, moderation_note
FROM dealer_profiles
WHERE suspended = true;
```

**Step 3: Also soft delete their listings**
```sql
-- Soft delete listings from suspended dealers
UPDATE listings
SET 
  deleted_at = NOW(),
  status = 'deleted'
WHERE dealer_id IN (
  SELECT id FROM dealer_profiles WHERE suspended = true
);
```

---

### 3. Clean Test Reviews

**Identify and remove test reviews:**
```sql
-- Find test reviews
SELECT 
  id,
  rating,
  review_text,
  dealer_id,
  created_at
FROM dealer_reviews
WHERE 
  review_text ILIKE '%test%'
  OR review_text ILIKE '%dummy%';

-- Mark as admin-removed (soft delete for reviews)
UPDATE dealer_reviews
SET admin_removed = true
WHERE 
  review_text ILIKE '%test%'
  OR review_text ILIKE '%dummy%';

-- Verify
SELECT COUNT(*) AS removed_count
FROM dealer_reviews
WHERE admin_removed = true;
```

---

### 4. Clean Test Leads

**Identify and remove test leads:**
```sql
-- Find test leads
SELECT 
  id,
  source,
  listing_id,
  dealer_id,
  status,
  created_at
FROM dealer_leads
WHERE 
  source = 'test'
  OR status = 'test';

-- Hard delete test leads (safe - no public visibility)
DELETE FROM dealer_leads
WHERE 
  source = 'test'
  OR listing_id IN (SELECT id FROM listings WHERE deleted_at IS NOT NULL);

-- Verify remaining leads
SELECT COUNT(*) AS remaining_leads
FROM dealer_leads;
```

---

### 5. Clean Test Reports

**Remove test dealer reports:**
```sql
-- Find test reports
SELECT 
  id,
  dealer_id,
  reason,
  details,
  created_at
FROM dealer_reports
WHERE 
  details ILIKE '%test%'
  OR reason = 'other' AND details ILIKE '%dummy%';

-- Hard delete test reports (safe - admin-only visibility)
DELETE FROM dealer_reports
WHERE 
  details ILIKE '%test%'
  OR details ILIKE '%dummy%';
```

---

### 6. Clean Test Notifications

**Remove test notifications:**
```sql
-- Find test notifications
SELECT 
  id,
  user_id,
  type,
  title,
  message,
  created_at
FROM notifications
WHERE 
  title ILIKE '%test%'
  OR message ILIKE '%test%';

-- Hard delete test notifications (safe - user-specific)
DELETE FROM notifications
WHERE 
  title ILIKE '%test%'
  OR message ILIKE '%test%'
  OR listing_id IN (SELECT id FROM listings WHERE deleted_at IS NOT NULL);
```

---

### 7. Clean Test Analytics Events

**Remove test analytics:**
```sql
-- Delete analytics for deleted listings
DELETE FROM dealer_analytics_events
WHERE listing_id IN (
  SELECT id FROM listings WHERE deleted_at IS NOT NULL
);

-- Delete analytics for suspended dealers
DELETE FROM dealer_analytics_events
WHERE dealer_id IN (
  SELECT id FROM dealer_profiles WHERE suspended = true
);
```

---

### 8. Clean Test Users (CAREFUL)

**⚠️ EXTREME CAUTION: Only delete confirmed test accounts**

```sql
-- Find potential test users
SELECT 
  id,
  email,
  created_at,
  (SELECT COUNT(*) FROM listings WHERE user_id = profiles.id) AS listing_count
FROM profiles
WHERE 
  email ILIKE '%test%@%'
  OR email ILIKE '%demo%@%'
  OR email ILIKE '%fake%@%';

-- DO NOT hard delete users - they're in auth.users
-- Instead, manually delete via Supabase Dashboard → Authentication → Users
```

---

## Public Query Verification

### Ensure Public Pages Exclude Deleted Data

**Check browse page excludes deleted listings:**
```sql
-- What public sees (should match browse.tsx query)
SELECT id, title, brand, price, district, status, deleted_at
FROM listings
WHERE 
  status = 'active'
  AND deleted_at IS NULL  -- Add this if not already in code
ORDER BY created_at DESC
LIMIT 10;
```

**Check dealer profile excludes deleted listings:**
```sql
-- What dealer inventory shows
SELECT id, title, status, deleted_at
FROM listings
WHERE 
  dealer_id = 'specific-dealer-id'
  AND deleted_at IS NULL  -- Should be in code
ORDER BY created_at DESC;
```

---

## Rollback Plan

If cleanup goes wrong, restore from backup:

### Option 1: Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/database/backups
2. Find "Pre-Cleanup" backup
3. Click "Restore"
4. Confirm restoration

### Option 2: SQL Rollback (if soft delete)
```sql
-- Undo soft delete of listings
UPDATE listings
SET 
  deleted_at = NULL,
  status = 'active'
WHERE 
  deleted_at > 'YYYY-MM-DD HH:MM:SS'  -- Time of cleanup
  AND deleted_at IS NOT NULL;

-- Undo dealer suspension
UPDATE dealer_profiles
SET 
  suspended = false,
  moderation_note = NULL
WHERE 
  moderation_note LIKE '%cleanup%';
```

---

## Pre-Launch Cleanup Checklist

Run these in order:

- [ ] **Backup database** (Critical)
- [ ] **Identify test listings** (Query + manual review)
- [ ] **Soft delete test listings** (UPDATE with deleted_at)
- [ ] **Identify test dealers** (Query + manual review)
- [ ] **Suspend test dealers** (UPDATE suspended = true)
- [ ] **Clean test reviews** (UPDATE admin_removed = true)
- [ ] **Clean test leads** (DELETE if safe)
- [ ] **Clean test reports** (DELETE if safe)
- [ ] **Clean test notifications** (DELETE if safe)
- [ ] **Clean test analytics** (DELETE if safe)
- [ ] **Verify public pages show only real data**
- [ ] **Test browse page** (No test listings visible)
- [ ] **Test dealer directory** (No suspended dealers visible)
- [ ] **Test search** (Works with remaining data)
- [ ] **Document what was cleaned** (For records)

---

## Statistics Queries

**After cleanup, get clean stats:**

```sql
-- Active listings count
SELECT COUNT(*) AS active_listings
FROM listings
WHERE status = 'active' AND deleted_at IS NULL;

-- Active dealers count
SELECT COUNT(*) AS active_dealers
FROM dealer_profiles
WHERE suspended = false;

-- Listings by brand
SELECT brand, COUNT(*) AS count
FROM listings
WHERE status = 'active' AND deleted_at IS NULL
GROUP BY brand
ORDER BY count DESC
LIMIT 10;

-- Listings by district
SELECT district, COUNT(*) AS count
FROM listings
WHERE status = 'active' AND deleted_at IS NULL
GROUP BY district
ORDER BY count DESC
LIMIT 10;

-- Average price
SELECT 
  AVG(price) AS avg_price,
  MIN(price) AS min_price,
  MAX(price) AS max_price
FROM listings
WHERE status = 'active' AND deleted_at IS NULL;
```

---

## Common Cleanup Patterns

### Pattern 1: Clean by Date Range
```sql
-- Soft delete all listings created during testing period
UPDATE listings
SET deleted_at = NOW(), status = 'deleted'
WHERE 
  created_at BETWEEN '2026-05-01' AND '2026-05-20'
  AND (title ILIKE '%test%' OR price < 50000);
```

### Pattern 2: Clean by User
```sql
-- Soft delete all listings from specific test user
UPDATE listings
SET deleted_at = NOW(), status = 'deleted'
WHERE user_id = 'test-user-id-here';
```

### Pattern 3: Clean by Placeholder Content
```sql
-- Soft delete listings with placeholder descriptions
UPDATE listings
SET deleted_at = NOW(), status = 'deleted'
WHERE 
  description ILIKE '%lorem ipsum%'
  OR description ILIKE '%placeholder%'
  OR description ILIKE '%coming soon%';
```

---

## Safety Tips

✅ **Do:**
- Always backup first
- Use soft delete (deleted_at) over hard delete
- Test queries with SELECT before UPDATE/DELETE
- Clean in small batches
- Document what you cleaned
- Verify results after each step

❌ **Don't:**
- Hard delete without backup
- Delete production user data
- Clean during peak hours
- Skip verification steps
- Delete all at once without review

---

## Emergency Recovery

If you accidentally deleted production data:

1. **STOP immediately** - Don't run more queries
2. **Restore from backup** (Supabase Dashboard → Backups)
3. **Check git history** for schema/migrations
4. **Contact Supabase support** if backup fails
5. **Document what happened** for postmortem

---

## Contact

For cleanup questions or if unsure:
- Review this guide carefully
- Test queries on small datasets first
- Use soft delete over hard delete
- When in doubt, DON'T delete - mark as draft instead

---

**Last Updated:** 22 May 2026  
**Status:** Ready for pre-launch cleanup  
**Risk:** MEDIUM - Always backup first 🔒
