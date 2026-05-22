-- =====================================================
-- Dealer Phase 3A Migration: Stock Follower Alerts
-- =====================================================
-- Purpose: Allow buyers to follow dealers and receive notifications for new listings
-- Date: 21 May 2026

-- =====================================================
-- 1. Create dealer_followers table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dealer_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_filter TEXT[] DEFAULT '{}'::TEXT[],
  price_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one buyer can follow a dealer only once
  CONSTRAINT unique_dealer_follower UNIQUE (dealer_id, user_id)
);

COMMENT ON TABLE public.dealer_followers IS 'Tracks which users follow which dealers for new listing notifications';
COMMENT ON COLUMN public.dealer_followers.brand_filter IS 'Optional: Only notify for specific brands (empty array = all brands)';
COMMENT ON COLUMN public.dealer_followers.price_max IS 'Optional: Only notify for listings below or equal to this price';

-- =====================================================
-- 2. Add follower_count to dealer_profiles
-- =====================================================
ALTER TABLE public.dealer_profiles 
  ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.dealer_profiles.follower_count IS 'Number of users following this dealer (auto-updated by trigger)';

-- =====================================================
-- 3. Update notifications table to support dealer events
-- =====================================================
-- Alter the type check constraint to include new notification types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'offer_received', 
    'offer_accepted', 
    'offer_declined', 
    'offer_countered', 
    'listing_sold', 
    'listing_approved', 
    'listing_rejected',
    'dealer_new_listing',
    'dealer_update',
    'listing_price_drop',
    'system'
  ));

-- Add dealer_id and listing_id columns if not exists
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS dealer_id UUID REFERENCES public.dealer_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.notifications.dealer_id IS 'Reference to dealer if notification is dealer-related';
COMMENT ON COLUMN public.notifications.listing_id IS 'Reference to listing if notification is listing-related';

-- =====================================================
-- 4. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dealer_followers_dealer_id 
  ON public.dealer_followers(dealer_id);

CREATE INDEX IF NOT EXISTS idx_dealer_followers_user_id 
  ON public.dealer_followers(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_dealer_id 
  ON public.notifications(dealer_id) WHERE dealer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_listing_id 
  ON public.notifications(listing_id) WHERE listing_id IS NOT NULL;

-- =====================================================
-- 5. Enable RLS on dealer_followers
-- =====================================================
ALTER TABLE public.dealer_followers ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own follows
CREATE POLICY "Users can view their own follows"
  ON public.dealer_followers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can follow dealers (insert)
CREATE POLICY "Users can follow dealers"
  ON public.dealer_followers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can unfollow dealers (delete their own follows)
CREATE POLICY "Users can unfollow dealers"
  ON public.dealer_followers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Authenticated users can update their own follow preferences
CREATE POLICY "Users can update their follow preferences"
  ON public.dealer_followers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Dealers can see their follower count only (no private details)
-- This is handled via aggregation in application layer

-- Admin can view all follows
CREATE POLICY "Admins can view all follows"
  ON public.dealer_followers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 6. Trigger: Update dealer follower_count
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_dealer_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count
    UPDATE public.dealer_profiles
    SET follower_count = follower_count + 1
    WHERE id = NEW.dealer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE public.dealer_profiles
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.dealer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_dealer_follower_count IS 'Automatically updates dealer_profiles.follower_count when follows are added/removed';

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_dealer_follower_count ON public.dealer_followers;
CREATE TRIGGER trigger_update_dealer_follower_count
  AFTER INSERT OR DELETE ON public.dealer_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dealer_follower_count();

-- =====================================================
-- 7. Helper function: Create dealer new listing notifications
-- =====================================================
CREATE OR REPLACE FUNCTION public.notify_dealer_followers(
  p_dealer_id UUID,
  p_listing_id UUID,
  p_listing_title TEXT,
  p_listing_price INTEGER,
  p_listing_brands TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
  v_dealer_name TEXT;
  v_follower RECORD;
  v_notification_count INTEGER := 0;
  v_should_notify BOOLEAN;
BEGIN
  -- Get dealer name
  SELECT business_name INTO v_dealer_name
  FROM public.dealer_profiles
  WHERE id = p_dealer_id;

  IF v_dealer_name IS NULL THEN
    RETURN 0;
  END IF;

  -- Loop through all followers
  FOR v_follower IN
    SELECT user_id, brand_filter, price_max
    FROM public.dealer_followers
    WHERE dealer_id = p_dealer_id
  LOOP
    v_should_notify := TRUE;

    -- Check price filter
    IF v_follower.price_max IS NOT NULL AND p_listing_price > v_follower.price_max THEN
      v_should_notify := FALSE;
    END IF;

    -- Check brand filter (only if follower has specified brands)
    IF v_should_notify AND array_length(v_follower.brand_filter, 1) > 0 THEN
      -- Only notify if listing brand matches any of the follower's brand filters
      v_should_notify := FALSE;
      IF p_listing_brands IS NOT NULL THEN
        FOR i IN 1..array_length(p_listing_brands, 1) LOOP
          IF p_listing_brands[i] = ANY(v_follower.brand_filter) THEN
            v_should_notify := TRUE;
            EXIT;
          END IF;
        END LOOP;
      END IF;
    END IF;

    -- Create notification if filters passed
    IF v_should_notify THEN
      INSERT INTO public.notifications (
        user_id,
        dealer_id,
        listing_id,
        type,
        title,
        message,
        link,
        read
      ) VALUES (
        v_follower.user_id,
        p_dealer_id,
        p_listing_id,
        'dealer_new_listing',
        'New bike listed by ' || v_dealer_name,
        p_listing_title || ' is now available on MyRideNepal.',
        '/listings/' || p_listing_id,
        false
      );
      
      v_notification_count := v_notification_count + 1;
    END IF;
  END LOOP;

  RETURN v_notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.notify_dealer_followers IS 'Creates notifications for dealer followers when a new listing is published. Returns count of notifications created. Respects brand and price filters.';

-- =====================================================
-- Migration Complete
-- =====================================================
-- Summary:
-- ✅ Created dealer_followers table with unique constraint
-- ✅ Added follower_count column to dealer_profiles
-- ✅ Updated notifications table to support dealer events
-- ✅ Created 4 indexes for performance
-- ✅ Set up RLS policies for dealer_followers
-- ✅ Created trigger to auto-update follower_count
-- ✅ Created helper function to notify followers of new listings
--
-- Next steps:
-- 1. Apply this migration via Supabase Dashboard
-- 2. Regenerate TypeScript types
-- 3. Build follow/unfollow UI on dealer profile page
-- 4. Add follower count to dealer dashboard
-- 5. Create notification bell component
-- 6. Create notifications page
-- 7. Call notify_dealer_followers() when dealers publish listings
