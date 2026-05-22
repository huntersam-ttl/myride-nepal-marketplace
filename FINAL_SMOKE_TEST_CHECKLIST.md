# Final Smoke Test Checklist

**Date:** 22 May 2026  
**Purpose:** Pre-deployment testing checklist for all routes and features  
**Estimated Time:** 45-60 minutes

---

## Testing Instructions

**Environment:** Test on production URL after deployment  
**Browsers:** Chrome (Desktop), Safari (Mobile iOS), Chrome (Mobile Android)  
**For each route, verify:**
- ✅ Loads without blank screen or infinite loading
- ✅ No red console errors (warnings OK)
- ✅ Mobile layout responsive (no horizontal scroll, touch targets adequate)
- ✅ Primary buttons/actions work
- ✅ Empty state works if no data exists

---

## Public Routes (No Login Required)

### 1. Homepage: `/`
- [ ] Page loads within 3 seconds
- [ ] Hero section displays
- [ ] Stats bar shows (real count or "Growing")
- [ ] Browse by brand tags work
- [ ] Latest listings show (or "No listings yet" empty state)
- [ ] "How it works" section displays
- [ ] Buyer safety section displays
- [ ] Footer links work
- [ ] Mobile: Hamburger menu opens/closes
- [ ] Mobile: All sections stack properly
- [ ] Console: No red errors

**Expected:** Professional homepage, no fake claims ("Nepal's #1"), stats realistic

---

### 2. Browse: `/browse`
- [ ] Page loads
- [ ] Filter sidebar visible (brand, district, price, year, condition)
- [ ] Search bar works
- [ ] Listings display (or "No bikes found" empty state)
- [ ] Listing cards show: image, title, price, location, contact button
- [ ] Pagination works (if 10+ listings)
- [ ] Filter combination works (e.g., Hero + Kathmandu + under 300k)
- [ ] Click listing card → goes to detail page
- [ ] Mobile: Filters collapse/expand properly
- [ ] Console: No red errors

**Expected:** Functional browse page with working filters

---

### 3. Listing Detail: `/listings/:id` (pick any active listing)
- [ ] Page loads
- [ ] All images display
- [ ] Image lightbox works (click to enlarge)
- [ ] Title, price, specs display
- [ ] Description shows
- [ ] Seller info card displays (name, phone, WhatsApp)
- [ ] "Contact Seller" (WhatsApp) button opens WhatsApp with pre-filled message
- [ ] "Call" button opens phone dialer
- [ ] "Save" button works (prompts login if not logged in)
- [ ] Share buttons work (copy link)
- [ ] Related listings show (if available)
- [ ] Mobile: All buttons reachable
- [ ] Console: No red errors

**Expected:** Complete listing detail with working contact buttons

---

### 4. Sell: `/sell`
- [ ] Page loads
- [ ] Hero section explains process
- [ ] "List Your Bike" button scrolls to form or requires login
- [ ] If logged in: Form displays with all fields
- [ ] Mobile: Form fields stack properly
- [ ] Console: No red errors

**Expected:** Clear sell page with CTA

---

### 5. Dealers Directory: `/dealers`
- [ ] Page loads
- [ ] Dealer cards display (or "No dealers yet" empty state)
- [ ] Dealer cards show: logo, name, location, brands, verified badge (if verified)
- [ ] District filter works
- [ ] Click dealer card → goes to dealer profile
- [ ] Mobile: Cards stack properly
- [ ] Console: No red errors

**Expected:** Clean dealer directory

---

### 6. Dealer Profile: `/dealers/:slug` (pick any dealer)
- [ ] Page loads
- [ ] Banner image displays (or default color)
- [ ] Logo displays
- [ ] Business name, location, verified badge (if verified)
- [ ] Contact card with phone/WhatsApp buttons
- [ ] "Report this dealer" button visible at bottom of contact card
- [ ] Opening hours display
- [ ] Brands carried display
- [ ] Inventory section shows dealer's listings (or "No listings yet")
- [ ] Mobile: All sections responsive
- [ ] Console: No red errors

**Test Report Dealer (if logged in or anonymous):**
- [ ] Click "Report this dealer" button
- [ ] Dialog opens
- [ ] Reason dropdown shows 5 options (fake listing, wrong price, scam, unresponsive, other)
- [ ] Submit button disabled until reason selected
- [ ] Select reason, submit
- [ ] Success toast: "Thank you. Our team will review this report."
- [ ] Dialog closes

**Expected:** Professional dealer profile with working report system

---

### 7. Dealer Beta: `/dealer-beta`
- [ ] Page loads
- [ ] Hero section explains beta program
- [ ] Benefits listed (free listings, verified badge, analytics, zero commission)
- [ ] "Apply for Beta Access" button works
- [ ] Mobile: Content readable
- [ ] Console: No red errors

**Expected:** Clear beta program page, no fake claims ("first 50 dealers" or similar)

---

### 8. Blog Index: `/blog`
- [ ] Page loads
- [ ] Blog post cards display (or "No articles yet" empty state)
- [ ] Click post → goes to blog detail
- [ ] Mobile: Cards stack properly
- [ ] Console: No red errors

**Expected:** Clean blog listing

---

### 9. Blog Detail: `/blog/:slug` (if posts exist)
- [ ] Page loads
- [ ] Featured image displays
- [ ] Title, date, content display
- [ ] Readable formatting
- [ ] Mobile: Text wraps properly
- [ ] Console: No red errors

**Expected:** Readable blog post

---

### 10. Price Estimator: `/price-estimator`
- [ ] Page loads
- [ ] Form displays with brand, model, year, mileage, condition fields
- [ ] Estimate button works
- [ ] Result shows estimated price range
- [ ] Mobile: Form fields work
- [ ] Console: No red errors

**Expected:** Working price estimator tool

---

### 11. Safety Tips: `/safety-tips`
- [ ] Page loads
- [ ] Buyer safety section displays
- [ ] Seller safety section displays
- [ ] Scam prevention tips display
- [ ] Document verification tips display
- [ ] Mobile: Content readable
- [ ] Console: No red errors

**Expected:** Comprehensive safety guide

---

### 12. Contact: `/contact` (if exists)
- [ ] Page loads
- [ ] Contact information displays (email, WhatsApp, phone)
- [ ] Mobile: Links work (tel:, mailto:, WhatsApp)
- [ ] Console: No red errors

**Expected:** Working contact page

---

## Dealer Routes (Login as Dealer Required)

**Login first:** Go to `/auth`, sign up/login as dealer

---

### 13. Dealer Signup: `/dealer-signup`
- [ ] Page loads
- [ ] Form displays with all fields:
  - Business name
  - District/city
  - Address
  - Contact (phone, WhatsApp, email)
  - Logo upload
  - Banner upload
  - Description
  - Opening hours
  - Brands carried
- [ ] Form validation works (required fields)
- [ ] Submit button works
- [ ] Success → redirects to dealer dashboard
- [ ] Mobile: All fields accessible
- [ ] Console: No red errors

**Expected:** Complete dealer signup flow

---

### 14. Dealer Dashboard Overview: `/dealer/dashboard`
- [ ] Page loads
- [ ] Welcome message or dashboard overview
- [ ] Navigation tabs visible: Overview, Inventory, Leads, Analytics, Share, Onboarding, Settings
- [ ] Stats cards show (total listings, active listings, total leads, etc.)
- [ ] Mobile: Tabs scroll horizontally or stack
- [ ] Console: No red errors

**Expected:** Clean dashboard home

---

### 15. Inventory: `/dealer/dashboard/inventory`
- [ ] Page loads
- [ ] Listing cards display (or "No listings yet" empty state)
- [ ] "Add Listing" button visible and works
- [ ] "Import CSV" button visible
- [ ] Edit listing button works (per listing)
- [ ] Delete listing button works (per listing)
- [ ] Filters work (all, active, pending, sold)
- [ ] Mobile: Cards stack properly
- [ ] Console: No red errors

**Expected:** Working inventory management

---

### 16. CSV Import: `/dealer/dashboard/inventory/import`
- [ ] Page loads
- [ ] CSV template download button works
- [ ] Upload CSV button visible
- [ ] Instructions clear
- [ ] Mobile: Upload works
- [ ] Console: No red errors

**Expected:** CSV import tool ready

---

### 17. Leads: `/dealer/dashboard/leads`
- [ ] Page loads
- [ ] Lead cards display (or "No leads yet" empty state)
- [ ] Each lead shows: buyer name, listing, contact info, date, source
- [ ] Filter by status (new, contacted, won, lost)
- [ ] Mark as contacted/won/lost buttons work
- [ ] Mobile: Cards stack properly
- [ ] Console: No red errors

**Expected:** Working lead management

---

### 18. Analytics: `/dealer/dashboard/analytics`
- [ ] Page loads
- [ ] Time range selector (7/30/90 days) works
- [ ] 7 stat cards display:
  - Profile views
  - Listing views
  - WhatsApp clicks
  - Phone clicks
  - Total leads
  - Sold leads
  - Conversion rate
- [ ] Top 5 listings by views (with progress bars)
- [ ] Top 5 listings by leads (with progress bars)
- [ ] Lead source breakdown
- [ ] If no data: "No data yet" empty state shows
- [ ] Mobile: Cards stack properly, charts readable
- [ ] Console: No red errors

**Expected:** Complete analytics dashboard with empty state handling

---

### 19. Share Card Generator: `/dealer/dashboard/share`
- [ ] Page loads
- [ ] Listing dropdown shows all active listings (or "No listings" empty state)
- [ ] Select listing → preview card appears with:
  - Bike image
  - Title
  - Price (formatted NPR)
  - Year, condition, mileage
  - Dealer name, location
  - MyRideNepal branding
- [ ] 4 copy buttons: Facebook, Instagram, TikTok, WhatsApp
- [ ] Click each button → "Caption copied!" toast appears
- [ ] Check mark appears briefly after copy
- [ ] Paste clipboard to verify captions:
  - Facebook: Long format with hashtags
  - Instagram: Short with emojis and hashtags
  - TikTok: Trendy with fire emoji and hashtags
  - WhatsApp: Clean message, no hashtags
- [ ] Mobile: Preview card and buttons work
- [ ] Console: No red errors

**Expected:** Working share card generator with platform-specific captions

---

### 20. Onboarding: `/dealer/dashboard/onboarding`
- [ ] Page loads
- [ ] Checklist displays with steps:
  - Complete profile
  - Add first listing
  - Verify account (if applicable)
  - Explore dashboard
- [ ] Progress indicator shows
- [ ] Mobile: Checklist readable
- [ ] Console: No red errors

**Expected:** Clear onboarding guide

---

### 21. Settings: `/dealer/dashboard/settings`
- [ ] Page loads
- [ ] Navigation tabs: Profile, Team, Notifications, Security
- [ ] Each tab link works
- [ ] Mobile: Tabs accessible
- [ ] Console: No red errors

**Expected:** Settings navigation

---

### 22. Settings - Profile: `/dealer/dashboard/settings/profile`
- [ ] Page loads
- [ ] Form pre-filled with dealer info
- [ ] All fields editable (business name, location, description, hours, brands)
- [ ] Logo/banner upload works
- [ ] Save button works
- [ ] Success toast appears after save
- [ ] Mobile: Form fields work
- [ ] Console: No red errors

**Expected:** Working profile edit form

---

### 23. Settings - Team: `/dealer/dashboard/settings/team`
- [ ] Page loads
- [ ] Staff list displays (or "No team members yet" empty state)
- [ ] "Add Team Member" button visible
- [ ] Add form works (email, role)
- [ ] Remove staff button works
- [ ] Mobile: List and form work
- [ ] Console: No red errors

**Expected:** Team management working

---

### 24. Settings - Notifications: `/dealer/dashboard/settings/notifications`
- [ ] Page loads
- [ ] Notification preferences show (email, push, in-app)
- [ ] Toggle switches work for each preference
- [ ] Save button works
- [ ] Success toast after save
- [ ] Mobile: Toggles work
- [ ] Console: No red errors

**Expected:** Notification settings working

---

### 25. Settings - Security: `/dealer/dashboard/settings/security`
- [ ] Page loads
- [ ] Change password form displays
- [ ] Current password, new password, confirm password fields work
- [ ] Submit button works
- [ ] Success toast or error message appears
- [ ] Mobile: Form works
- [ ] Console: No red errors

**Expected:** Password change working

---

## Admin Routes (Login as Admin Required)

**Login first:** Go to `/auth`, login with admin credentials

---

### 26. Admin Dashboard: `/admin`
- [ ] Page loads (or redirects to access denied if not admin)
- [ ] Stats cards display (pending listings, total users, total dealers, reports, etc.)
- [ ] Pending listings section shows (or "No pending listings")
- [ ] Approve/reject buttons work
- [ ] Mobile: Admin panel usable
- [ ] Console: No red errors

**Expected:** Working admin dashboard (or proper access denied message)

---

## Buyer Routes (Login Required)

**Login first:** Go to `/auth`, sign up/login as regular user

---

### 27. Notifications: `/notifications`
- [ ] Page loads
- [ ] Notification list displays (or "No notifications yet" empty state)
- [ ] Unread notifications marked differently
- [ ] Mark as read button works
- [ ] Click notification → goes to relevant page
- [ ] Mobile: List readable
- [ ] Console: No red errors

**Expected:** Working notifications page

---

### 28. Saved Listings: `/saved` (if route exists)
- [ ] Page loads
- [ ] Saved listings display (or "No saved bikes" empty state)
- [ ] Unsave button works per listing
- [ ] Click listing → goes to detail page
- [ ] Mobile: Cards stack properly
- [ ] Console: No red errors

**Expected:** Saved listings management

---

## Authentication Flow Tests

### 29. Sign Up: `/auth`
- [ ] Sign up form displays
- [ ] Email/password fields work
- [ ] Sign up button works
- [ ] Verification email sent (check inbox)
- [ ] Success message or redirect to dashboard
- [ ] Mobile: Form works
- [ ] Console: No red errors

**Expected:** Working sign up flow

---

### 30. Login: `/auth`
- [ ] Login form displays
- [ ] Email/password fields work
- [ ] Login button works
- [ ] Redirect to previous page or dashboard
- [ ] Mobile: Form works
- [ ] Console: No red errors

**Expected:** Working login flow

---

### 31. Logout
- [ ] Click logout button (in navbar or user menu)
- [ ] User logged out
- [ ] Redirect to homepage
- [ ] Protected routes now require login
- [ ] Console: No red errors

**Expected:** Clean logout

---

## Mobile-Specific Tests

### 32. Mobile Navigation
- [ ] Hamburger menu icon visible on mobile
- [ ] Menu opens smoothly
- [ ] All navigation links visible
- [ ] Menu closes after clicking link
- [ ] No horizontal scroll on any page
- [ ] Touch targets minimum 44×44px

**Expected:** Smooth mobile navigation

---

### 33. Mobile Forms
- [ ] All form fields tappable
- [ ] Keyboard doesn't block submit button
- [ ] Dropdowns work (brand, district, etc.)
- [ ] Date pickers work
- [ ] File upload works (camera/gallery)

**Expected:** Usable forms on mobile

---

### 34. Mobile Contact Buttons
- [ ] WhatsApp button opens WhatsApp app with pre-filled message
- [ ] Phone button opens phone dialer
- [ ] Both work from listing detail and dealer profile
- [ ] No broken links

**Expected:** Contact buttons work natively on mobile

---

## Performance Tests

### 35. Page Load Speed
- [ ] Homepage loads in < 3 seconds (first visit)
- [ ] Browse page loads in < 2 seconds
- [ ] Listing detail loads in < 2 seconds
- [ ] Dashboard loads in < 2 seconds

**Expected:** Fast page loads

---

### 36. Image Loading
- [ ] Images load progressively (lazy loading)
- [ ] No broken image icons
- [ ] Image lightbox smooth
- [ ] Images don't cause layout shift

**Expected:** Smooth image experience

---

## Edge Cases & Empty States

### 37. No Data Scenarios
- [ ] Browse page with no listings: Shows "No bikes found" with helpful message
- [ ] Dealer directory with no dealers: Shows "No dealers yet"
- [ ] Dealer profile with no listings: Shows "No listings yet" with "Add Listing" button
- [ ] Dashboard with no leads: Shows "No leads yet" with tips
- [ ] Analytics with no data: Shows "No data yet" with explanation
- [ ] Share page with no listings: Shows "No listings" with "Create Listing" button
- [ ] Notifications page with no notifications: Shows "No notifications yet"
- [ ] Saved listings with no saved bikes: Shows "No saved bikes" with "Browse Bikes" button

**Expected:** All empty states friendly and helpful (no ugly blank pages)

---

### 38. Error Handling
- [ ] Visit non-existent listing `/listings/fake-id` → Shows 404 or "Listing not found"
- [ ] Visit non-existent dealer `/dealers/fake-slug` → Shows 404 or "Dealer not found"
- [ ] Submit form with missing required fields → Shows validation errors
- [ ] Network error during action → Shows error toast

**Expected:** Graceful error handling

---

## Final Checks

### 39. Marketing Copy Review
- [ ] Homepage hero: No "thousands of listings" fake claims ✅
- [ ] Homepage stats: Shows real count or "Growing" ✅
- [ ] Dealer beta page: Honest about being new/beta ✅
- [ ] No "Nepal's #1" or "biggest marketplace" claims ✅
- [ ] All copy emphasizes "free" and "no commission" ✅

**Expected:** Realistic, honest marketing copy

---

### 40. Console & Network Errors
- [ ] Open browser DevTools
- [ ] Navigate through all major pages
- [ ] Console tab: No red errors (warnings OK)
- [ ] Network tab: All API calls return 200/201 (not 500/404)
- [ ] No CORS errors
- [ ] No authentication errors on public pages

**Expected:** Clean console and network logs

---

## Summary Checklist

After testing all routes above, verify:

- [ ] **All public routes load** (1-12)
- [ ] **All dealer routes work** (13-25)
- [ ] **Admin dashboard accessible** (26)
- [ ] **Buyer routes work** (27-28)
- [ ] **Auth flows work** (29-31)
- [ ] **Mobile experience smooth** (32-34)
- [ ] **Performance acceptable** (35-36)
- [ ] **Empty states friendly** (37)
- [ ] **Error handling graceful** (38)
- [ ] **Marketing copy realistic** (39)
- [ ] **No console errors** (40)

---

## If Issues Found

**Critical (blocks deployment):**
- Blank screens / infinite loading
- Red console errors on public pages
- Broken contact buttons (WhatsApp/phone)
- Authentication completely broken
- Build errors

**High Priority (fix ASAP after deployment):**
- Mobile layout broken on key pages
- Forms don't submit
- Empty states missing
- Admin dashboard broken

**Medium Priority (fix within 48 hours):**
- Filters don't work properly
- Some images not loading
- Minor layout issues on mobile

**Low Priority (fix within 1 week):**
- Missing empty state messages
- Styling inconsistencies
- Console warnings (not errors)

---

## Test Results Template

```
Date: ___________
Tester: ___________
Environment: Production / Staging
Browser: ___________
Device: Desktop / Mobile (iOS/Android)

Public Routes: ___/12 passed
Dealer Routes: ___/13 passed
Admin Routes: ___/1 passed
Buyer Routes: ___/2 passed
Auth Flows: ___/3 passed
Mobile Tests: ___/3 passed
Performance: ___/2 passed
Edge Cases: ___/2 passed
Final Checks: ___/2 passed

TOTAL: ___/40 passed

Critical Issues: ___________
High Priority Issues: ___________
Medium Priority Issues: ___________
Low Priority Issues: ___________

Notes:
___________________________________________
```

---

**Last Updated:** 22 May 2026  
**Total Test Cases:** 40  
**Estimated Time:** 45-60 minutes  
**Status:** Ready for use after deployment
