-- Offers Integrity Phase 2
--
-- Add database invariants and trusted RPC entrypoints for the offer workflow.
-- The existing direct authenticated INSERT and UPDATE policies intentionally
-- remain in place during the frontend rollout. Revoke those direct writes only
-- after the deployed frontend has moved to these RPCs and smoke tests pass.

ALTER TABLE public.offers
  ALTER COLUMN listing_id SET NOT NULL,
  ALTER COLUMN buyer_id SET NOT NULL,
  ALTER COLUMN seller_id SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offers'::regclass
      AND conname = 'offers_status_check'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_status_check
      CHECK (status IN ('pending', 'accepted', 'declined', 'countered'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offers'::regclass
      AND conname = 'offers_offer_price_positive_check'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_offer_price_positive_check
      CHECK (offer_price > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offers'::regclass
      AND conname = 'offers_counter_price_positive_check'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_counter_price_positive_check
      CHECK (counter_price IS NULL OR counter_price > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offers'::regclass
      AND conname = 'offers_message_length_check'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_message_length_check
      CHECK (message IS NULL OR char_length(message) <= 300);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.offers'::regclass
      AND conname = 'offers_counter_message_length_check'
  ) THEN
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_counter_message_length_check
      CHECK (counter_message IS NULL OR char_length(counter_message) <= 300);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_offers_listing_id
  ON public.offers (listing_id);

CREATE INDEX IF NOT EXISTS idx_offers_buyer_id
  ON public.offers (buyer_id);

CREATE INDEX IF NOT EXISTS idx_offers_seller_id
  ON public.offers (seller_id);

CREATE INDEX IF NOT EXISTS idx_offers_status
  ON public.offers (status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_one_pending_per_buyer_listing
  ON public.offers (buyer_id, listing_id)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.update_offers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_offers_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_offers_updated_at ON public.offers;
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_offers_updated_at();

CREATE OR REPLACE FUNCTION public.create_offer(
  p_listing_id uuid,
  p_offer_price numeric,
  p_message text DEFAULT NULL
)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_buyer_id uuid := auth.uid();
  v_seller_id uuid;
  v_offer public.offers;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_offer_price IS NULL OR p_offer_price <= 0 THEN
    RAISE EXCEPTION 'Offer price must be greater than zero';
  END IF;

  IF p_message IS NOT NULL AND char_length(p_message) > 300 THEN
    RAISE EXCEPTION 'Offer message must be 300 characters or fewer';
  END IF;

  SELECT listings.user_id
  INTO v_seller_id
  FROM public.listings
  WHERE listings.id = p_listing_id
    AND listings.status = 'active'
    AND listings.deleted_at IS NULL;

  IF NOT FOUND OR v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Active listing not found';
  END IF;

  IF v_seller_id = v_buyer_id THEN
    RAISE EXCEPTION 'You cannot make an offer on your own listing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.offers
    WHERE offers.listing_id = p_listing_id
      AND offers.buyer_id = v_buyer_id
      AND offers.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'You already have a pending offer on this listing';
  END IF;

  INSERT INTO public.offers (
    listing_id,
    buyer_id,
    seller_id,
    offer_price,
    message,
    status
  )
  VALUES (
    p_listing_id,
    v_buyer_id,
    v_seller_id,
    p_offer_price,
    p_message,
    'pending'
  )
  RETURNING * INTO v_offer;

  RETURN v_offer;
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_accept_offer(p_offer_id uuid)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_seller_id uuid := auth.uid();
  v_offer public.offers;
BEGIN
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.offers
  SET status = 'accepted'
  WHERE offers.id = p_offer_id
    AND offers.seller_id = v_seller_id
    AND offers.status = 'pending'
  RETURNING * INTO v_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending offer not found for seller';
  END IF;

  RETURN v_offer;
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_decline_offer(p_offer_id uuid)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_seller_id uuid := auth.uid();
  v_offer public.offers;
BEGIN
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.offers
  SET status = 'declined'
  WHERE offers.id = p_offer_id
    AND offers.seller_id = v_seller_id
    AND offers.status = 'pending'
  RETURNING * INTO v_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending offer not found for seller';
  END IF;

  RETURN v_offer;
END;
$$;

CREATE OR REPLACE FUNCTION public.seller_counter_offer(
  p_offer_id uuid,
  p_counter_price numeric,
  p_counter_message text DEFAULT NULL
)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_seller_id uuid := auth.uid();
  v_offer public.offers;
BEGIN
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_counter_price IS NULL OR p_counter_price <= 0 THEN
    RAISE EXCEPTION 'Counter price must be greater than zero';
  END IF;

  IF p_counter_message IS NOT NULL AND char_length(p_counter_message) > 300 THEN
    RAISE EXCEPTION 'Counter message must be 300 characters or fewer';
  END IF;

  UPDATE public.offers
  SET
    status = 'countered',
    counter_price = p_counter_price,
    counter_message = p_counter_message
  WHERE offers.id = p_offer_id
    AND offers.seller_id = v_seller_id
    AND offers.status = 'pending'
  RETURNING * INTO v_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pending offer not found for seller';
  END IF;

  RETURN v_offer;
END;
$$;

CREATE OR REPLACE FUNCTION public.buyer_accept_counter_offer(p_offer_id uuid)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_buyer_id uuid := auth.uid();
  v_offer public.offers;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.offers
  SET status = 'accepted'
  WHERE offers.id = p_offer_id
    AND offers.buyer_id = v_buyer_id
    AND offers.status = 'countered'
  RETURNING * INTO v_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Countered offer not found for buyer';
  END IF;

  RETURN v_offer;
END;
$$;

CREATE OR REPLACE FUNCTION public.buyer_decline_counter_offer(p_offer_id uuid)
RETURNS public.offers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_buyer_id uuid := auth.uid();
  v_offer public.offers;
BEGIN
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.offers
  SET status = 'declined'
  WHERE offers.id = p_offer_id
    AND offers.buyer_id = v_buyer_id
    AND offers.status = 'countered'
  RETURNING * INTO v_offer;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Countered offer not found for buyer';
  END IF;

  RETURN v_offer;
END;
$$;

REVOKE ALL ON FUNCTION public.create_offer(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seller_accept_offer(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seller_decline_offer(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seller_counter_offer(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.buyer_accept_counter_offer(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.buyer_decline_counter_offer(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_offer(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seller_accept_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seller_decline_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seller_counter_offer(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.buyer_accept_counter_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.buyer_decline_counter_offer(uuid) TO authenticated;

COMMENT ON FUNCTION public.create_offer(uuid, numeric, text) IS
  'Trusted offer creation entrypoint. Derives buyer and seller IDs server-side.';
COMMENT ON FUNCTION public.seller_accept_offer(uuid) IS
  'Trusted seller transition from pending to accepted.';
COMMENT ON FUNCTION public.seller_decline_offer(uuid) IS
  'Trusted seller transition from pending to declined.';
COMMENT ON FUNCTION public.seller_counter_offer(uuid, numeric, text) IS
  'Trusted seller transition from pending to countered.';
COMMENT ON FUNCTION public.buyer_accept_counter_offer(uuid) IS
  'Trusted buyer transition from countered to accepted.';
COMMENT ON FUNCTION public.buyer_decline_counter_offer(uuid) IS
  'Trusted buyer transition from countered to declined.';

-- TODO(offers-integrity-phase3): after the RPC frontend is deployed and tested,
-- revoke direct authenticated INSERT and UPDATE access on public.offers and
-- remove the temporary direct-write RLS policies.
