-- Dealer Phase 3D: Onboarding Polish and Dealer Acquisition
-- Date: 22 May 2026
-- Purpose: Add onboarding stage tracking and beta program fields

-- Add onboarding and beta tracking columns to dealer_profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'onboarding_stage') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN onboarding_stage TEXT DEFAULT 'draft' NOT NULL 
        CHECK (onboarding_stage IN ('draft', 'submitted', 'needs_more_info', 'ready_for_verification', 'verified', 'rejected', 'suspended'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'verification_requested_at') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN verification_requested_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'verification_note') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN verification_note TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'beta_started_at') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN beta_started_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'beta_ends_at') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN beta_ends_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dealer_profiles' AND column_name = 'profile_completion_percentage') THEN
        ALTER TABLE public.dealer_profiles 
        ADD COLUMN profile_completion_percentage INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add comments explaining new columns
COMMENT ON COLUMN public.dealer_profiles.onboarding_stage IS 'Current onboarding stage of the dealer';
COMMENT ON COLUMN public.dealer_profiles.verification_requested_at IS 'When dealer requested verification';
COMMENT ON COLUMN public.dealer_profiles.verification_note IS 'Admin note for verification/rejection';
COMMENT ON COLUMN public.dealer_profiles.beta_started_at IS 'When dealer joined the 3-month free beta';
COMMENT ON COLUMN public.dealer_profiles.beta_ends_at IS 'When dealer free beta period ends (3 months from start)';
COMMENT ON COLUMN public.dealer_profiles.profile_completion_percentage IS 'Percentage of profile completed for onboarding checklist';

-- Create indexes for admin onboarding pipeline queries
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_onboarding_stage 
ON public.dealer_profiles(onboarding_stage);

CREATE INDEX IF NOT EXISTS idx_dealer_profiles_verification_requested_at 
ON public.dealer_profiles(verification_requested_at) 
WHERE verification_requested_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dealer_profiles_beta_ends_at 
ON public.dealer_profiles(beta_ends_at) 
WHERE beta_ends_at IS NOT NULL;

-- Update existing verified dealers to have 'verified' onboarding_stage
UPDATE public.dealer_profiles 
SET onboarding_stage = 'verified' 
WHERE verified = true AND onboarding_stage = 'draft';

-- RLS Policies: Allow dealers to update their own verification request fields
DO $$ 
BEGIN
    -- Drop policy if exists and recreate
    DROP POLICY IF EXISTS "Dealers can update own verification request" ON public.dealer_profiles;
    
    CREATE POLICY "Dealers can update own verification request"
    ON public.dealer_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id 
        AND (
            -- Dealers can update these specific fields
            verification_requested_at IS NOT DISTINCT FROM verification_requested_at
            OR onboarding_stage IN ('draft', 'submitted', 'ready_for_verification')
        )
    );
END $$;

-- Admin can manage all onboarding fields
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can manage dealer onboarding" ON public.dealer_profiles;
    
    CREATE POLICY "Admins can manage dealer onboarding"
    ON public.dealer_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
END $$;
