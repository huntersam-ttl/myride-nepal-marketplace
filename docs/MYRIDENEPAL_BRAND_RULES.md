# MyRideNepal Brand Rules

**Version:** 1.0  
**Last Updated:** May 23, 2026

This document defines the official brand identity guidelines for MyRideNepal marketplace.

---

## 1. Logo System

### Logo Assets

**Primary Navbar Logo:**
- File: `public/brand/logo-navbar-v3.svg`
- Usage: Website header navigation
- Design: M-shaped mark + "MyRideNepal" wordmark
- Components: Deep navy M, premium orange location pin, white route negative space

**Favicon:**
- File: `public/favicon.svg`
- Usage: Browser tab icon, app icon only
- Design: Simplified M mark with orange route accent

### Logo Usage Rules

✅ **Do:**
- Use navbar logo for website header
- Use favicon only for browser tab/app icon
- Maintain clear space around logo
- Use on white or very light backgrounds

❌ **Don't:**
- Use the old red circular bike logo
- Use motorcycle silhouettes inside the core logo
- Modify or recreate logo elements
- Use logo as a button or clickable element (except homepage link)

---

## 2. Logo Sizing

### Navbar Implementation

**Desktop:**
- Height: `h-8` (32px) to `h-9` (36px)
- Width: Auto (maintains aspect ratio)
- Current: `h-8` (optimal for navbar)

**Mobile:**
- Height: `h-7` (28px) to `h-8` (32px)
- Width: Auto (maintains aspect ratio)

**Favicon:**
- Size: 64x64px viewBox
- Design: Simplified mark only (no wordmark)

### Minimum Size

- Avoid using full wordmark below 180px width
- For smaller spaces, use icon mark only
- Never scale logo below 24px height

---

## 3. Colour Hierarchy

### Primary Brand Colours

**Deep Navy** `#0B1D3A`
- Usage: Main brand colour, wordmark, headings, dark sections, text
- Purpose: Professional, trustworthy, primary identity
- Examples: Logo wordmark, navigation text, headings, footer background

**Premium Orange** `#FF6A00`
- Usage: Primary accent, CTA buttons, active states, logo pin, highlights
- Purpose: Action, energy, calls-to-action
- Examples: Primary buttons, logo location pin, links, active navigation tabs

**Nepal Red** `#DC143C`
- Usage: Secondary accent only
- Purpose: Nepal-specific identity, urgent alerts, local meaning
- Examples: Nepal badges, urgent notifications, festival campaigns, "Made in Nepal" labels
- **Important:** Never use as primary CTA colour

**Neutral Colours**
- White: `#FFFFFF` (backgrounds, cards)
- Light Gray: `#F2F4F7` (surfaces, dividers, secondary backgrounds)

### Colour Hierarchy Rules

⚠️ **Critical Rule:**  
**Never use Premium Orange and Nepal Red as equal CTA colours on the same screen.**

- Orange is for action (Buy, Contact, Sign Up, etc.)
- Red is for Nepal/local/alert meaning (Nepal verified, urgent alerts, festival badges)

**Correct Usage:**
```
✅ Orange "Contact Seller" button + Red "Nepal Verified" badge
✅ Orange primary CTA + Red alert notification
```

**Incorrect Usage:**
```
❌ Orange "Buy Now" + Red "Add to Cart" (competing CTAs)
❌ Red "Contact Seller" button (confuses action with alert)
```

---

## 4. Typography

### Font Families

**Display/Headings:**
- Primary: Sora (bold, headings, logo-style display)
- Alternative: Manrope (clean, modern headings)

**UI/Body Text:**
- Primary: Manrope (interface elements, body copy)
- Alternative: Inter (system UI fallback)

**Nepali Text:**
- Required: Noto Sans Devanagari (for Nepali language content)

### Font Hierarchy

```
Headings (H1-H2): Sora Bold, 32-48px
Subheadings (H3-H4): Manrope Bold, 20-28px
Body Text: Manrope Regular, 16-18px
UI Labels: Manrope Medium, 14-16px
Small Text: Manrope Regular, 12-14px
```

---

## 5. Nepal-Specific Identity

### Core Principle

Keep the core logo minimal and universal. Nepal-specific visuals should live in supporting elements, not the main logo.

### Where Nepal Identity Belongs

✅ **Appropriate Locations:**
- Hero section banners with Himalaya silhouettes
- "Nepal Verified" badges on dealer profiles
- Campaign graphics with Nepal flag-inspired colours
- Footer strips with local identity elements
- Hero illustrations with cultural motifs
- Promotional banners for Nepal-specific events

❌ **Avoid in Core Logo:**
- Detailed mountain silhouettes
- Nepal flag elements
- Multiple cultural symbols layered together
- Overly complex iconography

### Nepal Visual Elements

**Subtle Integration:**
- Himalaya silhouettes (background illustrations only)
- Nepal flag-inspired red/blue colour accents (campaigns, badges)
- Local language copy (Nepali text in UI)
- Traditional patterns (decorative elements, not logo)

**Usage Guideline:**
Do not overload the logo with mountains, flags, bikes, roads, and pins all together. Keep it clean and recognizable.

---

## 6. Motion & Animation

### Logo Animation

**Current Implementation:**
- Orange location pin has subtle drop/bounce animation
- Triggers once on page load
- Duration: 700ms
- Easing: cubic-bezier(.2, .9, .2, 1.15)

**Animation Rules:**

✅ **Allowed:**
- Logo pin animation on page load (current)
- Hover states on navigation links
- Smooth transitions on interactive elements

❌ **Not Allowed:**
- Continuous/looping logo animations
- Distracting motion effects
- Animations on every page navigation

### Accessibility

**Required:**
- Must respect `prefers-reduced-motion: reduce`
- Animation automatically disabled for users with motion sensitivity
- No critical information conveyed through motion alone

---

## 7. Do's and Don'ts

### Logo Usage

**✅ Do:**
- Use single-colour wordmark (Deep Navy #0B1D3A)
- Maintain original aspect ratio
- Keep logo clear and legible at small sizes
- Use provided SVG files unmodified
- Ensure adequate clear space around logo

**❌ Don't:**
- Stretch, rotate, or distort the logo
- Add shadows, glows, or effects to the logo
- Split "Nepal" into orange in the wordmark
- Change logo colours (except white on dark backgrounds)
- Put detailed motorcycle icons into the mark
- Recreate or modify logo elements

### Colour Usage

**✅ Do:**
- Use orange for primary actions (CTA buttons)
- Use red sparingly for Nepal-specific meaning
- Maintain colour contrast for accessibility
- Use neutral backgrounds to let colours stand out

**❌ Don't:**
- Use red as a normal CTA colour
- Mix orange and red as competing CTAs
- Use low-contrast colour combinations
- Override brand colours without reason

### Typography

**✅ Do:**
- Use Sora/Manrope for consistent brand voice
- Use Noto Sans Devanagari for Nepali text
- Maintain proper font hierarchy
- Keep body text readable (16px minimum)

**❌ Don't:**
- Mix too many font families
- Use decorative fonts for body text
- Set text smaller than 12px
- Use ALL CAPS for long paragraphs

### Nepal Identity

**✅ Do:**
- Use Nepal-specific visuals in campaigns and badges
- Keep cultural elements respectful and authentic
- Use local language where appropriate
- Celebrate Nepal identity in supporting materials

**❌ Don't:**
- Stereotype or oversimplify Nepal culture
- Overcrowd visuals with cultural symbols
- Use Nepal identity as decoration only
- Ignore cultural sensitivity

---

## Implementation Notes

### Current Website Status

**Logo Files:**
- Navbar: `public/brand/logo-navbar-v3.svg` ✅ Active
- Favicon: `public/favicon.svg` ✅ Active
- Logo Component: `src/components/Logo.tsx` ✅ Implemented

**Colour System:**
- Deep Navy: Primary brand colour ✅
- Premium Orange: Primary CTA colour ✅
- Nepal Red: Available for Nepal-specific usage ✅

**Typography:**
- Font families loaded and active ✅
- Proper hierarchy implemented ✅

**Animation:**
- Logo pin animation active ✅
- Respects reduced-motion preferences ✅

---

## Version History

**v1.0 - May 23, 2026**
- Initial brand rules documentation
- V3 logo system defined
- Colour hierarchy established
- Nepal identity guidelines created
- Animation standards documented

---

## Contact

For brand-related questions or clarifications, contact the design team.

**Last Review:** May 23, 2026
