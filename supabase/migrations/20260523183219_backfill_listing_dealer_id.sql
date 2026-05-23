-- Backfill listings.dealer_id for dealer-owned listings.
-- Uses the app's actual ownership link: dealer_profiles.user_id -> listings.user_id.
-- Only fills missing dealer_id values and never overwrites existing links.

UPDATE public.listings AS l
SET dealer_id = dp.id
FROM public.dealer_profiles AS dp
WHERE l.dealer_id IS NULL
  AND l.user_id = dp.user_id;
