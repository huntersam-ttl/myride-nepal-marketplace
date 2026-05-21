# Dealer Phase 1 Database Fields Reference

## dealer_profiles Table Schema

### Existing Fields (Pre-Phase 1)
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `user_id` | UUID | No | Foreign key to auth.users |
| `business_name` | TEXT | No | Dealer business name |
| `slug` | TEXT | No | URL-friendly identifier (unique) |
| `description` | TEXT | Yes | About the dealership |
| `location` | TEXT | Yes | Legacy field (use `district` instead) |
| `logo_url` | TEXT | Yes | Logo image URL |
| `banner_url` | TEXT | Yes | Banner image URL |
| `brands` | TEXT[] | Yes | Array of bike brands carried |
| `verified` | BOOLEAN | No | Admin verified (default: false) |
| `created_at` | TIMESTAMPTZ | No | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | Last update timestamp |

### Phase 1 Fields (NEW)

#### Contact Information
| Field | Type | Nullable | Description | Example |
|-------|------|----------|-------------|---------|
| `district` | TEXT | Yes | Nepal district (preferred over `location`) | `"Kathmandu"` |
| `full_address` | TEXT | Yes | Complete street address | `"Naxal, Near Civil Mall, Ward 3"` |
| `phone` | TEXT | Yes | Contact phone number | `"+9779801234567"` |
| `whatsapp` | TEXT | Yes | WhatsApp number (can be same as phone) | `"+9779801234567"` |

#### Business Details
| Field | Type | Nullable | Description | Example |
|-------|------|----------|-------------|---------|
| `years_in_business` | INTEGER | Yes | Years operating | `5` |
| `opening_hours` | JSONB | Yes | Business hours (day → time string) | See format below |

#### Social Media
| Field | Type | Nullable | Description | Example |
|-------|------|----------|-------------|---------|
| `facebook_url` | TEXT | Yes | Facebook page URL | `"https://facebook.com/mybikeshop"` |
| `instagram_url` | TEXT | Yes | Instagram profile URL | `"https://instagram.com/mybikeshop"` |
| `youtube_url` | TEXT | Yes | YouTube channel URL | `"https://youtube.com/@mybikeshop"` |
| `tiktok_url` | TEXT | Yes | TikTok profile URL | `"https://tiktok.com/@mybikeshop"` |

#### Services
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `exchange_accepted` | BOOLEAN | No | Accepts bikes in exchange (default: false) |
| `financing_available` | BOOLEAN | No | Offers financing/loans (default: false) |
| `service_centre` | BOOLEAN | No | Has repair/maintenance service (default: false) |
| `service_area` | TEXT[] | No | Districts served (default: `[]`) |

#### Admin/Stats
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `flagged` | BOOLEAN | No | Flagged by admin for review (default: false) |
| `active_listings_count` | INTEGER | No | Count of active listings (default: 0) |

#### Future (Placeholders)
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `average_rating` | NUMERIC(3,2) | Yes | Average review rating (Phase 2) |
| `total_reviews` | INTEGER | No | Total review count (default: 0, Phase 2) |

---

## opening_hours Format

The `opening_hours` field is JSONB with this structure:

```json
{
  "monday": "9 AM - 6 PM",
  "tuesday": "9 AM - 6 PM",
  "wednesday": "9 AM - 6 PM",
  "thursday": "9 AM - 6 PM",
  "friday": "9 AM - 6 PM",
  "saturday": "10 AM - 5 PM",
  "sunday": "Closed"
}
```

**Notes:**
- Days must be lowercase: `monday`, `tuesday`, etc.
- Time format is free-text (e.g., "9 AM - 6 PM", "24/7", "Closed")
- Not all days required (missing days won't display)
- Currently NOT editable via signup form (manual SQL update needed)

---

## Field Usage by Page

### /dealers (Directory)
**Used:**
- `business_name`, `slug`, `location`, `district`, `verified`, `flagged`, `logo_url`, `brands`, `active_listings_count`

**Not Used:**
- All contact, social, services, opening hours fields

### /dealers/:slug (Profile)
**Used:**
- **Header:** `business_name`, `slug`, `description`, `verified`, `logo_url`, `banner_url`, `brands`, `district`, `location`, `years_in_business`
- **Services:** `exchange_accepted`, `financing_available`, `service_centre`, `service_area`
- **Sidebar:** `phone`, `whatsapp`, `opening_hours`, `full_address`, `facebook_url`, `instagram_url`, `youtube_url`, `tiktok_url`

**Not Used:**
- `flagged` (filtered out in query), `active_listings_count` (shown separately)

### /dealer-signup (Form)
**Editable:**
- `business_name`, `description`, `district`, `full_address`, `phone`, `whatsapp`, `years_in_business`
- `logo_url`, `banner_url`, `facebook_url`, `instagram_url`, `youtube_url`, `tiktok_url`
- `brands`, `exchange_accepted`, `financing_available`, `service_centre`, `service_area`

**Not Editable:**
- `slug` (generated on create, shown but disabled on edit)
- `verified` (admin only)
- `flagged` (admin only)
- `active_listings_count` (auto-calculated)
- `opening_hours` (not in form yet - requires custom JSONB editor)
- `average_rating`, `total_reviews` (Phase 2)

### /admin (Admin Panel)
**Used:**
- `business_name`, `slug`, `location`, `district`, `verified`, `flagged`, `logo_url`, `brands`, `active_listings_count`

**Actions:**
- Can toggle `verified`
- Can toggle `flagged`

---

## Indexes

```sql
CREATE INDEX idx_dealer_profiles_district ON dealer_profiles(district);
CREATE INDEX idx_dealer_profiles_flagged ON dealer_profiles(flagged);
CREATE INDEX idx_dealer_profiles_years ON dealer_profiles(years_in_business);
```

**Existing indexes:**
- Primary key on `id`
- Unique index on `slug`
- Index on `user_id`

---

## RLS Policies

**No changes from existing policies.**

**Public read:**
- Anyone can read dealer profiles (same as before)

**Owner write:**
- Users can only insert/update their own dealer profile (same as before)

---

## Validation Rules

### Client-Side (Form)
- `business_name`: Required, non-empty
- `district`: Required, must be one of 77 Nepal districts
- `years_in_business`: Optional, must be positive integer
- `phone`, `whatsapp`: Optional, no format validation
- Social URLs: Optional, no format validation
- Booleans: Default to `false`
- Arrays: Default to `[]`

### Database-Side
- All Phase 1 fields are nullable (except booleans/arrays)
- No CHECK constraints added
- No format validation on phone/URLs
- `opening_hours` accepts any JSONB (validation helper function exists but not enforced)

---

## Migration Status

**File:** `supabase/migrations/20260521000000_extend_dealer_profiles_phase1.sql`

**Status:** ⚠️ **NOT APPLIED YET**

**To apply:**
```bash
cd /Users/cc/myridenepal/myride-nepal-marketplace
supabase db push
```

**Backwards compatible:** Yes
- All new fields are nullable
- Existing dealer profiles will continue to work
- Old `location` field is kept for compatibility

---

## Example SQL Queries

### Create dealer profile with Phase 1 fields
```sql
INSERT INTO dealer_profiles (
  user_id, business_name, slug, description,
  district, full_address, phone, whatsapp, years_in_business,
  facebook_url, instagram_url, youtube_url, tiktok_url,
  brands, exchange_accepted, financing_available, service_centre, service_area,
  opening_hours
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Kathmandu Bike House',
  'kathmandu-bike-house-abc123',
  'Premium bikes with best prices in town',
  'Kathmandu',
  'Naxal, Near Civil Mall, Ward 3',
  '+9779801234567',
  '+9779801234567',
  5,
  'https://facebook.com/ktmbikehouse',
  'https://instagram.com/ktmbikehouse',
  'https://youtube.com/@ktmbikehouse',
  'https://tiktok.com/@ktmbikehouse',
  ARRAY['Yamaha', 'Honda', 'Suzuki'],
  true,
  true,
  true,
  ARRAY['Kathmandu', 'Lalitpur', 'Bhaktapur'],
  '{"monday": "9 AM - 6 PM", "tuesday": "9 AM - 6 PM", "wednesday": "9 AM - 6 PM", "thursday": "9 AM - 6 PM", "friday": "9 AM - 6 PM", "saturday": "10 AM - 5 PM", "sunday": "Closed"}'::jsonb
);
```

### Update dealer with Phase 1 fields
```sql
UPDATE dealer_profiles
SET
  district = 'Pokhara',
  full_address = 'Lakeside, Near Barahi Temple',
  phone = '+9779809876543',
  whatsapp = '+9779809876543',
  years_in_business = 3,
  facebook_url = 'https://facebook.com/pokharabikes',
  exchange_accepted = true,
  financing_available = false,
  service_centre = true,
  service_area = ARRAY['Kaski', 'Syangja', 'Parbat']
WHERE slug = 'kathmandu-bike-house-abc123';
```

### Query dealers by district
```sql
SELECT * FROM dealer_profiles
WHERE district = 'Kathmandu'
  AND flagged = false
ORDER BY verified DESC, created_at DESC;
```

### Query dealers with services
```sql
SELECT * FROM dealer_profiles
WHERE (exchange_accepted = true OR financing_available = true OR service_centre = true)
  AND flagged = false
ORDER BY verified DESC, years_in_business DESC;
```

### Query dealers serving specific district
```sql
SELECT * FROM dealer_profiles
WHERE 'Pokhara' = ANY(service_area)
  AND flagged = false;
```

---

## TypeScript Types

```typescript
interface DealerProfile {
  // Existing
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string | null;
  location: string | null; // Legacy
  logo_url: string | null;
  banner_url: string | null;
  brands: string[] | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
  
  // Phase 1 - Contact
  district: string | null;
  full_address: string | null;
  phone: string | null;
  whatsapp: string | null;
  
  // Phase 1 - Business
  years_in_business: number | null;
  opening_hours: Record<string, string> | null;
  
  // Phase 1 - Social
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  
  // Phase 1 - Services
  exchange_accepted: boolean;
  financing_available: boolean;
  service_centre: boolean;
  service_area: string[];
  
  // Phase 1 - Admin
  flagged: boolean;
  active_listings_count: number;
  
  // Phase 2 (placeholders)
  average_rating: number | null;
  total_reviews: number;
}
```

---

## Summary

- **Total Fields:** 29 (12 existing + 17 Phase 1)
- **Required Fields:** 7 (id, user_id, business_name, slug, verified, created_at, updated_at)
- **Optional Fields:** 22 (all Phase 1 fields + some existing)
- **Indexed Fields:** 7 (id, slug, user_id, district, flagged, years_in_business, verified)
- **Editable via Form:** 17 fields
- **Admin Only:** 2 fields (verified, flagged)
- **Auto-Generated:** 4 fields (id, slug, created_at, updated_at)
