-- Add last_active timestamp to profiles for response time tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT now();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.last_active IS 'Last time the user was active on the platform (for response time estimation)';

-- Create function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET last_active = now()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active when user creates/updates listings
DROP TRIGGER IF EXISTS trigger_update_last_active_on_listing ON public.listings;
CREATE TRIGGER trigger_update_last_active_on_listing
    AFTER INSERT OR UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Set initial last_active for existing users based on their listing activity
UPDATE public.profiles p
SET last_active = (
    SELECT MAX(l.updated_at)
    FROM public.listings l
    WHERE l.user_id = p.id
)
WHERE EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.user_id = p.id
);
