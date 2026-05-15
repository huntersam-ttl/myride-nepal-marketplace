-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer_received', 'offer_accepted', 'offer_declined', 'offer_countered', 'listing_sold', 'listing_approved', 'listing_rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.notifications IS 'Stores user notifications for offers, listings, and system events';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification: offer_received, offer_accepted, offer_declined, offer_countered, listing_sold, listing_approved, listing_rejected';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data about the notification (offer_id, listing_id, etc.)';

-- Function to create notification when offer is received
CREATE OR REPLACE FUNCTION public.notify_offer_received()
RETURNS TRIGGER AS $$
BEGIN
  -- Get listing details
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  SELECT 
    l.user_id,
    'offer_received',
    'New offer on your listing',
    'You received an offer of NPR ' || NEW.offer_price || ' on ' || l.title,
    '/dashboard?tab=offers',
    jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'offer_price', NEW.offer_price)
  FROM public.listings l
  WHERE l.id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when offer is submitted
CREATE TRIGGER notify_on_offer_received
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_offer_received();

-- Function to notify when offer status changes
CREATE OR REPLACE FUNCTION public.notify_offer_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status changed
  IF NEW.status != OLD.status THEN
    -- Notify buyer about status change
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
      SELECT 
        NEW.buyer_id,
        'offer_accepted',
        'Your offer was accepted!',
        'The seller accepted your offer of NPR ' || NEW.offer_price || ' on ' || l.title,
        '/listings/' || NEW.listing_id,
        jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'offer_price', NEW.offer_price)
      FROM public.listings l
      WHERE l.id = NEW.listing_id;
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
      SELECT 
        NEW.buyer_id,
        'offer_declined',
        'Your offer was declined',
        'The seller declined your offer of NPR ' || NEW.offer_price || ' on ' || l.title,
        '/listings/' || NEW.listing_id,
        jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'offer_price', NEW.offer_price)
      FROM public.listings l
      WHERE l.id = NEW.listing_id;
    ELSIF NEW.status = 'countered' THEN
      INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
      SELECT 
        NEW.buyer_id,
        'offer_countered',
        'Seller sent a counter offer',
        'The seller countered with NPR ' || NEW.counter_price || ' on ' || l.title,
        '/listings/' || NEW.listing_id,
        jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'counter_price', NEW.counter_price)
      FROM public.listings l
      WHERE l.id = NEW.listing_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when offer status changes
CREATE TRIGGER notify_on_offer_status_change
  AFTER UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_offer_status_change();
