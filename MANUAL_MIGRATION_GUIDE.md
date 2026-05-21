# Manual Migration Guide - Phase 1 Dealer System

## ⚠️ Migration Status

The `supabase db push` command is encountering conflicts with existing migrations. Here's how to apply the Phase 1 dealer migration manually.

## Option 1: Supabase Dashboard SQL Editor (Recommended)

1. **Go to Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/nukeyvnsvsgwyvbtertf/sql

2. **Copy and paste this SQL:**

\`\`\`sql
-- Phase 1 Dealer Migration - Safe Version
-- Adds all Phase 1 fields to dealer_profiles table

DO $$
BEGIN
  -- Contact Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'district') THEN
    ALTER TABLE dealer_profiles ADD COLUMN district TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'full_address') THEN
    ALTER TABLE dealer_profiles ADD COLUMN full_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'phone') THEN
    ALTER TABLE dealer_profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'whatsapp') THEN
    ALTER TABLE dealer_profiles ADD COLUMN whatsapp TEXT;
  END IF;
  
  -- Social Media
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'facebook_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN facebook_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'tiktok_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN tiktok_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'youtube_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN youtube_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'instagram_url') THEN
    ALTER TABLE dealer_profiles ADD COLUMN instagram_url TEXT;
  END IF;
  
  -- Business Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'years_in_business') THEN
    ALTER TABLE dealer_profiles ADD COLUMN years_in_business INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'opening_hours') THEN
    ALTER TABLE dealer_profiles ADD COLUMN opening_hours JSONB;
  END IF;
  
  -- Services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'exchange_accepted') THEN
    ALTER TABLE dealer_profiles ADD COLUMN exchange_accepted BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'financing_available') THEN
    ALTER TABLE dealer_profiles ADD COLUMN financing_available BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'service_centre') THEN
    ALTER TABLE dealer_profiles ADD COLUMN service_centre BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'service_area') THEN
    ALTER TABLE dealer_profiles ADD COLUMN service_area TEXT[] DEFAULT '{}' NOT NULL;
  END IF;
  
  -- Admin/Stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'flagged') THEN
    ALTER TABLE dealer_profiles ADD COLUMN flagged BOOLEAN DEFAULT false NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'active_listings_count') THEN
    ALTER TABLE dealer_profiles ADD COLUMN active_listings_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  -- Future placeholders (Phase 2)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'average_rating') THEN
    ALTER TABLE dealer_profiles ADD COLUMN average_rating NUMERIC(3,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dealer_profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE dealer_profiles ADD COLUMN total_reviews INTEGER DEFAULT 0 NOT NULL;
  END IF;
  
  RAISE NOTICE 'Columns added successfully!';
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_district ON dealer_profiles(district);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_flagged ON dealer_profiles(flagged);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_years ON dealer_profiles(years_in_business);

-- Success message
SELECT 'Phase 1 dealer migration completed successfully!' AS status;
\`\`\`

3. **Click "Run"** to execute the migration

4. **Verify the migration:**
   - You should see: "Phase 1 dealer migration completed successfully!"
   - Check the Table Editor to see the new columns

## Option 2: Using psql Command Line

If you have the database connection string:

\`\`\`bash
# Get connection string from Supabase dashboard → Project Settings → Database
# Then run:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.nukeyvnsvsgwyvbtertf.supabase.co:5432/postgres" -f supabase/migrations/20260521000001_extend_dealer_profiles_phase1_safe.sql
\`\`\`

## Verification Steps

After applying the migration, verify it worked:

### 1. Check Columns Exist

Run this query in SQL Editor:

\`\`\`sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dealer_profiles'
  AND column_name IN (
    'district', 'full_address', 'phone', 'whatsapp',
    'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url',
    'years_in_business', 'opening_hours',
    'exchange_accepted', 'financing_available', 'service_centre', 'service_area',
    'flagged', 'active_listings_count', 'average_rating', 'total_reviews'
  )
ORDER BY column_name;
\`\`\`

Expected result: **18 rows** showing all Phase 1 columns.

### 2. Check Indexes Exist

\`\`\`sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'dealer_profiles'
  AND indexname IN (
    'idx_dealer_profiles_district',
    'idx_dealer_profiles_flagged',
    'idx_dealer_profiles_years'
  );
\`\`\`

Expected result: **3 rows** showing the new indexes.

### 3. Test Insert

\`\`\`sql
-- This should work without errors
SELECT
  id,
  business_name,
  district,
  phone,
  years_in_business,
  exchange_accepted,
  service_area,
  flagged
FROM dealer_profiles
LIMIT 1;
\`\`\`

## Troubleshooting

### Error: "column already exists"
✅ **Safe to ignore** - The migration uses `IF NOT EXISTS` to handle this.

### Error: "relation does not exist"
❌ **Problem** - The `dealer_profiles` table doesn't exist. You need to run earlier migrations first.

### Error: "permission denied"
❌ **Problem** - You need admin/owner permissions. Check your database role.

## Next Steps

Once the migration is successfully applied:

1. ✅ Mark migration as complete
2. 🧪 Start testing the features (see DEALER_PHASE1_COMPLETION.md)
3. 🚀 Deploy to production when ready

## Migration File Locations

- **Original:** `supabase/migrations/20260521000000_extend_dealer_profiles_phase1.sql`
- **Safe version:** `supabase/migrations/20260521000001_extend_dealer_profiles_phase1_safe.sql`

Both files do the same thing, but the safe version uses `IF NOT EXISTS` to avoid errors if columns already exist.
