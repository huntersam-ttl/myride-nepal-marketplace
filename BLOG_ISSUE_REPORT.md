# Blog Issue Investigation Report

## Date: 21 May 2026

## Issue Summary
Blog articles not appearing on the blog page despite being published in the database.

## Root Cause Analysis

### Investigation Steps Performed:
1. ✅ Checked Supabase connection - **Connected correctly**
2. ✅ Checked environment variables - **Properly configured**
3. ✅ Queried blog_posts table - **1 published article found**
4. ✅ Checked article status - **published = true**
5. ❌ **FOUND ISSUE**: Article slug is a YouTube URL instead of a valid slug

### Exact Problem:
```json
{
  "id": "2a057916-4a5d-4b96-b392-9ebe32c97d03",
  "title": "Bikes in Nepal: More Than Just Transport",
  "slug": "https://youtu.be/pOM-SuqPzl8?si=vr39kHzVAus8fwKL",  ← INVALID!
  "published": true
}
```

The slug field contains a full YouTube URL instead of a URL-friendly slug like `bikes-in-nepal-more-than-transport`.

### Why This Breaks the Site:
- TanStack Router tries to navigate to: `/blog/https://youtu.be/pOM-SuqPzl8?si=vr39kHzVAus8fwKL`
- This creates an invalid URL path
- Browser cannot navigate to this route
- Article appears in database but not on blog page

## Solution Implemented

### 1. Added Slug Validation (src/routes/blog.tsx)
```typescript
// Filter out posts with invalid slugs (URLs, special characters)
const validPosts = (data ?? []).filter(p => {
  if (!p.slug) return false;
  // Slug should not contain :// (URLs) or special URL characters
  if (p.slug.includes('://') || p.slug.includes('?') || p.slug.includes('&')) {
    console.warn(`[Blog] Skipping post "${p.title}" - invalid slug: ${p.slug}`);
    return false;
  }
  return true;
});
```

### 2. Enhanced Error Handling
- Added explicit error state display
- Shows helpful message when posts exist but have invalid slugs
- Console warnings for debugging

### 3. Improved Empty States
Three scenarios now handled:
1. **Loading**: Skeleton loaders
2. **Error**: Error message with reload button
3. **No valid posts**: 
   - If database empty: "Coming Soon"
   - If posts exist but invalid slugs: "No valid articles - contact admin"

## How to Fix Your Article

### Option 1: Update Slug via Admin Panel
1. Go to `/admin` (requires admin login)
2. Click "Blog" tab
3. Edit the article
4. Change slug from YouTube URL to: `bikes-in-nepal-more-than-transport`
5. Save

### Option 2: Update Directly in Supabase
```sql
UPDATE blog_posts 
SET slug = 'bikes-in-nepal-more-than-transport'
WHERE id = '2a057916-4a5d-4b96-b392-9ebe32c97d03';
```

## Valid Slug Requirements
- ✅ Use lowercase letters
- ✅ Use hyphens for spaces
- ✅ Only alphanumeric and hyphens
- ❌ No special characters (?, &, =, etc.)
- ❌ No URLs (://, http://, etc.)
- ❌ No spaces

### Examples:
- ✅ Good: `bikes-in-nepal-more-than-transport`
- ✅ Good: `top-5-bikes-2026`
- ❌ Bad: `https://youtu.be/pOM-SuqPzl8`
- ❌ Bad: `Bikes in Nepal`
- ❌ Bad: `bikes?page=1&sort=new`

## Testing After Fix

### 1. Price Estimator
- ✅ Brand dropdown shows 21 brands (Bajaj, TVS, Yamaha, etc.)
- ✅ Selecting brand updates model dropdown
- ✅ Model dropdown shows brand-specific models
- ✅ Base prices calculated correctly

### 2. Blog Page
After fixing the slug:
- Article should appear on blog page
- Clicking article should navigate to `/blog/bikes-in-nepal-more-than-transport`
- Article detail page should display content

## Files Changed
- `src/routes/blog.tsx` - Added slug validation and error handling
- `src/routes/price-estimator.tsx` - Integrated vehicle brands data
- `src/data/vehicleBrands.ts` - Created comprehensive brand/model dataset
- `src/components/ListingCard.tsx` - Mileage null handling (previous fix)
- Other pointer-events fixes (previous session)

## Build Status
✅ Build successful: 7.20s
✅ No TypeScript errors
✅ Blog bundle: 8.16 kB (2.56 kB gzipped)
✅ Price estimator bundle: 16.17 kB (4.92 kB gzipped)

## Next Steps
1. Fix the article slug in database
2. Refresh blog page
3. Article should now appear
4. Click article to verify detail page works
5. If satisfied, commit and push changes
