-- Create offers table for buyer-seller negotiations
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_amount BIGINT NOT NULL CHECK (offer_amount > 0),
  message TEXT CHECK (char_length(message) <= 300),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  counter_amount BIGINT CHECK (counter_amount > 0),
  counter_message TEXT CHECK (char_length(counter_message) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_offers_listing_id ON public.offers(listing_id);
CREATE INDEX idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_created_at ON public.offers(created_at DESC);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own offers
CREATE POLICY "Buyers can view their own offers"
  ON public.offers
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view offers on their listings
CREATE POLICY "Sellers can view offers on their listings"
  ON public.offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Buyers can create offers (logged in users)
CREATE POLICY "Buyers can create offers"
  ON public.offers
  FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
      AND listings.user_id != auth.uid() -- Can't offer on own listing
      AND listings.status = 'active'
    )
  );

-- Sellers can update offers (accept/reject/counter)
CREATE POLICY "Sellers can update offers on their listings"
  ON public.offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = offers.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_offers_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.offers IS 'Stores buyer offers on listings for negotiation';
COMMENT ON COLUMN public.offers.offer_amount IS 'Buyer''s proposed price in NPR';
COMMENT ON COLUMN public.offers.message IS 'Optional message from buyer (max 300 chars)';
COMMENT ON COLUMN public.offers.status IS 'pending, accepted, rejected, or countered';
COMMENT ON COLUMN public.offers.counter_amount IS 'Seller''s counter-offer amount';
COMMENT ON COLUMN public.offers.counter_message IS 'Seller''s counter-offer message';
