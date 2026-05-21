# Phase 1 Dealer System - Testing Checklist

**Date:** May 21, 2026  
**Tester:** _______________  
**Build Version:** Latest (9.01s build time)

---

## Pre-Testing Setup

### Database Migration
- [ ] Migration applied via Supabase SQL Editor
- [ ] Verified 18 new columns exist in `dealer_profiles`
- [ ] Verified 3 new indexes created
- [ ] Test query runs without errors

### Local Development
- [ ] `npm run dev` running without errors
- [ ] No console errors in browser dev tools
- [ ] All routes accessible

---

## 1. Dealer Directory (`/dealers`)

### Page Load
- [ ] Page loads without errors
- [ ] All existing dealers display in grid
- [ ] Dealer cards show logo, name, location, brands
- [ ] Active listings count visible on cards
- [ ] Verified badge shows for verified dealers
- [ ] Flagged dealers are NOT visible

### Search Functionality
- [ ] Search by dealer name works
- [ ] Search by brand works (case-insensitive)
- [ ] Search by district works
- [ ] Search handles no results gracefully
- [ ] Clear search works (shows all again)

### District Filter
- [ ] District dropdown shows all 77 Nepal districts
- [ ] Selecting district filters results correctly
- [ ] "All Districts" shows all dealers again
- [ ] Combined with search works

### Verified Toggle
- [ ] "Verified only" checkbox works
- [ ] Toggling shows only verified dealers
- [ ] Toggling back shows all dealers
- [ ] Combined with search and district filter works

### Responsive Design
- [ ] Desktop (1920px): 3-column grid
- [ ] Tablet (768px): 2-column grid
- [ ] Mobile (375px): 1-column, all content readable
- [ ] Search bar full-width on mobile

### Edge Cases
- [ ] No dealers: Shows empty state
- [ ] No search results: Shows "No dealers found" message
- [ ] Very long dealer names: Text wraps correctly
- [ ] Missing logo: Fallback icon shows

---

## 2. Dealer Profile (`/dealers/:slug`)

### Page Load
- [ ] Page loads for existing dealer
- [ ] 404 page shows for non-existent slug
- [ ] Error page shows for server errors

### Header Section
- [ ] Banner image displays (if exists)
- [ ] Logo displays (or fallback icon)
- [ ] Business name displays correctly
- [ ] Verified badge shows (if verified)
- [ ] **NEW:** District displays (not old location)
- [ ] **NEW:** Years in business displays with Calendar icon
- [ ] Description displays (if exists)
- [ ] Brands carried show as badges

### Services Section (NEW)
- [ ] Section visible when at least 1 service enabled
- [ ] "Exchange accepted" shows with green checkmark
- [ ] "Financing available" shows with green checkmark
- [ ] "Service centre" shows with green checkmark
- [ ] Service areas show (max 10 districts)
- [ ] "+X more" badge shows when >10 districts
- [ ] Section hidden when no services enabled

### Contact Sidebar (NEW)
- [ ] Sidebar is sticky on desktop (scrolls with page)
- [ ] "Contact Showroom" heading displays
- [ ] **Call Now button:** Shows if phone exists, opens tel: link
- [ ] **WhatsApp button:** Shows if whatsapp exists, opens wa.me with message
- [ ] **Opening hours:** Shows if data exists, formatted as table
- [ ] **Full address:** Shows if exists, formatted correctly
- [ ] **View on Map button:** Opens Google Maps search with address
- [ ] **Social icons:** Facebook, Instagram, YouTube, TikTok (only if URLs exist)
- [ ] Social links open in new tab

### Opening Hours Display
- [ ] Days shown in correct format (Monday, Tuesday, etc.)
- [ ] Times displayed correctly (e.g., "9 AM - 6 PM")
- [ ] "Closed" days show correctly
- [ ] Missing days don't display
- [ ] Entire section hidden if no opening_hours data

### Buyer Protection Tips (NEW)
- [ ] Amber card displays below inventory
- [ ] AlertTriangle icon shows
- [ ] All 4 tips display with checkmarks:
  1. "Always inspect the bike thoroughly before making any payment"
  2. "Meet at the dealer's showroom address for safety"
  3. "Never pay 100% in advance without receiving the bike"
  4. "Check the bluebook and confirm ownership transfer process"

### Inventory Section
- [ ] "Inventory (X)" heading with count
- [ ] Listings display in 2-column grid
- [ ] ListingCard component works as before
- [ ] No listings: Shows "No active listings yet" message
- [ ] Listings are NOT flagged/removed

### Layout & Responsive
- [ ] Desktop: 2-column layout (main content 66%, sidebar 33%)
- [ ] Sidebar is sticky (doesn't scroll away)
- [ ] Tablet: Sidebar moves below main content
- [ ] Mobile: Full-width stacked layout
- [ ] All text readable, no overflow issues

### Edge Cases
- [ ] Dealer with no phone/whatsapp: Contact buttons hidden
- [ ] Dealer with no social links: Social section hidden
- [ ] Dealer with no full address: Map button hidden
- [ ] Dealer with no opening hours: Hours section hidden
- [ ] Dealer with no services: Services section hidden
- [ ] Long WhatsApp message: Displays correctly in preview
- [ ] Special characters in address: Handled correctly

---

## 3. Dealer Signup/Edit (`/dealer-signup`)

### Page Load & Authentication
- [ ] Logged out: Redirects to `/auth` with return URL
- [ ] Logged in (no profile): Shows "Become a dealer" heading
- [ ] Logged in (existing profile): Shows "Edit dealer profile" heading
- [ ] Form pre-fills with existing data when editing

### Business Information Section
- [ ] Section heading with Building2 icon shows
- [ ] Business name input (required)
- [ ] Description textarea (optional)
- [ ] Years in business number input (optional)
- [ ] Validation: Business name required on submit

### Location Section (NEW)
- [ ] Section heading with MapPin icon shows
- [ ] District dropdown shows all 77 districts (required)
- [ ] Full address textarea (optional)
- [ ] Validation: District required on submit

### Contact Section (NEW)
- [ ] Section heading with Phone icon shows
- [ ] Phone input (tel type, optional)
- [ ] WhatsApp input (tel type, optional)
- [ ] No format validation (accepts any format)

### Branding & Social Section
- [ ] Section heading with Globe2 icon shows
- [ ] Logo URL input (optional)
- [ ] Banner URL input (optional)
- [ ] Facebook URL input (optional)
- [ ] Instagram URL input (optional)
- [ ] YouTube URL input (optional)
- [ ] TikTok URL input (optional)
- [ ] All 6 social inputs visible in 2-column grid

### Brands Section
- [ ] "Brands carried" heading shows
- [ ] All popular brands show as checkboxes
- [ ] Checkboxes toggle on/off
- [ ] Multiple brands can be selected
- [ ] Pre-selected brands checked when editing

### Services Section (NEW)
- [ ] Section heading with Wrench icon shows
- [ ] **Exchange accepted:** Switch with description "Accept bikes in exchange"
- [ ] **Financing available:** Switch with description "Offer loan/EMI options"
- [ ] **Service centre:** Switch with description "Have repair & maintenance"
- [ ] All 3 switches toggle correctly
- [ ] Switches show current state when editing

### Service Areas Section (NEW)
- [ ] Heading shows selected count: "Service areas (X selected)"
- [ ] Help text: "Which districts do you serve?"
- [ ] All 77 districts show as checkboxes in grid
- [ ] Checkboxes toggle on/off
- [ ] Multiple districts can be selected
- [ ] Scrollable (max-height 240px)
- [ ] Count updates as districts selected
- [ ] Pre-selected districts checked when editing

### Slug Field (Edit Mode Only)
- [ ] Shows only when editing existing profile
- [ ] Input is disabled (grayed out)
- [ ] Shows current slug value
- [ ] Cannot be changed

### Form Submission
- [ ] Submit button shows correct text:
  - New profile: "Create dealer profile"
  - Editing: "Save changes"
- [ ] Loading spinner shows during submission
- [ ] Button disabled during submission
- [ ] Success toast shows after save:
  - New: "Dealer profile created! Your profile will be reviewed by admin for verification."
  - Edit: "Profile updated! Changes will be reviewed by admin."
- [ ] Redirects to `/dealers/:slug` after save
- [ ] New profile gets unique slug (name + random)

### Validation
- [ ] Business name required: Shows error if empty
- [ ] District required: Shows error if empty
- [ ] Years in business: Accepts positive integers only
- [ ] Other fields optional: Can be left empty
- [ ] Long descriptions: Accepted without issues

### Data Persistence
- [ ] Phone/WhatsApp saved correctly
- [ ] All 4 social URLs saved correctly
- [ ] Years in business saved as integer
- [ ] Service switches saved as booleans
- [ ] Service area array saved correctly
- [ ] District saved to both `district` and `location` fields
- [ ] Empty fields saved as `null` (not empty strings)

### Responsive Design
- [ ] Desktop: 2-column grids for inputs
- [ ] Mobile: Full-width single column
- [ ] Form fits in max-width 2xl container
- [ ] All sections have proper spacing
- [ ] Section borders show clearly

---

## 4. Admin Panel (`/admin`)

### Page Load
- [ ] Page accessible (admin users only)
- [ ] Three sections show: Flagged / Verified / Unverified
- [ ] Stats summary shows at top
- [ ] Dealers sorted correctly in each section

### Flag Management
- [ ] Unverified dealers have "Flag" button
- [ ] Clicking "Flag" moves dealer to Flagged section
- [ ] Flagged dealers have "Unflag" button
- [ ] Clicking "Unflag" moves dealer back
- [ ] Flagged dealers hidden from public `/dealers` page

### Verify Management
- [ ] Unverified dealers have "Verify" button
- [ ] Clicking "Verify" moves dealer to Verified section
- [ ] Verified dealers have "Unverify" button
- [ ] Clicking "Unverify" moves dealer back
- [ ] Verified badge shows on profile pages

### Display & UI
- [ ] Active listings count shows per dealer
- [ ] Color-coded badges:
  - Red badge for flagged dealers
  - Green badge for verified dealers
  - Gray badge for unverified dealers
- [ ] Loading skeletons show while fetching
- [ ] Stats update after flag/verify actions

### Edge Cases
- [ ] No dealers: Empty sections show gracefully
- [ ] Action errors: Error toast shows
- [ ] Multiple rapid clicks: Handled correctly
- [ ] Network errors: User-friendly error message

---

## 5. Integration Testing

### Dealer Lifecycle
- [ ] Create new dealer profile via `/dealer-signup`
- [ ] View profile at `/dealers/:slug`
- [ ] Edit profile via `/dealer-signup` (loads existing data)
- [ ] Admin flags dealer (disappears from `/dealers`)
- [ ] Admin unflags dealer (reappears on `/dealers`)
- [ ] Admin verifies dealer (badge shows)
- [ ] Search finds dealer by name/brand/district

### Cross-Page Consistency
- [ ] Dealer name same on directory, profile, admin
- [ ] District shows consistently (not old location)
- [ ] Verified badge shows on directory + profile
- [ ] Active listings count accurate across all pages
- [ ] Logo/banner images consistent

### Contact Flow
- [ ] User finds dealer on `/dealers`
- [ ] Clicks dealer card → Goes to profile
- [ ] Sees phone number → Clicks "Call Now" → Opens phone app
- [ ] Sees WhatsApp → Clicks "WhatsApp" → Opens WhatsApp with prefilled message
- [ ] Sees address → Clicks "View on Map" → Opens Google Maps
- [ ] Sees social links → Clicks icon → Opens social page in new tab

### Data Validation
- [ ] Years in business shows correctly (integer)
- [ ] Opening hours format correct (if set manually via SQL)
- [ ] Service areas array handled correctly
- [ ] Phone numbers clickable (tel: links work)
- [ ] WhatsApp numbers clickable (wa.me links work)
- [ ] Social URLs open in new tabs

---

## 6. Performance & UX

### Page Load Times
- [ ] `/dealers` loads in <2 seconds
- [ ] `/dealers/:slug` loads in <2 seconds
- [ ] `/dealer-signup` loads in <2 seconds
- [ ] `/admin` loads in <2 seconds

### Interactions
- [ ] Search responds instantly (<100ms)
- [ ] Filters apply immediately
- [ ] Form inputs responsive (no lag)
- [ ] Image loading lazy (doesn't block page)

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid data handled gracefully
- [ ] 404 pages styled correctly
- [ ] Error boundaries catch React errors

---

## 7. Security & Permissions

### Public Access
- [ ] Anyone can view `/dealers`
- [ ] Anyone can view `/dealers/:slug`
- [ ] Logged-out users redirected from `/dealer-signup`
- [ ] Flagged dealers NOT visible to public

### Authenticated Access
- [ ] Logged-in users can access `/dealer-signup`
- [ ] Users can create their own dealer profile
- [ ] Users can edit only their own profile
- [ ] Cannot edit other dealers' profiles

### Admin Access
- [ ] Only admins can access `/admin`
- [ ] Admins can flag/unflag any dealer
- [ ] Admins can verify/unverify any dealer

### RLS (Row-Level Security)
- [ ] Users can read all dealer profiles
- [ ] Users can insert only their own profile
- [ ] Users can update only their own profile
- [ ] Cannot delete profiles via UI

---

## 8. Browser Compatibility

Test on multiple browsers:

### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Safari (macOS/iOS)
- [ ] All features work
- [ ] Styling correct
- [ ] Tel/WhatsApp links work on iOS

---

## 9. Known Limitations (Expected)

These are NOT bugs, just Phase 1 scope:

- [ ] Opening hours NOT editable via form (requires manual SQL update)
- [ ] No image upload UI (must paste URLs)
- [ ] No rich text editor for description
- [ ] No analytics dashboard (Phase 2)
- [ ] No reviews system (Phase 2)
- [ ] No lead capture (Phase 2)
- [ ] No bulk CSV import (Phase 2)
- [ ] No email notifications (Phase 2)

---

## 10. Deployment Checklist

Before deploying to production:

- [ ] All tests above passed ✅
- [ ] Database migration applied to production
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] Environment variables set correctly
- [ ] SSL certificate valid
- [ ] Domain configured
- [ ] Monitoring/logging enabled

---

## Test Results Summary

**Total Tests:** ~150  
**Passed:** _____  
**Failed:** _____  
**Skipped:** _____  

**Critical Issues Found:** _____  
**Non-Critical Issues Found:** _____  

**Tester Signature:** _______________  
**Date Completed:** _______________  

**Ready for Production?** ⬜ Yes  ⬜ No  ⬜ With fixes

---

## Issues Log

Use this section to document any bugs found:

### Issue #1
- **Severity:** High / Medium / Low
- **Page:** _____
- **Description:** _____
- **Steps to Reproduce:**
  1. _____
  2. _____
- **Expected:** _____
- **Actual:** _____
- **Screenshot/Video:** _____

### Issue #2
- **Severity:** High / Medium / Low
- **Page:** _____
- **Description:** _____
- **Steps to Reproduce:**
  1. _____
  2. _____
- **Expected:** _____
- **Actual:** _____
- **Screenshot/Video:** _____

*(Add more as needed)*

---

## Notes

- Migration SQL can be run via Supabase Dashboard SQL Editor
- See `MANUAL_MIGRATION_GUIDE.md` for migration instructions
- See `DEALER_PHASE1_COMPLETION.md` for full implementation details
- See `DEALER_PHASE1_FIELDS.md` for database schema reference
