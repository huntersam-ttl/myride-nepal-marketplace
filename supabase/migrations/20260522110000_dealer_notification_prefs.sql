-- Dealer Notification Preferences
-- Allows dealers to control which notifications they receive

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.dealer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  new_leads BOOLEAN NOT NULL DEFAULT true,
  new_followers BOOLEAN NOT NULL DEFAULT true,
  performance_alerts BOOLEAN NOT NULL DEFAULT true,
  dead_stock_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_summary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_dealer_user_prefs UNIQUE (dealer_id, user_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dealer_notif_prefs_dealer_id ON public.dealer_notification_preferences(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_notif_prefs_user_id ON public.dealer_notification_preferences(user_id);

-- Enable RLS
ALTER TABLE public.dealer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
CREATE POLICY "Users can manage their dealer notification preferences"
  ON public.dealer_notification_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Policy: Admins can manage all preferences
CREATE POLICY "Admins can manage all notification preferences"
  ON public.dealer_notification_preferences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_dealer_notif_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dealer_notif_prefs_updated_at_trigger
BEFORE UPDATE ON public.dealer_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_dealer_notif_prefs_updated_at();

-- Comment
COMMENT ON TABLE public.dealer_notification_preferences IS 'Stores dealer notification preferences for each user';
