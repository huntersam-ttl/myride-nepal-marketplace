# MyRideNepal Brand Assets

**Last Updated:** May 23, 2026  
**Location:** `public/brand/`

This directory contains all brand logos and visual assets for MyRideNepal marketplace.

---

## Active Logo Files

### Navbar Logo (Current)
**File:** `logo-navbar-v3.svg` ✅ **ACTIVE**
- **Usage:** Website navbar header (desktop and mobile)
- **Implemented in:** `src/components/Logo.tsx`
- **Size:** 1.7 KB
- **Features:**
  - M-shaped mark with premium orange location pin
  - White route/road negative space
  - "MyRideNepal" wordmark in single Deep Navy color
  - Subtle pin drop animation (700ms, respects prefers-reduced-motion)
- **Colors:**
  - Deep Navy: `#0B1D3A` (M shape, wordmark)
  - Premium Orange: `#FF6A00` (location pin)
  - White: `#FFFFFF` (route negative space)

**Current Implementation:**
```tsx
<img
  src="/brand/logo-navbar-v3.svg"
  alt="MyRideNepal"
  className="h-8 w-auto"
/>
```

---

## Active Favicon Files

All favicon files are located in `public/` (not in `public/brand/`):

### 1. Primary Favicon
**File:** `/favicon.svg` ✅ **ACTIVE**
- **Referenced in:** `index.html` line 8
- **Link tag:** `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- **Size:** 351 bytes
- **Design:** Simplified M mark with orange route accent on navy background

### 2. 32x32 Favicon
**File:** `/favicon-32x32.svg` ✅ **ACTIVE**
- **Referenced in:** `index.html` line 9
- **Link tag:** `<link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />`
- **Size:** 351 bytes
- **Design:** Same as primary favicon (64x64 viewBox, scales to 32x32)

### 3. Apple Touch Icon
**File:** `/apple-touch-icon.svg` ✅ **ACTIVE**
- **Referenced in:** `index.html` line 10
- **Link tag:** `<link rel="apple-touch-icon" href="/apple-touch-icon.svg" />`
- **Size:** 351 bytes
- **Design:** Same as primary favicon (optimized for iOS home screen)

**Favicon Design:**
- Deep Navy background: `#0B1D3A` with 14px border radius
- White M shape: `#FFFFFF`
- Orange route stroke: `#FF6A00`
- Simplified mark only (no wordmark in favicon)

---

## Possible Cleanup Candidates

### 1. logo-navbar.svg (Old Version)
**File:** `logo-navbar.svg` ⚠️ **UNUSED**
- **Size:** 1.1 KB
- **Status:** Replaced by `logo-navbar-v3.svg`
- **Why unused:**
  - `Logo.tsx` references `/brand/logo-navbar-v3.svg`, not this file
  - This is an earlier version without the pin animation
  - Kept for reference/rollback purposes
- **Recommendation:** Safe to archive or remove after confirming V3 is stable
- **Design differences:**
  - Older M-shape design
  - No internal `<style>` tag for animation
  - Different viewBox dimensions (260x52 vs 220x40)

---

## Brand Color Palette

### Primary Colors

**Deep Navy** `#0B1D3A`
- Primary brand color
- Logo wordmark
- M-shaped mark
- Text, headings, dark sections

**Premium Orange** `#FF6A00`
- Primary accent color
- CTA buttons
- Logo location pin
- Active states, highlights

**White** `#FFFFFF`
- Backgrounds
- Logo route negative space
- Text on dark backgrounds

### Secondary Colors

**Nepal Red** `#DC143C`
- **SECONDARY ONLY** - not for primary CTAs
- Nepal-specific badges
- Urgent alerts
- Festival/campaign graphics
- "Made in Nepal" labels

**Light Gray** `#F2F4F7`
- Surfaces, cards
- Dividers
- Secondary backgrounds

---

## Brand Rules & Guidelines

### ✅ DO:

**Logo Usage:**
- Use `logo-navbar-v3.svg` for all navbar/header implementations
- Use single-color Deep Navy wordmark (`#0B1D3A`)
- Maintain original aspect ratio
- Keep logo clear and legible at small sizes
- Use h-8 (32px) for desktop navbar, h-7 (28px) for mobile
- Ensure adequate clear space around logo

**Color Usage:**
- Use Premium Orange for primary actions/CTAs
- Use Nepal Red sparingly for Nepal-specific meaning only
- Never use red as a normal CTA color
- Maintain proper color contrast for accessibility

**Favicon Usage:**
- Use simplified M mark only (no wordmark in favicon)
- Keep favicon files in `public/` root (not `public/brand/`)

### ❌ DON'T:

**Logo Restrictions:**
- ❌ Do not use old red circular bike logo
- ❌ Do not split "Nepal" into orange in the wordmark
- ❌ Do not stretch, rotate, or distort the logo
- ❌ Do not add shadows, glows, or effects to the logo
- ❌ Do not put detailed motorcycle icons into the mark
- ❌ Do not recreate or modify logo elements manually

**Color Restrictions:**
- ❌ Never use Premium Orange and Nepal Red as equal CTAs on same screen
- ❌ Do not use Nepal Red for normal CTA buttons
- ❌ Do not change brand colors without documentation approval

**File Management:**
- ❌ Do not move favicon files into `public/brand/` folder
- ❌ Do not reference `logo-navbar.svg` (use V3 instead)

---

## Adding New Brand Assets

### Naming Convention

**Logos:**
- Format: `logo-[usage]-v[version].svg`
- Examples:
  - `logo-navbar-v3.svg` (navbar, version 3)
  - `logo-email-v1.svg` (email signature)
  - `logo-social-v1.svg` (social media)

**Icons/Marks:**
- Format: `icon-[usage]-[size].svg`
- Examples:
  - `icon-mark-64.svg` (standalone mark, 64px)
  - `icon-pin-32.svg` (location pin only, 32px)

**Favicons:**
- Keep in `public/` root, not `public/brand/`
- Use standard naming: `favicon.svg`, `favicon-32x32.svg`, `apple-touch-icon.svg`

### File Requirements

**All brand SVG files must:**
1. Include accessibility attributes (`role="img"`, `aria-labelledby`, `<title>`, `<desc>`)
2. Use brand colors (`#0B1D3A`, `#FF6A00`, `#FFFFFF`)
3. Be optimized (remove unnecessary metadata)
4. Have clear, descriptive comments for elements
5. Follow the brand guidelines documented in `/docs/MYRIDENEPAL_BRAND_RULES.md`

**Animation Requirements:**
- Keep animations subtle and premium
- Must respect `prefers-reduced-motion: reduce`
- Duration: 500-800ms recommended
- Run once on load (no looping)

### Before Adding New Assets

1. Review `/docs/MYRIDENEPAL_BRAND_RULES.md` for brand guidelines
2. Ensure colors match brand palette
3. Test accessibility (screen readers, reduced motion)
4. Optimize file size
5. Document in this README
6. Update version number if replacing existing asset

---

## File Organization

```
public/
├── favicon.svg                    ✅ Active (primary favicon)
├── favicon-32x32.svg              ✅ Active (32x32 variant)
├── apple-touch-icon.svg           ✅ Active (iOS icon)
└── brand/
    ├── README.md                  📄 This file
    ├── logo-navbar-v3.svg         ✅ Active (navbar logo with animation)
    └── logo-navbar.svg            ⚠️  Unused (old version, safe to archive)
```

---

## Related Documentation

- **Brand Guidelines:** `/docs/MYRIDENEPAL_BRAND_RULES.md`
- **Logo Component:** `/src/components/Logo.tsx`
- **Favicon References:** `/index.html` (lines 8-10)

---

## Version History

**v3 (Current) - May 23, 2026**
- Added `logo-navbar-v3.svg` with improved M-shaped design
- Added subtle pin drop animation (700ms)
- Updated component to use V3 logo
- Changed navbar sizing from h-9 to h-8 for compact display
- `logo-navbar.svg` marked as unused (old version)

**v2 - May 23, 2026**
- Added `logo-navbar.svg` with simplified M mark
- Improved proportions for navbar display
- No animation

**v1 - Previous**
- Initial favicon assets created
- M mark with orange route accent
- Deep navy background

---

## Support

For brand-related questions or new asset requests, refer to the brand guidelines document or contact the design team.

**Important Reminder:**
- Never reintroduce the old red circular bike logo
- Never split "Nepal" into orange in the wordmark
- Premium Orange is for action, Nepal Red is for Nepal-specific meaning only
