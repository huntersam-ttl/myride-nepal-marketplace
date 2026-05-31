-- Offers Integrity — Phase 3: revoke direct write access on public.offers
--
-- Phase 2A added six trusted RPCs (SECURITY DEFINER):
--   create_offer, seller_accept_offer, seller_decline_offer, seller_counter_offer,
--   buyer_accept_counter_offer, buyer_decline_counter_offer
--
-- Phase 2B refactored the frontend to call those RPCs for every offer mutation.
--
-- Phase 3 (this migration) revokes the legacy direct-write RLS policies that are
-- no longer used by the application. After this migration, the offers table can
-- be mutated only through the trusted RPCs.
--
-- Keeps in place:
--   - SELECT policies on offers (buyers see their own; sellers see offers on their listings)
--   - The six RPC functions and their grants
--   - Table constraints, indexes, and the updated_at trigger
--
-- Idempotent: uses IF EXISTS.

drop policy if exists "Buyers can create offers" on public.offers;
drop policy if exists "Sellers can update offers" on public.offers;
