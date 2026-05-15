# Notifications System - Part 1: Notification Bell

## Overview
Implemented a real-time notification bell in the navbar that shows unread notifications with a badge count and opens a popover with recent notifications.

## Features Implemented

### 1. Database Schema (`notifications` table)
Created comprehensive notifications table with:
- **Columns**: id, user_id, type, title, message, link, read, metadata, created_at
- **Notification Types**:
  - `offer_received` - When seller receives an offer
  - `offer_accepted` - When buyer's offer is accepted
  - `offer_declined` - When buyer's offer is declined
  - `offer_countered` - When seller sends counter offer
  - `listing_sold` - When listing is marked as sold
  - `listing_approved` - When admin approves listing
  - `listing_rejected` - When admin rejects listing

### 2. Automated Triggers
- **notify_offer_received**: Automatically creates notification when new offer is submitted
- **notify_offer_status_change**: Automatically creates notifications when offer status changes (accepted/declined/countered)

### 3. NotificationBell Component
Located: `src/components/NotificationBell.tsx`

**Features**:
- Bell icon with red badge showing unread count
- Auto-refreshes count every 30 seconds
- Badge shows "99+" for counts over 99
- Opens popover on click with 5 most recent notifications
- Each notification shows:
  - Icon based on notification type (colored)
  - Title and message
  - "Time ago" format (using date-fns)
  - Blue dot indicator for unread notifications
- Click notification to mark as read and navigate to link
- "View all notifications" button at bottom
- Only visible when user is logged in

**Icon Colors**:
- 🔵 Blue: offer_received (MessageSquare)
- 🟢 Green: offer_accepted (CheckCircle), listing_sold (ShoppingCart), listing_approved (Shield)
- 🔴 Red: offer_declined (XCircle), listing_rejected (AlertCircle)
- 🟠 Orange: offer_countered (ArrowRightLeft)

### 4. Navbar Integration
- Added NotificationBell next to Account button
- Only shows for logged-in users
- Desktop only (hidden on mobile)
- Proper spacing and alignment

## Technical Stack

### Dependencies Added
- `date-fns` - For relative time formatting ("2 hours ago")

### Database
- **Table**: `public.notifications`
- **RLS Policies**:
  - Users can view their own notifications
  - Users can update their own notifications (mark as read)
  - System can insert notifications (for triggers)
- **Indexes**: Optimized for user_id, read status, and created_at queries

### React Query
- `notification-count` query: Fetches unread count, auto-refetches every 30 seconds
- `notifications-recent` query: Fetches 5 most recent notifications when popover opens

## Files Created/Modified

### Created
1. `supabase/migrations/20260515140000_create_notifications_table.sql` - Database schema and triggers
2. `src/components/NotificationBell.tsx` - Notification bell component

### Modified
1. `src/components/Navbar.tsx` - Added NotificationBell import and component
2. `src/integrations/supabase/types.ts` - Regenerated with notifications table types

## How It Works

### Notification Flow
1. **User Action**: Buyer submits offer on listing
2. **Trigger Fires**: `notify_on_offer_received` trigger executes
3. **Notification Created**: New row inserted into notifications table for seller
4. **Real-time Update**: Notification bell badge updates within 30 seconds
5. **User Interaction**: Seller clicks bell, sees notification, clicks to view offer
6. **Mark as Read**: Notification marked as read, badge count decreases

### Query Optimization
- Unread count query uses compound index on (user_id, read)
- Recent notifications query uses created_at DESC index
- Auto-refetch keeps data fresh without manual polling

## Testing Checklist

- [x] Notification bell shows for logged-in users only
- [x] Badge count displays correctly
- [x] Badge updates every 30 seconds
- [x] Popover opens on click
- [x] Recent notifications display with correct data
- [x] Icons and colors match notification types
- [x] Time ago format works correctly
- [x] Clicking notification marks as read
- [x] Clicking notification navigates to correct page
- [x] "View all notifications" button works
- [x] Build passes successfully
- [x] TypeScript types generated correctly

## Next Steps (Future Parts)

### Part 2: Seller Inbox
- Dashboard page with offers tab
- Table view of all incoming offers
- Accept/Decline/Counter actions
- Filters and search

### Part 3: Buyer Offers Tracking
- Dashboard page with my offers tab
- View all sent offers
- See status of each offer
- Respond to counter offers

### Part 4: Real-time Updates
- Supabase real-time subscriptions
- Instant notification badge updates
- Live offer status changes
- Push notifications (optional)

## Performance Considerations

- Queries limited to 5 notifications in popover (lightweight)
- Indexes on all filter columns
- RLS policies prevent unauthorized access
- Auto-refetch interval of 30 seconds (configurable)
- Badge component memoization to prevent unnecessary re-renders

## Security

- RLS policies ensure users only see their own notifications
- Triggers use SECURITY DEFINER for system-level access
- All user-facing queries filtered by auth.uid()
- No sensitive data exposed in notifications table

## Notes

- Notification bell is desktop-only for now (can add mobile support later)
- "View all notifications" currently goes to dashboard (dedicated page coming in future)
- Popover auto-closes when clicking outside or navigating away
- Unread badge limited to 99+ to prevent UI overflow
