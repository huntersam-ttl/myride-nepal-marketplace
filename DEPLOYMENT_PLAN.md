# Deployment Plan

**Date:** 22 May 2026  
**Project:** MyRideNepal Marketplace  
**Status:** Pre-Deployment Checklist  
**Build Status:** ✅ Passing (8.99s, 0 errors)

---

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] All features implemented and tested locally
- [x] Build passing (8.99s, no TypeScript errors)
- [x] No console errors on critical paths
- [x] Mobile responsive verified
- [x] All dealer system features complete (Phase 1, 2A, 2B, 2C, 3A, 3B, 3C, 3D)
- [x] Launch readiness features complete (Phase 4A, 4B, 4C, 4D, 4E)
- [x] Soft-delete and cleanup systems implemented

### ⏳ Database Ready
- [ ] All migrations reviewed (7 dealer migrations + Phase 4 fixes)
- [ ] Migration SQL files ready in `supabase/migrations/`
- [ ] RLS policies documented
- [ ] Indexes documented
- [ ] Triggers documented

### ⏳ Environment Ready
- [ ] Environment variables verified in Vercel
- [ ] Supabase project URL correct
- [ ] Supabase anon key correct
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active

---

## Step-by-Step Deployment Process

### Step 1: Apply Database Migrations (CRITICAL - Do First)

**⚠️ WARNING:** Apply migrations to production database BEFORE deploying code

**Time:** 15-30 minutes  
**Location:** Supabase Dashboard SQL Editor  
**URL:** https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/sql

**Order of Migrations:**

1. **Phase 2B: Analytics, Share, Report System**
   - File: `supabase/migrations/20260521130000_dealer_phase2b.sql`
   - Creates: `dealer_reports` table
   - Adds: `dealer_profiles.flag_count`, `dealer_profiles.showroom_photos`
   - Indexes: 5 new indexes
   - Triggers: `update_dealer_flag_count_trigger`

2. **Phase 2C: Reviews & Social**
   - File: `supabase/migrations/20260521140000_dealer_phase2c.sql`
   - Creates: `dealer_reviews`, `dealer_followers` tables
   - Adds: `dealer_profiles.total_reviews`, `dealer_profiles.average_rating`, `dealer_profiles.followers_count`
   - Indexes: 8 new indexes
   - Triggers: Rating update, follower count

3. **Phase 3A: Team Management & Notifications**
   - File: `supabase/migrations/20260521160000_dealer_phase3a.sql`
   - Creates: `dealer_staff`, `notifications` tables
   - Adds: `dealer_profiles.owner_id`, `dealer_profiles.team_size`
   - Indexes: 6 new indexes
   - RLS policies for staff access

4. **Phase 3B: Notification Preferences**
   - File: `supabase/migrations/20260522100000_dealer_phase3b.sql`
   - Updates: `notifications` table (add type, related_type, related_id, action_url)
   - Updates: `dealer_leads` table (add notes, follow_up_date, priority)

5. **Phase 3B: Notification Preferences Table**
   - File: `supabase/migrations/20260522110000_dealer_notification_prefs.sql`
   - Creates: `dealer_notification_preferences` table
   - Default preferences per dealer

6. **Phase 3C: Bulk Tools & Dead Stock**
   - File: `supabase/migrations/20260522120000_dealer_phase3c_bulk_tools.sql`
   - Adds: `listings.youtube_url`, `listings.views_count`, `listings.leads_count`
   - Function: `update_listing_views()`, `update_listing_leads()`

7. **Phase 3D: Onboarding Progress**
   - File: `supabase/migrations/20260522130000_dealer_phase3d_onboarding.sql`
   - Adds: `dealer_profiles.onboarding_completed`, `dealer_profiles.onboarding_progress`

**How to Apply Each Migration:**

```sql
-- 1. Open Supabase Dashboard SQL Editor
-- 2. Copy entire migration file content
-- 3. Paste into SQL editor
-- 4. Click "Run" (or press Cmd+Enter)
-- 5. Verify success message appears
-- 6. Check "History" tab to confirm execution
-- 7. Repeat for next migration in order
```

**Verification Queries After All Migrations:**

```sql
-- Check all dealer tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'dealer_%';

-- Expected: dealer_profiles, dealer_analytics_events, dealer_leads, 
--           dealer_reports, dealer_reviews, dealer_followers, 
--           dealer_staff, dealer_notification_preferences

-- Check notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- Check listings columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
  AND column_name IN ('deleted_at', 'sold_at', 'youtube_url', 'views_count', 'leads_count', 'dealer_id');

-- Expected: All 6 columns should exist

-- Check dealer_profiles new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dealer_profiles' 
  AND column_name IN ('flag_count', 'showroom_photos', 'total_reviews', 'average_rating', 
                      'followers_count', 'owner_id', 'team_size', 'onboarding_completed', 
                      'onboarding_progress');

-- Expected: All 9 columns should exist
```

**Rollback Plan for Migrations:**

If a migration fails:
1. Note the error message
2. Do NOT proceed with remaining migrations
3. Contact team or review migration file
4. Fix SQL syntax error if simple
5. For complex errors:
   - Restore from backup (Supabase Dashboard → Database → Backups)
   - Review migration checklist: `PRODUCTION_MIGRATION_CHECKLIST.md`

---

### Step 2: Regenerate TypeScript Types

**Time:** 2-3 minutes  
**Location:** Local terminal

```bash
# Ensure Supabase CLI is linked to production project
npx supabase link --project-ref nukeyvnsvsgwyvbtertf

# Regenerate types from production database
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Verify types file updated
git diff src/integrations/supabase/types.ts

# Should see new tables: dealer_reports, dealer_reviews, dealer_followers, 
#                        dealer_staff, notifications, dealer_notification_preferences
# Should see new columns in dealer_profiles and listings
```

**If regeneration fails:**
- Check Supabase CLI installed: `npx supabase --version`
- Check project linked: `npx supabase projects list`
- Manually link: `npx supabase link --project-ref nukeyvnsvsgwyvbtertf`

---

### Step 3: Final Build

**Time:** 1-2 minutes  
**Location:** Local terminal

```bash
# Clean previous build
rm -rf dist/

# Run production build
npm run build

# Expected output:
# ✓ built in ~8-10s
# No TypeScript errors
# No build errors
# Bundle sizes reasonable (< 500KB main, < 150KB gzipped)
```

**If build fails:**
- Read error message carefully
- Most common: TypeScript type mismatch after regenerating types
- Fix only the error, do not add features
- Rebuild and verify

---

### Step 4: Commit Changes

**Time:** 5-10 minutes  
**Location:** Local terminal

**⚠️ IMPORTANT:** Do NOT commit:
- `.env` files
- `supabase/.temp/cli-latest`
- `node_modules/`
- `dist/`
- Any temporary scratch files
- Duplicate old instruction files

**Commit Strategy: 4 Separate Commits**

#### Commit 1: Dealer System Feature Files

```bash
git add src/components/AccessDenied.tsx
git add src/components/DeadStockAlert.tsx
git add src/components/DealerReviews.tsx
git add src/components/FollowDealerButton.tsx
git add src/components/ShowroomGallery.tsx
git add src/hooks/use-dealer-access.tsx
git add src/routes/dealer-beta.tsx
git add src/routes/dealer.dashboard.analytics.tsx
git add src/routes/dealer.dashboard.inventory.import.tsx
git add src/routes/dealer.dashboard.onboarding.tsx
git add src/routes/dealer.dashboard.settings.tsx
git add src/routes/dealer.dashboard.settings.profile.tsx
git add src/routes/dealer.dashboard.settings.team.tsx
git add src/routes/dealer.dashboard.settings.notifications.tsx
git add src/routes/dealer.dashboard.settings.security.tsx
git add src/routes/dealer.dashboard.share.tsx

git commit -m "feat: add complete dealer system (Phase 1-3)

- Dealer profiles with verification badges
- Dealer dashboard with analytics and lead management
- CSV import for bulk listing creation
- Share card generator for social media
- Team management and staff access control
- Notification preferences and settings
- Onboarding progress tracking
- Review and follower system components
- Dead stock alerts
- Showroom gallery support (schema ready)"
```

#### Commit 2: Core Feature Updates (Soft Delete, Navbar, Footer)

```bash
git add src/components/Footer.tsx
git add src/components/Navbar.tsx
git add src/components/NotificationBell.tsx
git add src/routes/admin.tsx
git add src/routes/browse.tsx
git add src/routes/dealer.dashboard.inventory.tsx
git add src/routes/dealer.dashboard.leads.tsx
git add src/routes/dealers.$slug.tsx
git add src/routes/dealers.tsx
git add src/routes/index.tsx
git add src/routes/notifications.tsx
git add src/routes/safety-tips.tsx
git add src/routes/sell.tsx

git commit -m "feat: add soft-delete system and UI improvements

- Soft-delete for listings (deleted_at, sold_at columns)
- Admin approval filters (hide deleted/sold)
- Updated navbar with dealer dashboard link
- Updated footer with new links
- Notification bell component
- Report dealer system on dealer profiles
- Enhanced safety tips page
- Improved browse filters
- Dashboard inventory management updates"
```

#### Commit 3: Database Migrations

```bash
git add supabase/migrations/20260521130000_dealer_phase2b.sql
git add supabase/migrations/20260521140000_dealer_phase2c.sql
git add supabase/migrations/20260521160000_dealer_phase3a.sql
git add supabase/migrations/20260522100000_dealer_phase3b.sql
git add supabase/migrations/20260522110000_dealer_notification_prefs.sql
git add supabase/migrations/20260522120000_dealer_phase3c_bulk_tools.sql
git add supabase/migrations/20260522130000_dealer_phase3d_onboarding.sql

git commit -m "chore: add production database migrations

Phase 2B: Analytics, share, report system
- dealer_reports table
- flag_count tracking
- showroom_photos column

Phase 2C: Reviews & social
- dealer_reviews table
- dealer_followers table
- rating calculations

Phase 3A: Team & notifications
- dealer_staff table
- notifications table
- staff access control

Phase 3B: Notification preferences
- dealer_notification_preferences table
- lead notes and follow-up

Phase 3C: Bulk tools
- listings.youtube_url
- listings.views_count
- listings.leads_count

Phase 3D: Onboarding
- onboarding_completed
- onboarding_progress

All migrations use safe IF NOT EXISTS checks.
Apply in order via Supabase Dashboard SQL Editor."
```

#### Commit 4: Launch Readiness Documentation

```bash
git add ADMIN_DATA_CLEANUP_GUIDE.md
git add DEALER_ONBOARDING_SCRIPT.md
git add DEALER_OUTREACH_MESSAGES.md
git add DEALER_OUTREACH_TRACKER_TEMPLATE.md
git add FIRST_30_DAYS_GROWTH_PLAN.md
git add LAUNCH_ASSET_CHECKLIST.md
git add LAUNCH_MESSAGING_KIT.md
git add PRODUCTION_MIGRATION_CHECKLIST.md
git add SEED_DATA_PLAN.md
git add SOCIAL_LAUNCH_CONTENT.md
git add SOFT_LAUNCH_CHECKLIST.md
git add FINAL_SMOKE_TEST_CHECKLIST.md
git add DEPLOYMENT_PLAN.md
git add PHASE_4E_SUMMARY.md

git commit -m "docs: add launch readiness toolkit (Phase 4E-4F)

Launch preparation documentation:
- Launch messaging kit (pitches, social bios, website copy)
- Dealer outreach messages (WhatsApp, call scripts, objection handling)
- Social launch content (Facebook, Instagram, TikTok, LinkedIn posts)
- 30-day growth plan (week-by-week roadmap)
- Dealer onboarding script (complete call structure)
- Launch asset checklist (logo, meta tags, social setup)
- Soft launch checklist (updated with marketing section)
- Final smoke test checklist (40 test cases)
- Deployment plan (migration order, rollback strategy)

Admin & operational guides:
- Admin data cleanup guide (safe deletion workflows)
- Seed data plan (20-30 listings, 2-3 dealers)
- Dealer outreach tracker template
- Production migration checklist

Phase 4E summary document included.
Total: 4,850+ lines of launch-ready documentation."
```

#### Commit 5: TypeScript Types & Generated Files

```bash
git add src/integrations/supabase/types.ts
git add src/routeTree.gen.ts

git commit -m "chore: update generated types and route tree

- Regenerated Supabase types after Phase 2B-3D migrations
- Updated TanStack Router route tree
- Includes new dealer tables: reports, reviews, followers, staff, notification_preferences
- Includes new columns: flag_count, showroom_photos, onboarding fields, etc."
```

**Verification After All Commits:**

```bash
# Check commit log
git log --oneline -5

# Should see 5 commits:
# 1. feat: add complete dealer system
# 2. feat: add soft-delete system and UI improvements
# 3. chore: add production database migrations
# 4. docs: add launch readiness toolkit
# 5. chore: update generated types and route tree

# Verify no unstaged changes (except files to ignore)
git status

# Should see only:
# - supabase/.temp/cli-latest (safe to ignore, in .gitignore ideally)
# - Untracked phase summary files (DEALER_PHASE*.md, PHASE4*_SUMMARY.md, TEST_*.md, *_QUICK_REF.md, apply_*.sql)
#   These are development notes, not needed in production

# Everything else should be committed
```

---

### Step 5: Push to GitHub

**Time:** 1-2 minutes  
**Location:** Local terminal

```bash
# Push all commits to main branch
git push origin main

# Expected output:
# Enumerating objects: X, done.
# Counting objects: 100% (X/X), done.
# Writing objects: 100% (X/X), X.XX KiB | X.XX MiB/s, done.
# Total X (delta X), reused X (delta X), pack-reused 0
# To github.com:huntersam-ttl/myride-nepal-marketplace.git
#    abc1234..def5678  main -> main
```

**If push fails:**
- Check internet connection
- Check GitHub authentication: `git remote -v`
- If behind on origin: `git pull --rebase origin main` then `git push origin main`

---

### Step 6: Monitor Vercel Deployment

**Time:** 3-5 minutes  
**Location:** Vercel Dashboard  
**URL:** https://vercel.com/huntersam-ttl/myride-nepal-marketplace

**What to Check:**

1. **Build Triggered Automatically**
   - Vercel detects push to main
   - Build starts within 30 seconds

2. **Build Logs**
   - Check logs for errors
   - Build should complete in 8-12 seconds
   - No TypeScript errors
   - No build failures

3. **Deployment Status**
   - Status changes: Building → Deploying → Ready
   - Production URL assigned
   - Preview URL available

4. **Environment Variables**
   - Verify `VITE_SUPABASE_URL` set correctly
   - Verify `VITE_SUPABASE_ANON_KEY` set correctly
   - Both should match production Supabase project

**If Build Fails on Vercel:**

1. Read error logs carefully
2. Common issues:
   - Environment variables missing
   - TypeScript error not caught locally
   - Build command incorrect
3. Fix locally, commit, push again
4. Do NOT panic - can rollback to previous deployment

---

### Step 7: Test Live Domain

**Time:** 15-30 minutes  
**Location:** Browser (Desktop + Mobile)  
**URL:** Your production domain (e.g., myridenepal.com or Vercel preview URL)

**Use:** `FINAL_SMOKE_TEST_CHECKLIST.md` (40 test cases)

**Priority Tests (Must-Pass Before Announcing):**

1. **Homepage loads** (no blank screen)
2. **Browse page loads** with listings
3. **Listing detail page** with working contact buttons (WhatsApp, phone)
4. **Dealer profile page** loads
5. **Dealer signup** works
6. **Dealer dashboard** accessible
7. **Login/signup** flow works
8. **Mobile responsive** (no horizontal scroll, buttons reachable)
9. **No console errors** on public pages
10. **Marketing copy realistic** (no fake claims)

**Critical Test: Contact Buttons**

```
1. Open any listing detail page
2. Click "Contact Seller" (WhatsApp) button
   - Should open WhatsApp with pre-filled message
   - Message format: "Hi, I'm interested in your [Bike] listed on MyRideNepal for NPR [Price]. Is it still available?"
3. Click "Call" button
   - Should open phone dialer with seller's number
4. Test on both desktop and mobile
5. Test on dealer profile page as well
```

**If Critical Issues Found:**

- **Blank screens / broken pages:** Rollback immediately (see Step 9)
- **Contact buttons broken:** High priority fix, deploy hotfix ASAP
- **Mobile completely broken:** Rollback or fix urgently
- **Minor styling issues:** Note and fix in next deployment

---

### Step 8: Post-Deployment Verification

**Time:** 10-15 minutes  
**Location:** Various tools

#### A. Check Vercel Logs

```
1. Go to Vercel Dashboard → Your Project → Logs
2. Check for runtime errors
3. Should see successful page loads
4. No 500 errors
5. No database connection errors
```

#### B. Check Supabase Dashboard

```
1. Go to Supabase Dashboard → Database → Tables
2. Verify all dealer tables exist:
   - dealer_profiles
   - dealer_analytics_events
   - dealer_leads
   - dealer_reports
   - dealer_reviews
   - dealer_followers
   - dealer_staff
   - dealer_notification_preferences
   - notifications
3. Verify listings columns exist:
   - deleted_at
   - sold_at
   - youtube_url
   - views_count
   - leads_count
   - dealer_id
4. Check API usage (should be normal, not spiking)
5. Check Auth users (should be able to sign up)
```

#### C. Check Database Activity

```sql
-- Check recent analytics events
SELECT event_type, COUNT(*) 
FROM dealer_analytics_events 
WHERE created_at > NOW() - INTERVAL '1 hour' 
GROUP BY event_type;

-- Check recent listings
SELECT COUNT(*) as active_listings 
FROM listings 
WHERE deleted_at IS NULL 
  AND status = 'active';

-- Check recent users
SELECT COUNT(*) as total_users 
FROM profiles 
WHERE created_at > NOW() - INTERVAL '1 day';
```

#### D. Test Full User Journey

```
1. Sign up as new user (use test email)
2. Create a test listing
3. Verify listing appears in dashboard
4. Verify listing appears on browse page
5. Edit listing
6. Delete listing (soft delete)
7. Verify deleted listing hidden from browse
8. Sign up as dealer
9. Complete dealer profile
10. Access dealer dashboard
11. Add listing from dealer dashboard
12. Check analytics (empty state OK)
13. Test share card generator
14. Verify all works smoothly
```

---

### Step 9: Rollback Plan (If Critical Issues)

**When to Rollback:**

- Site completely broken (blank screens)
- Database connection errors
- Authentication completely broken
- Contact buttons broken on all pages
- Critical security issue discovered

**How to Rollback:**

#### Option 1: Vercel Instant Rollback (Fastest)

```
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find previous successful deployment (before this one)
3. Click "..." menu on that deployment
4. Click "Promote to Production"
5. Confirm
6. Takes 30 seconds
7. Site reverted to previous version
```

#### Option 2: Git Revert (If Vercel rollback fails)

```bash
# Find the commit hash before your deployment
git log --oneline -10

# Revert the last 5 commits (adjust number as needed)
git revert --no-commit HEAD~5..HEAD
git commit -m "revert: rollback to previous stable version"
git push origin main

# Vercel will auto-deploy the reverted version
```

#### Option 3: Database Rollback (If migrations broken)

```
1. Go to Supabase Dashboard → Database → Backups
2. Find backup BEFORE migration application
3. Click "Restore" on that backup
4. Confirm (this will overwrite current database)
5. Wait 5-10 minutes for restore
6. Re-deploy code without new migrations
```

**After Rollback:**

1. Investigate the issue locally
2. Fix the problem
3. Test thoroughly
4. Re-deploy following this plan again

---

### Step 10: Announce Soft Launch

**⚠️ DO NOT ANNOUNCE until all tests pass**

**When Ready:**

- All 40 smoke tests passed (or at least 35/40)
- No critical issues
- Contact buttons work on mobile
- Database migrations applied successfully
- Performance acceptable (< 3s page loads)

**Soft Launch Strategy (Week 1):**

Follow: `FIRST_30_DAYS_GROWTH_PLAN.md` Week 1

1. **Day 1-2:** Share with 5-10 close friends/family
2. **Day 3-5:** Share with 10-15 more trusted contacts
3. **Day 6-7:** Soft announce on personal social media (not public groups yet)

**What to Share:**

Use: `LAUNCH_MESSAGING_KIT.md` Section 1 (One-line pitch)

> "Free bike marketplace for Nepal — list, browse, and connect. Just launched! Check it out: myridenepal.com"

**Monitor Daily (Week 1):**

- Vercel logs (any errors?)
- Supabase database (any issues?)
- User feedback (collect via WhatsApp)
- Bug reports (fix within 24 hours)
- Performance (page load times)

---

## Timeline Summary

**Total Estimated Time:** 1.5-2 hours

| Step | Task | Time | Critical |
|------|------|------|----------|
| 1 | Apply database migrations | 15-30 min | ✅ YES |
| 2 | Regenerate TypeScript types | 2-3 min | ✅ YES |
| 3 | Final build | 1-2 min | ✅ YES |
| 4 | Commit changes (5 commits) | 5-10 min | ✅ YES |
| 5 | Push to GitHub | 1-2 min | ✅ YES |
| 6 | Monitor Vercel deployment | 3-5 min | ✅ YES |
| 7 | Test live domain | 15-30 min | ✅ YES |
| 8 | Post-deployment verification | 10-15 min | ⚠️ HIGH |
| 9 | Rollback (if needed) | 5-10 min | ⚠️ IF NEEDED |
| 10 | Announce soft launch | 5 min | 📢 AFTER TESTS PASS |

---

## Success Criteria

**Deployment Successful If:**

- ✅ Build deployed to Vercel successfully
- ✅ No 500 errors in Vercel logs
- ✅ Homepage loads in < 3 seconds
- ✅ Browse page shows listings
- ✅ Contact buttons work (WhatsApp, phone)
- ✅ Dealer dashboard accessible
- ✅ Sign up / login works
- ✅ Mobile responsive (no broken layout)
- ✅ No critical console errors
- ✅ Database migrations applied successfully
- ✅ At least 35/40 smoke tests passed

**Soft Launch Ready If:**

- ✅ All above deployment criteria met
- ✅ 20-30 seed listings created (from SEED_DATA_PLAN.md)
- ✅ 2-3 seed dealers created
- ✅ Test data cleaned up (from ADMIN_DATA_CLEANUP_GUIDE.md)
- ✅ At least 1 blog post published
- ✅ Marketing copy reviewed (no fake claims)
- ✅ Social media accounts set up (1-2 platforms minimum)
- ✅ WhatsApp Business configured
- ✅ Professional email set up

---

## Post-Launch Monitoring (First 48 Hours)

### Metrics to Track:

1. **Uptime:** Should be > 99.5%
2. **Page Load Time:** Should be < 3 seconds
3. **Error Rate:** Should be < 1%
4. **User Signups:** Target: 5-10 in first 48 hours
5. **Listings Created:** Target: 5-10 in first 48 hours
6. **Contact Button Clicks:** Track via analytics
7. **Dealer Signups:** Target: 1-2 in first 48 hours

### Daily Checks (First Week):

- [ ] Check Vercel logs (morning and evening)
- [ ] Check Supabase database activity
- [ ] Respond to user feedback within 24 hours
- [ ] Fix any bugs reported within 24 hours
- [ ] Monitor social media mentions
- [ ] Track growth metrics in spreadsheet

---

## Emergency Contacts

**If Critical Issue During Deployment:**

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **GitHub Issues:** https://github.com/huntersam-ttl/myride-nepal-marketplace/issues

**Rollback Decision Maker:** Project lead  
**Deployment Lead:** [Your name]  
**Date of Deployment:** [Fill in when executing]

---

## Files to Commit Summary

### ✅ COMMIT (85 files total):

**Dealer System Features (16 files):**
- src/components/AccessDenied.tsx
- src/components/DeadStockAlert.tsx
- src/components/DealerReviews.tsx
- src/components/FollowDealerButton.tsx
- src/components/ShowroomGallery.tsx
- src/hooks/use-dealer-access.tsx
- src/routes/dealer-beta.tsx
- src/routes/dealer.dashboard.analytics.tsx
- src/routes/dealer.dashboard.inventory.import.tsx
- src/routes/dealer.dashboard.onboarding.tsx
- src/routes/dealer.dashboard.settings.tsx
- src/routes/dealer.dashboard.settings.profile.tsx
- src/routes/dealer.dashboard.settings.team.tsx
- src/routes/dealer.dashboard.settings.notifications.tsx
- src/routes/dealer.dashboard.settings.security.tsx
- src/routes/dealer.dashboard.share.tsx

**Core Updates (14 files):**
- src/components/Footer.tsx
- src/components/Navbar.tsx
- src/components/NotificationBell.tsx
- src/routes/admin.tsx
- src/routes/browse.tsx
- src/routes/dealer.dashboard.inventory.tsx
- src/routes/dealer.dashboard.leads.tsx
- src/routes/dealers.$slug.tsx
- src/routes/dealers.tsx
- src/routes/index.tsx
- src/routes/notifications.tsx
- src/routes/safety-tips.tsx
- src/routes/sell.tsx
- src/integrations/supabase/types.ts
- src/routeTree.gen.ts

**Migrations (7 files):**
- supabase/migrations/20260521130000_dealer_phase2b.sql
- supabase/migrations/20260521140000_dealer_phase2c.sql
- supabase/migrations/20260521160000_dealer_phase3a.sql
- supabase/migrations/20260522100000_dealer_phase3b.sql
- supabase/migrations/20260522110000_dealer_notification_prefs.sql
- supabase/migrations/20260522120000_dealer_phase3c_bulk_tools.sql
- supabase/migrations/20260522130000_dealer_phase3d_onboarding.sql

**Documentation (14 files):**
- ADMIN_DATA_CLEANUP_GUIDE.md
- DEALER_ONBOARDING_SCRIPT.md
- DEALER_OUTREACH_MESSAGES.md
- DEALER_OUTREACH_TRACKER_TEMPLATE.md
- FIRST_30_DAYS_GROWTH_PLAN.md
- LAUNCH_ASSET_CHECKLIST.md
- LAUNCH_MESSAGING_KIT.md
- PRODUCTION_MIGRATION_CHECKLIST.md
- SEED_DATA_PLAN.md
- SOCIAL_LAUNCH_CONTENT.md
- SOFT_LAUNCH_CHECKLIST.md
- FINAL_SMOKE_TEST_CHECKLIST.md
- DEPLOYMENT_PLAN.md
- PHASE_4E_SUMMARY.md

### ❌ DO NOT COMMIT (39 files):

**Environment Files:**
- .env
- .env.production

**Temporary/Cache Files:**
- supabase/.temp/cli-latest

**Development Notes (not needed in production):**
- DEALER_PHASE1_CODE_SNIPPETS.md
- DEALER_PHASE1_IMPLEMENTATION.md
- DEALER_PHASE1_SUMMARY.md
- DEALER_PHASE2B_SUMMARY.md
- DEALER_PHASE2C_SUMMARY.md
- DEALER_PHASE3A_SUMMARY.md
- DEALER_PHASE3B_POLISH_SUMMARY.md
- DEALER_PHASE3B_SUMMARY.md
- DEALER_PHASE3C_SUMMARY.md
- DEALER_PHASE3D_SUMMARY.md
- PHASE2A_FIX_INSTRUCTIONS.md
- PHASE3A_QUICK_REF.md
- PHASE3B_POLISH_QUICK_REF.md
- PHASE3B_QUICK_REF.md
- PHASE3C_QUICK_REF.md
- PHASE3D_QUICK_REF.md
- PHASE4A_LAUNCH_CLEANUP_SUMMARY.md
- PHASE4A_QUICK_REF.md
- PHASE4B_SUMMARY.md
- PHASE4C_QUICK_REF.md
- PHASE4C_SUMMARY.md
- PHASE4D_SUMMARY.md
- TEST_PHASE2A_REPORT.md
- MIGRATIONS_APPLIED.md

**Backup/Duplicate Files:**
- src/routes/dealer.dashboard.inventory.tsx.backup
- apply_missing_dealer_tables.sql
- apply_phase2a_migration.sql
- apply_phase2b_migration.sql
- apply_phase2c_migration.sql
- apply_phase3a_migration.sql
- apply_phase3b_migration.sql

---

**Last Updated:** 22 May 2026  
**Status:** Ready for execution  
**Next Action:** Apply database migrations (Step 1)

🚀 **Let's deploy!**
