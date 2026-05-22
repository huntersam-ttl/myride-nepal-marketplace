# Soft Launch Checklist

**Date:** 22 May 2026  
**Purpose:** Step-by-step guide to safely launch MyRideNepal to initial users  
**Target:** Soft launch to 10-50 users in Kathmandu for 1-2 weeks before full public launch

---

## Pre-Launch Requirements

### ✅ Code Ready
- [x] Phase 4A cleanup complete
- [x] Build passing (8.64s, 0 errors)
- [x] TypeScript clean
- [x] SEO metadata added
- [x] Trust messaging improved
- [x] Safety content added

### ⚠️ Database Ready
- [ ] All migrations applied (see PRODUCTION_MIGRATION_CHECKLIST.md)
- [ ] Types regenerated
- [ ] Database backup created
- [ ] RLS policies verified
- [ ] Test queries working

### ⏳ Deployment Ready
- [ ] Environment variables configured
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Supabase project linked
- [ ] Image storage configured

---

## 1. Apply Database Migrations

**Time:** 30-45 minutes  
**Critical:** Must be done before deployment

Follow: `PRODUCTION_MIGRATION_CHECKLIST.md`

### Quick Checklist:
- [ ] Create database backup
- [ ] Apply Phase 1 migrations (dealer profile foundation)
- [ ] Apply Phase 2A migrations (dealer dashboard core)
- [ ] Apply Phase 2C migrations (reviews & social)
- [ ] Apply Phase 3A migrations (team management)
- [ ] Apply Phase 3B migrations (analytics + notifications)
- [ ] Verify all tables exist (8 dealer tables)
- [ ] Regenerate TypeScript types
- [ ] Commit updated types

---

## 2. Build & Deploy

**Time:** 10-15 minutes

### Build Locally First:
```bash
# Clean build
rm -rf dist/
npm run build

# Check for errors
# Should see: ✓ built in ~8-10s

# Check bundle sizes
# Main bundle should be ~400KB (125KB gzipped)
```

### Deploy to Vercel:
```bash
# Option 1: Via Git (recommended)
git add .
git commit -m "chore: production migration readiness"
git push origin main
# Vercel auto-deploys from main branch

# Option 2: Via Vercel CLI
vercel --prod
```

### Verify Environment Variables:
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Domain configured (if custom domain)
- [ ] SSL enabled

---

## 3. Smoke Test (Critical Paths)

**Time:** 20-30 minutes  
**Do this on production URL immediately after deploy**

### Homepage Tests
- [ ] Homepage loads within 3 seconds
- [ ] Hero section displays correctly
- [ ] Stats show "Growing" or real count
- [ ] Search bar works
- [ ] Browse by brand tags work
- [ ] Latest listings show (or empty state)
- [ ] "How it works" section displays
- [ ] Buyer safety section displays
- [ ] Footer links work
- [ ] Mobile responsive

### Browse Page Tests
- [ ] `/browse` loads
- [ ] Filters work (brand, district, price)
- [ ] Search works
- [ ] Listings display (or empty state)
- [ ] Pagination works (if listings exist)
- [ ] Mobile responsive

### Authentication Tests
- [ ] `/auth` page loads
- [ ] Sign up with email works
- [ ] Email verification sent (check inbox)
- [ ] Login with email works
- [ ] Logout works
- [ ] Password reset flow works

### Sell Flow Tests
- [ ] `/sell` page loads
- [ ] Form validation works
- [ ] Image upload works
- [ ] Can submit listing
- [ ] Listing appears in dashboard
- [ ] Can edit listing
- [ ] Can delete listing

### Dealer Tests
- [ ] `/dealers` directory loads
- [ ] `/dealer-beta` page loads
- [ ] `/dealer-signup` loads
- [ ] Can create dealer profile
- [ ] Dealer dashboard loads (`/dealer/dashboard`)
- [ ] Inventory page works
- [ ] Analytics page works (empty state OK)
- [ ] Share page works
- [ ] Onboarding page works
- [ ] Settings pages work

### Listing Detail Tests
- [ ] `/listings/$id` loads
- [ ] Images display
- [ ] Contact seller buttons work (WhatsApp/Phone)
- [ ] Share buttons work
- [ ] Save listing works (if logged in)
- [ ] Related listings show (if available)

### Safety & Info Pages
- [ ] `/safety-tips` loads
- [ ] `/price-estimator` works
- [ ] `/blog` loads
- [ ] `/about` loads (if exists)

### Mobile Tests
- [ ] All above pages work on mobile
- [ ] Navbar mobile menu works
- [ ] Forms work on mobile
- [ ] Images load properly
- [ ] No horizontal scroll
- [ ] Touch targets adequate

---

## 4. Data Preparation

**Time:** 14-21 hours total (1 hour cleanup + 12-19 hours seed data + 1 hour verification)

### 4.1 Clean Test Data (1 hour)

⚠️ **CRITICAL:** Follow the comprehensive cleanup guide

**Document:** `ADMIN_DATA_CLEANUP_GUIDE.md`

**Quick Checklist:**
- [ ] Create database backup via Supabase Dashboard (Settings → Database → Backups)
- [ ] Verify backup created successfully
- [ ] Follow cleanup workflows in ADMIN_DATA_CLEANUP_GUIDE.md:
  - [ ] Clean test listings (use soft delete: UPDATE deleted_at, status='deleted')
  - [ ] Clean test dealers (use soft suspension: UPDATE suspended=true)
  - [ ] Clean test reviews (use soft removal: UPDATE admin_removed=true)
  - [ ] Clean test leads (safe to hard DELETE)
  - [ ] Clean test reports (safe to hard DELETE)
  - [ ] Clean test notifications (safe to hard DELETE)
  - [ ] Clean test analytics events (safe to hard DELETE)
  - [ ] Clean test users (EXTREME CAUTION - manual via Dashboard only)
- [ ] Run verification queries from guide
- [ ] Verify public pages show no test data:
  ```sql
  -- Should return 0
  SELECT COUNT(*) FROM listings 
  WHERE deleted_at IS NULL 
    AND (title ILIKE '%test%' OR price < 10000);
  ```
- [ ] Document cleanup results (how many items removed from each table)

**Safety Notes:**
- Always backup BEFORE cleanup
- Prefer soft delete over hard DELETE for listings/dealers/reviews
- Test queries with SELECT before running UPDATE/DELETE
- Clean in batches (10-20 items at a time)
- Keep rollback plan ready

---

### 4.2 Seed Quality Data (12-19 hours over 2-3 days)

⚠️ **CRITICAL:** Follow the comprehensive seed data plan

**Document:** `SEED_DATA_PLAN.md`

**Quick Checklist:**

**Day 1: Preparation (3-5 hours)**
- [ ] Read SEED_DATA_PLAN.md completely
- [ ] Prepare seed-listings.csv with 20-30 listing ideas
- [ ] Gather or source 60-90 bike images (3 per listing):
  - Real bikes (friends/family/parking areas) - PREFERRED
  - Stock photos (Unsplash/Pexels "motorcycle nepal")
  - Placeholder (temporary - replace ASAP)
- [ ] Create folder structure: images/listing-001/, images/listing-002/, etc.
- [ ] Upload images to Supabase Storage (bucket: listing-images)

**Day 2: Listings Creation (5-8 hours)**
- [ ] Create 20-30 quality listings following standards:
  - Proper title format: "[Brand] [Model] [Year]"
  - Realistic prices (NPR 100,000 - 800,000)
  - Real Nepal districts (Kathmandu 8-12, Lalitpur 3-5, Bhaktapur 2-3, Pokhara 2-4)
  - Quality descriptions (50-200 words, natural language)
  - Valid Nepal phone numbers (98XXXXXXXX format)
  - 3+ clear photos per listing
  - Avoid "test", "dummy", placeholder content
- [ ] Verify variety mix:
  - By Brand: Hero 4-6, Honda 4-6, Pulsar 3-5, Yamaha 2-4, KTM 2-3, TVS 2-3
  - By Price: Budget 5-7, Mid 8-10, Premium 5-7, High-end 2-3
  - By Condition: New 2-3, Excellent 8-10, Good 8-10, Fair 2-4
- [ ] Run quality control checks from SEED_DATA_PLAN.md (10-point checklist)

**Day 2-3: Dealer Profiles (3-5 hours)**
- [ ] Create 3-5 complete dealer profiles:
  - Professional business names (not "Test Dealer")
  - Real cities/districts
  - Valid contact info (phone, WhatsApp, email)
  - Logo + banner images
  - 2-5 brands carried
  - Realistic opening hours
  - Quality descriptions (100-200 words)
- [ ] Use examples from SEED_DATA_PLAN.md:
  - "Kathmandu Motors" (Hero/Honda/Yamaha, Thamel)
  - "Valley Bikes" (Pulsar/KTM, Patan)
  - "Pokhara Two Wheelers" (Honda/Hero/TVS, Pokhara)
- [ ] Add 5-10 listings per dealer (minimum 5 each)
- [ ] Verify each dealer has complete profile
- [ ] Run quality control checks from SEED_DATA_PLAN.md (9-point checklist)

**Day 3: Blog Content (3-4 hours)**
- [ ] Write "10 Things to Check Before Buying a Used Bike in Nepal" (800-1000 words)
  - Bluebook verification, engine inspection, test ride tips, price comparison, ownership transfer, insurance, maintenance history, accident history, modifications, paperwork
- [ ] Write "Most Popular Commuter Bikes in Kathmandu Valley 2024" (600-800 words)
  - Hero Splendor, Honda Shine, Pulsar 150, Yamaha FZ, market trends, price ranges
- [ ] Write "How to Sell Your Bike Faster on MyRideNepal" (600-800 words)
  - Quality photos, honest descriptions, competitive pricing, respond quickly, verify documents, timing tips
- [ ] Add featured images to blog posts
- [ ] Publish all blog posts

**Final: QA & Testing (1-2 hours)**
- [ ] Homepage shows 6 featured listings (no empty state)
- [ ] Browse page shows 20-30 listings
- [ ] Filters work (brand, district, price ranges)
- [ ] Dealer directory shows 3-5 dealers
- [ ] Each dealer profile shows 5+ listings
- [ ] All images load properly
- [ ] No "test" or "dummy" content visible anywhere
- [ ] Mobile view looks professional
- [ ] No console errors on any page
- [ ] Run overall quality control checks from SEED_DATA_PLAN.md (10-point checklist)

---

### 4.3 Verify Data Quality (30 minutes)

**Run these checks:**

```sql
-- Active listings count (should be 20-30)
SELECT COUNT(*) as active_listings 
FROM listings 
WHERE status = 'active' 
  AND deleted_at IS NULL;

-- Listings by brand (verify variety)
SELECT brand, COUNT(*) as count 
FROM listings 
WHERE status = 'active' 
  AND deleted_at IS NULL 
GROUP BY brand 
ORDER BY count DESC;

-- Listings by district (verify geographic spread)
SELECT district, COUNT(*) as count 
FROM listings 
WHERE status = 'active' 
  AND deleted_at IS NULL 
GROUP BY district 
ORDER BY count DESC;

-- Active dealers count (should be 3-5)
SELECT COUNT(*) as active_dealers 
FROM dealer_profiles 
WHERE suspended = false;

-- Dealer inventory (each should have 5+ listings)
SELECT 
  dp.business_name,
  COUNT(l.id) as listing_count
FROM dealer_profiles dp
LEFT JOIN listings l ON l.dealer_id = dp.id AND l.deleted_at IS NULL
WHERE dp.suspended = false
GROUP BY dp.id, dp.business_name
ORDER BY listing_count DESC;

-- Blog posts count (should be 2-3)
SELECT COUNT(*) as blog_count FROM blog_posts WHERE published = true;
```

**Expected Results:**
- ✅ 20-30 active listings
- ✅ 5-8 different brands represented
- ✅ 5-10 different districts represented
- ✅ 3-5 active dealers
- ✅ Each dealer has 5+ listings
- ✅ 2-3 published blog posts
- ✅ No test/dummy content
- ✅ All images load
- ✅ All phone numbers valid (98XXXXXXXX format)

### Add Seed Listings (10-30 curated)
**Option 1: Manual entry**
- [ ] Create 10-15 real-looking motorcycle listings
- [ ] Mix of brands: Hero, Honda, Pulsar, KTM, Yamaha, TVS
- [ ] Mix of conditions: New, Excellent, Good
- [ ] Mix of years: 2020-2025
- [ ] Real Nepal districts: Kathmandu, Lalitpur, Bhaktapur, Pokhara
- [ ] Realistic prices (NPR 150,000 - 500,000)
- [ ] Use real bike photos (search Unsplash/Pexels for "motorcycle")

**Option 2: Import from CSV** (if CSV tool tested)
- [ ] Prepare CSV with 20-30 listings
- [ ] Use real bike models and specs
- [ ] Import via dealer CSV tool
- [ ] Verify all imported correctly

### Add Seed Dealers (3-5 curated)
- [ ] Create 3-5 dealer profiles
- [ ] Use realistic showroom names
- [ ] Add showroom photos
- [ ] Add contact details (can use placeholder numbers)
- [ ] Add 5-10 listings per dealer
- [ ] Verify profiles on `/dealers`

---

## 5. Testing & Validation

**Time:** 2-3 hours

### 5.1 Empty State Verification (30 minutes)

**Check all pages have strong empty states:**

- [ ] Homepage listings section (when no listings)
  - Should show: "No listings yet" with CTA to "Create Listing"
- [ ] Browse page (when no listings match filters)
  - Should show: "No bikes found" with suggestion to adjust filters
- [ ] Dealer directory (when no dealers)
  - Should show: "No dealers yet" with CTA to "Join as Dealer"
- [ ] Dealer profile inventory (when dealer has no listings)
  - Should show: "No listings yet" with CTA to "Add Listing"
- [ ] Dealer dashboard inventory (when dealer has no listings)
  - Should show: "Create your first listing" with prominent CTA
- [ ] Dealer leads (when no leads)
  - Should show: "No leads yet" with tips to get more visibility
- [ ] Dealer analytics (when no data)
  - Should show: "No data yet" with explanation
- [ ] Notifications page (when no notifications)
  - Should show: "No notifications yet"
- [ ] Saved listings (when nothing saved)
  - Should show: "No saved bikes" with CTA to "Browse Bikes"
- [ ] Blog (if no posts exist)
  - Should show: "No articles yet" or redirect to homepage

**For each empty state, verify:**
- [ ] No ugly blank pages
- [ ] No console errors
- [ ] Friendly message displayed
- [ ] Helpful CTA button (where appropriate)
- [ ] Mobile looks good

---

### 5.2 Public Copy Review (30 minutes)

**Verify all public marketing copy is realistic for soft launch:**

- [ ] **Homepage Hero Section**
  - Current: "Free listings for bikes and scooters. Admin-reviewed. Contact sellers directly by phone or WhatsApp." ✅ GOOD
  - Check: No "thousands of listings" claims ✅
  - Check: No "Nepal's #1" claims (we're new) ✅
  - Check: No fake social proof ✅

- [ ] **Homepage Stats Bar**
  - Current: Shows real listing count or "Growing", "77 Districts covered", "Free No commission" ✅ GOOD
  - Check: Not claiming "10,000+ listings" (fake) ✅
  - Check: Not claiming "500+ dealers" (fake) ✅
  - Check: Not using fake trust numbers ✅

- [ ] **Sell Page Copy** (`/sell`)
  - Check: Realistic promises only
  - Check: No "instant sale" claims
  - Check: Honest about process (admin approval, manual contact)

- [ ] **Dealer Beta Page** (`/dealer-beta`)
  - Check: Honest about being new platform
  - Check: No fake volume claims
  - Check: Clear about beta status

- [ ] **Dealer Directory** (`/dealers`)
  - Check: No "hundreds of dealers" claim
  - Check: Shows real count or "Growing"

- [ ] **About Page** (if exists)
  - Check: Honest about launch stage
  - Check: No fake history claims
  - Check: Clear mission statement

**Fix any unrealistic claims:**
- Replace "thousands of listings" with "Growing listings"
- Replace "Nepal's #1" with "Nepal's new"
- Remove fake trust indicators (unless real)
- Be honest about soft launch status

---

### 5.3 User Flow Testing (1-2 hours)

**Test complete user journeys on production URL:**

**Seller Flow (30 minutes)**
- [ ] Visit homepage as new user
- [ ] Click "Sell Your Bike" button
- [ ] Sign up with email (receive verification email)
- [ ] Verify email via link
- [ ] Return to site, login automatically
- [ ] Navigate to /sell page
- [ ] Fill out listing form completely
- [ ] Upload 3 bike images (test various sizes)
- [ ] Submit listing
- [ ] See success message
- [ ] View listing in dashboard (/dashboard)
- [ ] Edit listing (change price)
- [ ] Save changes successfully
- [ ] Verify changes appear
- [ ] Test listing status change (pending → active)
- [ ] Delete listing (if needed)

**Buyer Flow (20 minutes)**
- [ ] Visit homepage as anonymous user
- [ ] Browse featured listings
- [ ] Click "Browse All Bikes" button
- [ ] Use filters (brand, district, price range)
- [ ] Click on listing to view details
- [ ] View all images in lightbox
- [ ] Click "Contact Seller" (WhatsApp button)
  - Should open WhatsApp with pre-filled message
- [ ] Click "Call" button
  - Should open phone dialer with number
- [ ] Click "Save" button (prompts login)
- [ ] Sign up or login
- [ ] Save listing successfully
- [ ] View saved listings (/saved)
- [ ] Unsave listing

**Dealer Flow (30 minutes)**
- [ ] Visit /dealer-beta page
- [ ] Click "Apply for Beta Access"
- [ ] Sign up with email (new account)
- [ ] Verify email
- [ ] Return to /dealer-signup page
- [ ] Fill out complete dealer profile:
  - Business name
  - District/city
  - Contact info
  - Upload logo (test image)
  - Upload banner (test image)
  - Business description
  - Opening hours
  - Brands carried
- [ ] Submit dealer profile
- [ ] See success message
- [ ] Navigate to dealer dashboard (/dealer/dashboard)
- [ ] Check all dashboard sections load:
  - Onboarding
  - Inventory
  - Analytics (empty state)
  - Share
  - Settings
- [ ] Click "Add Listing" from inventory
- [ ] Create dealer listing (same flow as seller)
- [ ] Verify listing appears in inventory
- [ ] Verify listing appears on dealer public profile
- [ ] Test share tools (generate social media post)
- [ ] Update dealer settings

**Mobile Flow (20 minutes)**
- [ ] Repeat critical paths above on real mobile device (iPhone/Android)
- [ ] Check touch targets are large enough
- [ ] Check no horizontal scroll
- [ ] Check navbar mobile menu works
- [ ] Check forms work (no keyboard blocking submit button)
- [ ] Check image upload works on mobile
- [ ] Check WhatsApp/phone links work correctly
- [ ] Check all pages responsive

**Admin Flow (10 minutes)**
- [ ] Login as admin user
- [ ] Visit /admin page
- [ ] See pending listings
- [ ] Approve a test listing
- [ ] Reject a test listing (with reason)
- [ ] Verify email notifications sent
- [ ] Check admin analytics (if exists)

---

### 5.4 Contact Button Testing (15 minutes)

**Critical: Test all seller contact methods work:**

- [ ] **WhatsApp Button Test**
  - Click WhatsApp button on listing detail page
  - Should open WhatsApp web or app
  - Should pre-fill message: "Hi, I'm interested in your [Brand Model Year] listed on MyRideNepal for NPR [Price]. Is it still available?"
  - Test on mobile (should open WhatsApp app)
  - Test on desktop (should open WhatsApp Web)

- [ ] **Phone Button Test**
  - Click phone button on listing detail page
  - Should open phone dialer with seller's number
  - Test on mobile (should open native dialer)
  - Test on desktop (should show "tel:" link)

- [ ] **Email Button Test** (if exists)
  - Should open email client with pre-filled subject/body

**Fix any broken contact buttons immediately** - these are critical for marketplace function

---

### 5.5 Performance Check (10 minutes)

### Lighthouse Audit
- [ ] Run Lighthouse on homepage
  - Performance > 80
  - Accessibility > 90
  - Best Practices > 90
  - SEO > 90

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### API Response Times
- [ ] Homepage listings query < 500ms
- [ ] Browse page query < 1s
- [ ] Listing detail query < 300ms
- [ ] Dealer dashboard query < 500ms

---

## 6. Security Check

**Time:** 15 minutes

### RLS Policies
- [ ] Users can only edit own listings
- [ ] Users can only edit own profile
- [ ] Dealers can only edit own dealer profile
- [ ] Staff can only access assigned dealer
- [ ] Admin access works correctly
- [ ] Anonymous users can browse (read-only)

### API Keys
- [ ] Supabase anon key is public (expected)
- [ ] No service_role key in frontend
- [ ] No .env committed to Git
- [ ] No sensitive data in browser console

### CORS & CSP
- [ ] API calls work from production domain
- [ ] Image uploads work
- [ ] No CORS errors in console

---

## 7. Monitoring Setup

**Time:** 15 minutes

### Supabase Monitoring
- [ ] Enable email alerts for errors
- [ ] Set up database usage alerts
- [ ] Monitor API rate limits
- [ ] Check storage usage

### Error Tracking (Optional)
- [ ] Set up Sentry (if using)
- [ ] Set up LogRocket (if using)
- [ ] Test error reporting

### Analytics (Optional)
- [ ] Set up Google Analytics (if ready)
- [ ] Set up Vercel Analytics
- [ ] Test event tracking

---

## 8. Marketing Readiness

**Time:** 2-3 hours  
**Purpose:** Prepare all marketing assets and messaging before public outreach

### ✅ Marketing Documentation Complete
- [x] Launch messaging kit (LAUNCH_MESSAGING_KIT.md)
- [x] Dealer outreach messages (DEALER_OUTREACH_MESSAGES.md)
- [x] Social launch content (SOCIAL_LAUNCH_CONTENT.md)
- [x] 30-day growth plan (FIRST_30_DAYS_GROWTH_PLAN.md)
- [x] Dealer onboarding script (DEALER_ONBOARDING_SCRIPT.md)

### ⏳ Visual & Technical Assets

**Document:** `LAUNCH_ASSET_CHECKLIST.md` (complete checklist)

**Priority Items Before Launch:**

- [ ] **Logo & Branding**
  - Favicon optimized (16×16, 32×32, 48×48, 180×180, 192×192, 512×512)
  - Logo variations ready (light/dark, square, horizontal, icon-only)
  - Brand colors documented

- [ ] **Social Media Setup** (Choose 1-3 platforms to start)
  - Facebook page created (@myridenepal) with profile/cover/bio
  - Instagram account created (@myridenepal) with bio/link/highlights
  - TikTok account created (optional for Week 2-3)
  - LinkedIn page created (optional)
  - WhatsApp Business set up (primary support channel)

- [ ] **Website Meta Tags**
  - All pages have unique title tags
  - All pages have meta descriptions (150-160 chars)
  - OpenGraph image created (1200×630px for social sharing)
  - Twitter card image created (1200×600px)
  - OpenGraph/Twitter meta tags in code

- [ ] **SEO & Indexing**
  - Google Search Console set up and site verified
  - Sitemap.xml submitted
  - Robots.txt verified
  - Google Analytics 4 installed (optional but recommended)

- [ ] **Contact & Support**
  - Professional email set up (hello@myridenepal.com or Gmail alternative)
  - Email signature created with branding
  - WhatsApp Business account configured with auto-messages
  - Support hours defined and displayed (Footer, social bios)
  - Response time commitments set (WhatsApp 2-4hr, Email 24hr)

**Optional (Nice to Have):**
- [ ] Platform demo video (2-3 minutes)
- [ ] Short social reels/TikToks (15-30 seconds)
- [ ] Business cards for dealer outreach
- [ ] Dealer testimonial video (if beta dealer available)

**See LAUNCH_ASSET_CHECKLIST.md for complete list.**

---

### 🎯 Marketing Copy Verification

**Use messaging from:** `LAUNCH_MESSAGING_KIT.md`

- [ ] **Homepage Hero** matches approved copy:
  - One-line pitch: "Free bike marketplace for Nepal — list, browse, and connect"
  - No "thousands of listings" or "Nepal's #1" fake claims ✅
  - Emphasize: Free, no commission, admin-reviewed, direct contact ✅

- [ ] **Social Media Bios** match approved copy:
  - Facebook: 255 chars version
  - Instagram: 150 chars version
  - TikTok: 80 chars version
  - LinkedIn: 2000 chars version
  - WhatsApp Business: 139 chars version

- [ ] **Dealer Beta Page** uses approved dealer pitch:
  - Free unlimited listings ✅
  - Verified badge ✅
  - Zero commission ✅
  - Analytics dashboard ✅
  - 3-month beta period mentioned ✅

- [ ] **All public pages** avoid unrealistic claims:
  - No "thousands of users" (we're new)
  - No "Nepal's biggest" (we're launch-stage)
  - Honest about being new/beta
  - Realistic expectations set

---

### 📱 First Week Social Content Ready

**Use content from:** `SOCIAL_LAUNCH_CONTENT.md`

**Prepare these posts before launch day:**

- [ ] **Launch Announcement Post** (Facebook/Instagram)
  - Copy ready (short 150-200 words or long 300-400 words)
  - Image/graphic ready
  - Hashtags ready (#MyRideNepal #BikeSaleNepal #NepalBikes)
  - CTA: "Browse bikes at myridenepal.com"

- [ ] **Dealer Beta Announcement** (Day 2-3)
  - Copy ready emphasizing "First 50 dealers" urgency
  - Apply link: myridenepal.com/dealer-beta

- [ ] **Seller-Focused Post** (Day 3-4)
  - Copy ready highlighting free listings, no commission

- [ ] **Safety-Focused Post** (Day 4-5)
  - Copy ready about scam prevention, bluebook verification

- [ ] **Week 1 Content Calendar** (7 posts planned)
  - Monday: Launch announcement
  - Tuesday: Dealer beta
  - Wednesday: Seller-focused
  - Thursday: Safety tips
  - Friday: Buyer-focused
  - Weekend: Engagement/testimonials

**See SOCIAL_LAUNCH_CONTENT.md for all ready-to-post content.**

---

### 📞 Dealer Outreach Preparation

**Use resources from:** `DEALER_OUTREACH_MESSAGES.md` & `DEALER_ONBOARDING_SCRIPT.md`

- [ ] **Contact List Prepared** (50+ potential dealers)
  - 30-40 Kathmandu dealers (showrooms from Thamel, Balaju, Kalanki, Koteshwor)
  - 10-15 Lalitpur dealers (Patan, Jawalakhel, Sanepa)
  - 5-10 Bhaktapur dealers
  - 5-10 Pokhara dealers (if reaching outside valley)
  - Dealer name, location, phone, WhatsApp, brands carried

- [ ] **Outreach Templates Ready**
  - WhatsApp short message (3 versions: direct, local, value-first)
  - Phone call script (3-5 min: opening, pitch, closing)
  - Follow-up messages (Day 3, 7, 14)
  - Objection handling responses (10 common objections with 2-3 replies each)

- [ ] **Onboarding Script Ready**
  - Complete 15-30 min call structure (6 parts)
  - Information collection checklist
  - Post-call action items
  - Follow-up schedule (Day 1, 3, 7, 14)

- [ ] **Dealer Outreach Tracker Set Up**
  - Use template from DEALER_OUTREACH_TRACKER_TEMPLATE.md
  - Spreadsheet or Notion database ready
  - Columns: Name, Location, Contact, Date, Status, Notes, Follow-up

**See DEALER_OUTREACH_MESSAGES.md for all templates.**

---

### 📅 30-Day Growth Plan Review

**Use plan from:** `FIRST_30_DAYS_GROWTH_PLAN.md`

- [ ] **Week 1 Plan (Clean & Seed)** understood:
  - Day 1-2: Data cleanup (ADMIN_DATA_CLEANUP_GUIDE.md)
  - Day 2-5: Seed data (SEED_DATA_PLAN.md)
  - Day 6-7: Soft launch to friends/family
  - Success: 20-30 listings, 2-3 dealers, 5-10 testers, 100-200 visits

- [ ] **Week 2 Plan (Dealer Outreach)** understood:
  - Day 8-9: Prepare materials (50+ dealer contacts)
  - Day 9-14: Active outreach (5-7 dealers/day)
  - Day 12-14: First social posts
  - Success: 30+ contacted, 5-10 onboarded, 80-120 listings, 300-500 visits

- [ ] **Week 3 Plan (Content & Visibility)** understood:
  - Day 15-17: Content push (2 blog articles, social content)
  - Day 16-21: Expand dealer outreach (35+ more contacts)
  - Day 18-21: Community engagement (5-7 Facebook groups)
  - Success: 60-70 contacted, 20-25 onboarded, 200-300 listings, 1500-2000 visits

- [ ] **Week 4 Plan (Scale & Optimize)** understood:
  - Day 22-24: Final dealer push (30-40 more, "only 10 spots left" urgency)
  - Day 23-26: Content campaign (2 more blogs, video content)
  - Day 25-28: Seller acquisition (20-30 individual sellers)
  - Day 26-30: Analytics & optimization
  - Success: 80-100 contacted, 30-40 onboarded, 400-500 listings, 4000-5000 visits

- [ ] **Resource Requirements** understood:
  - ~170 hours Month 1 total (full-time 1 person or part-time 2-3)
  - Optional budget: NPR 15,000-25,000 (not required, zero-budget possible)

- [ ] **Success Criteria** defined:
  - Minimum: 20+ dealers, 200+ listings, 2000+ visits, 50+ inquiries
  - Target: 30-40 dealers, 400-500 listings, 4000-5000 visits, 120-180 inquiries
  - Stretch: 50+ dealers, 600+ listings, 10,000+ visits, 300+ inquiries

**See FIRST_30_DAYS_GROWTH_PLAN.md for complete roadmap.**

---

### ✅ Marketing Assets Summary

**Complete Before Public Launch:**
1. ✅ Launch messaging documented (LAUNCH_MESSAGING_KIT.md)
2. ✅ Dealer outreach templates ready (DEALER_OUTREACH_MESSAGES.md)
3. ✅ Social content calendar ready (SOCIAL_LAUNCH_CONTENT.md)
4. ✅ 30-day growth plan ready (FIRST_30_DAYS_GROWTH_PLAN.md)
5. ✅ Dealer onboarding script ready (DEALER_ONBOARDING_SCRIPT.md)
6. ⏳ Social media accounts set up (Facebook/Instagram/WhatsApp minimum)
7. ⏳ Website meta tags optimized (titles, descriptions, OpenGraph)
8. ⏳ Google Search Console set up
9. ⏳ Professional email configured
10. ⏳ Dealer contact list prepared (50+ contacts)

**See LAUNCH_ASSET_CHECKLIST.md for complete pre-launch asset verification.**

---

## 9. Dealer Outreach

**Time:** Ongoing (parallel with soft launch)

**Documents:** 
- `DEALER_OUTREACH_MESSAGES.md` (all templates)
- `DEALER_ONBOARDING_SCRIPT.md` (call script)
- `DEALER_OUTREACH_TRACKER_TEMPLATE.md` (tracking)

**Week 1-2 Goals:**
- [ ] Contact 10-15 potential dealers
- [ ] Target: 2-3 dealer sign-ups
- [ ] Use outreach tracker to log all contacts
- [ ] Follow up on interested dealers within 2-3 days
- [ ] Help new dealers set up complete profiles
- [ ] Ensure each dealer adds minimum 5 listings

**Outreach Methods:**
- [ ] Phone calls to local bike showrooms (preferred - use script from DEALER_ONBOARDING_SCRIPT.md)
- [ ] WhatsApp messages to dealer contacts (use templates from DEALER_OUTREACH_MESSAGES.md)
- [ ] In-person visits (Kathmandu dealers - bring business cards if available)
- [ ] Email follow-ups (use dealer pitch from LAUNCH_MESSAGING_KIT.md)

**Tracking:**
- [ ] Use DEALER_OUTREACH_TRACKER_TEMPLATE.md
- [ ] Log: Contacted date, Status, Notes, Follow-up date
- [ ] Update weekly conversion metrics
- [ ] Document common objections and successful pitches
- [ ] Track objection handling effectiveness (10 common objections in DEALER_OUTREACH_MESSAGES.md)

**Success Metrics:**
- Week 1-2: 30+ contacted, 10-15 interested, 5-10 onboarded
- Week 3-4: 60-70 contacted, 20-25 onboarded
- Month 1: 80-100 contacted, 30-40 onboarded (target)

---

## 10. Soft Launch Strategy

### Phase 1: Friends & Family (Week 1)
**Target:** 5-10 users

**Follow:** FIRST_30_DAYS_GROWTH_PLAN.md (Week 1: Clean & Seed)

- [ ] Share link with close friends/family
- [ ] Ask them to:
  - Create account
  - Browse listings
  - Create 1-2 test listings
  - Try dealer signup (if applicable)
  - Report bugs and UX issues

- [ ] Monitor daily:
  - Error logs in Supabase
  - User feedback via WhatsApp/email
  - Performance metrics
  - Which features used most

**Important:** Emphasize this is a TEST - get honest feedback, report everything broken

### Phase 2: Limited Public (Week 2)
**Target:** 20-50 users (Kathmandu area only)

**Follow:** FIRST_30_DAYS_GROWTH_PLAN.md (Week 2: Dealer Outreach)

- [ ] Share on personal social media (use posts from SOCIAL_LAUNCH_CONTENT.md)
- [ ] Post in relevant Nepal bike groups (with permission - see FIRST_30_DAYS_GROWTH_PLAN.md Week 3 for group strategy)
- [ ] Start dealer outreach (5-7 dealers/day using DEALER_OUTREACH_MESSAGES.md templates)
- [ ] Limit to Kathmandu area initially
- [ ] Ask for feedback

- [ ] Monitor:
  - User behavior (Google Analytics or Vercel Analytics)
  - Popular features (Browse filters, contact buttons, listings)
  - Pain points (User feedback via WhatsApp/email)
  - Bug reports (Sentry or Supabase logs)
  - Dealer interest (Track in DEALER_OUTREACH_TRACKER)

### Success Criteria
- [ ] No critical bugs reported
- [ ] Homepage loads consistently
- [ ] Users can complete sell flow
- [ ] Dealers can sign up and manage listings
- [ ] No database errors
- [ ] Positive user feedback

---

## 11. Pre-Full-Launch Checklist

**Before announcing to wider audience:**

**Follow:** FIRST_30_DAYS_GROWTH_PLAN.md (complete Week 1-4 before full public launch)

### Content
- [ ] 30+ quality listings across categories
- [ ] 5+ verified dealers
- [ ] 3+ blog posts published
- [ ] About page complete
- [ ] Contact information accurate

### Marketing
- [ ] Social media accounts created (Facebook, Instagram, WhatsApp Business minimum)
- [ ] Logo/branding finalized (see LAUNCH_ASSET_CHECKLIST.md)
- [ ] Marketing copy prepared (see LAUNCH_MESSAGING_KIT.md)
- [ ] Launch announcement drafted (see SOCIAL_LAUNCH_CONTENT.md)
- [ ] All marketing assets ready (see Section 8: Marketing Readiness)
- [ ] 30-day growth plan executed or in progress (see FIRST_30_DAYS_GROWTH_PLAN.md)

### Legal
- [ ] Privacy Policy live
- [ ] Terms of Service live
- [ ] Contact email set up (hello@myridenepal.com)
- [ ] Copyright notice in footer

### Support
- [ ] Email monitoring set up
- [ ] FAQ page complete (if needed)
- [ ] Support process documented
- [ ] Response time expectations set

---

## 12. Full Launch Preparation

**Follow:** FIRST_30_DAYS_GROWTH_PLAN.md (Week 3-4: Content & Visibility, Scale & Optimize)

### Marketing Channels
- [ ] Instagram post + story (use SOCIAL_LAUNCH_CONTENT.md templates)
- [ ] Facebook post (use SOCIAL_LAUNCH_CONTENT.md templates)
- [ ] TikTok video (optional - use content ideas from SOCIAL_LAUNCH_CONTENT.md)
- [ ] Reddit r/Nepal post (check rules first)
- [ ] Word of mouth (friends/family ambassadors)
- [ ] Local bike groups (5-7 groups, see FIRST_30_DAYS_GROWTH_PLAN.md Week 3)
- [ ] Dealer partnerships (30-40 onboarded by Week 4)

### Launch Day Checklist
- [ ] All systems green
- [ ] Team available for monitoring
- [ ] Support channels monitored
- [ ] Backup plan ready
- [ ] Maintenance mode script ready (if needed)

---

## Rollback Plan

If critical issues found:

1. **Minor issues:**
   - Document in issue tracker
   - Fix in next deployment
   - Communicate with affected users

2. **Major issues (site broken):**
   - Enable maintenance mode
   - Revert to previous deployment
   - Fix issue locally
   - Test thoroughly
   - Redeploy

3. **Database issues:**
   - Restore from backup (see PRODUCTION_MIGRATION_CHECKLIST.md)
   - Contact Supabase support if needed

---

## Success Metrics (First Month)

### User Metrics
- Target: 100+ registered users
- Target: 50+ listings created
- Target: 5+ verified dealers
- Target: 1,000+ page views

### Technical Metrics
- Uptime: > 99.5%
- Average page load: < 3s
- Error rate: < 1%
- Zero critical bugs

### Business Metrics
- User retention: > 50% (return visit)
- Listing completion rate: > 80%
- Dealer signup rate: 1-2 per week
- User feedback: Mostly positive

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Respond to all user feedback
- [ ] Fix critical bugs immediately
- [ ] Deploy minor improvements

### Week 2-4
- [ ] Analyze user behavior
- [ ] Improve popular features
- [ ] Add requested features (prioritize)
- [ ] Expand to more districts

### Month 2+
- [ ] Add Google Analytics insights
- [ ] Launch dealer marketing campaign
- [ ] Add premium features (if planned)
- [ ] Scale infrastructure as needed

---

## Contact & Support

**Project Owner:** MyRideNepal Team  
**Email:** hello@myridenepal.com  
**Supabase Project:** nukeyvnsvsgwyvbtertf  
**Vercel Project:** myride-nepal-marketplace

---

**Last Updated:** 22 May 2026  
**Checklist Version:** 1.0  
**Status:** Ready for Soft Launch 🚀
