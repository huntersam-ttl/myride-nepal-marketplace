-- =====================================================
-- Dealer Phase 3B Migration: Team & Staff Access
-- =====================================================
-- Purpose: Allow dealer owners to manage staff/team access
-- Date: 22 May 2026

-- =====================================================
-- 1. Create dealer_staff table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dealer_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,
  invited_phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'sales_staff', 'listing_manager')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure either user_id or invited_email/phone is set
  CONSTRAINT staff_identity_check CHECK (
    user_id IS NOT NULL OR invited_email IS NOT NULL OR invited_phone IS NOT NULL
  )
);

COMMENT ON TABLE public.dealer_staff IS 'Manages dealer staff/team access and permissions';
COMMENT ON COLUMN public.dealer_staff.user_id IS 'Linked user account (null for pending invites)';
COMMENT ON COLUMN public.dealer_staff.invited_email IS 'Email for pending invite';
COMMENT ON COLUMN public.dealer_staff.invited_phone IS 'Phone for pending invite';
COMMENT ON COLUMN public.dealer_staff.role IS 'Staff role: owner, sales_staff, or listing_manager';
COMMENT ON COLUMN public.dealer_staff.status IS 'Status: pending, active, or removed';
COMMENT ON COLUMN public.dealer_staff.invited_by IS 'User who sent the invite';

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_dealer_staff_dealer_id 
  ON public.dealer_staff(dealer_id);

CREATE INDEX IF NOT EXISTS idx_dealer_staff_user_id 
  ON public.dealer_staff(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dealer_staff_role 
  ON public.dealer_staff(role);

CREATE INDEX IF NOT EXISTS idx_dealer_staff_status 
  ON public.dealer_staff(status);

CREATE INDEX IF NOT EXISTS idx_dealer_staff_invited_email 
  ON public.dealer_staff(invited_email) WHERE invited_email IS NOT NULL;

-- =====================================================
-- 3. Create unique constraint for active staff
-- =====================================================
-- Prevent duplicate active staff for same dealer/user combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_dealer_staff_unique_active 
  ON public.dealer_staff(dealer_id, user_id) 
  WHERE status = 'active' AND user_id IS NOT NULL;

-- =====================================================
-- 4. Enable RLS on dealer_staff
-- =====================================================
ALTER TABLE public.dealer_staff ENABLE ROW LEVEL SECURITY;

-- Dealer owners can view and manage staff for their own dealer
CREATE POLICY "Dealer owners can manage their staff"
  ON public.dealer_staff
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.dealer_staff owner_check
      WHERE owner_check.dealer_id = dealer_staff.dealer_id
      AND owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
      AND owner_check.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dealer_staff owner_check
      WHERE owner_check.dealer_id = dealer_staff.dealer_id
      AND owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
      AND owner_check.status = 'active'
    )
  );

-- Staff can view their own record
CREATE POLICY "Staff can view their own record"
  ON public.dealer_staff
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view/manage all staff
CREATE POLICY "Admins can manage all staff"
  ON public.dealer_staff
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 5. Create updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_dealer_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dealer_staff_updated_at ON public.dealer_staff;
CREATE TRIGGER trigger_dealer_staff_updated_at
  BEFORE UPDATE ON public.dealer_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dealer_staff_updated_at();

COMMENT ON FUNCTION public.update_dealer_staff_updated_at IS 'Auto-updates updated_at timestamp on dealer_staff changes';

-- =====================================================
-- 6. Create helper functions for permission checks
-- =====================================================

-- Check if user is a dealer owner
CREATE OR REPLACE FUNCTION public.is_dealer_owner(p_dealer_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_id = p_dealer_id
    AND user_id = p_user_id
    AND role = 'owner'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_dealer_owner IS 'Check if user is an active owner of the dealer';

-- Get user role for a dealer
CREATE OR REPLACE FUNCTION public.get_dealer_staff_role(p_dealer_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.dealer_staff
  WHERE dealer_id = p_dealer_id
  AND user_id = p_user_id
  AND status = 'active'
  LIMIT 1;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_dealer_staff_role IS 'Get the active role for a user at a dealer (returns null if none)';

-- Check if user can manage team
CREATE OR REPLACE FUNCTION public.can_manage_dealer_team(p_dealer_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_dealer_owner(p_dealer_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_manage_dealer_team IS 'Check if user can manage dealer team (owner only)';

-- Check if user can manage listings
CREATE OR REPLACE FUNCTION public.can_manage_dealer_listings(p_dealer_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_dealer_staff_role(p_dealer_id, p_user_id);
  RETURN v_role IN ('owner', 'listing_manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_manage_dealer_listings IS 'Check if user can manage dealer listings (owner or listing_manager)';

-- Check if user can manage leads
CREATE OR REPLACE FUNCTION public.can_manage_dealer_leads(p_dealer_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_dealer_staff_role(p_dealer_id, p_user_id);
  RETURN v_role IN ('owner', 'sales_staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_manage_dealer_leads IS 'Check if user can manage dealer leads (owner or sales_staff)';

-- =====================================================
-- 7. Auto-create owner staff record for existing dealers
-- =====================================================
-- For all existing dealer_profiles without a staff record, create an owner record
INSERT INTO public.dealer_staff (dealer_id, user_id, role, status, invited_by)
SELECT 
  dp.id,
  dp.user_id,
  'owner',
  'active',
  dp.user_id
FROM public.dealer_profiles dp
WHERE NOT EXISTS (
  SELECT 1 FROM public.dealer_staff ds
  WHERE ds.dealer_id = dp.id
  AND ds.user_id = dp.user_id
  AND ds.role = 'owner'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Summary:
-- ✅ Created dealer_staff table with role/status constraints
-- ✅ Created 6 indexes for performance
-- ✅ Set up RLS policies (owner, staff, admin)
-- ✅ Created unique constraint for active staff
-- ✅ Created updated_at trigger
-- ✅ Created 4 helper functions for permission checks
-- ✅ Auto-created owner records for existing dealers
--
-- Next steps:
-- 1. Apply this migration via Supabase Dashboard
-- 2. Regenerate TypeScript types
-- 3. Build settings page
-- 4. Build team management page
-- 5. Add access guards to dealer dashboard routes
