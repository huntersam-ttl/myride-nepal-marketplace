# Offers & Notifications System Flow

## User Journey Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUYER SUBMITS OFFER                          │
│  (src/routes/listings.$id.tsx)                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Insert into offers table    │
          │  - listing_id                │
          │  - buyer_id                  │
          │  - seller_id                 │
          │  - offer_price               │
          │  - message                   │
          │  - status: "pending"         │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ Auto-create notification     │
          │ for SELLER (Part 3)          │
          │ - user_id: seller_id         │
          │ - type: "offer_received"     │
          │ - title: "New Offer Received"│
          │ - message: "[NAME] made      │
          │   an offer of NPR [AMOUNT]"  │
          │ - link: "/dashboard/offers"  │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Notification Bell Updates   │
          │  (Auto-refresh every 30s)    │
          │  Shows red badge with count  │
          └──────────────┬───────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────┐           ┌────────────────────┐
│   SELLER PATH     │           │    BUYER PATH      │
│ /dashboard/offers │           │ /dashboard/offers  │
│                   │           │                    │
│ Received Offers   │           │  Sent Offers       │
│ (Part 4)          │           │  (Part 4)          │
└───────┬───────────┘           └─────────┬──────────┘
        │                                 │
        ▼                                 │
┌───────────────────┐                     │
│ SELLER ACTIONS    │                     │
├───────────────────┤                     │
│ 1. Accept Offer   │───┐                 │
│ 2. Decline        │───┤                 │
│ 3. Counter Offer  │───┤                 │
└───────────────────┘   │                 │
                        │                 │
                        ▼                 │
        ┌───────────────────────────┐     │
        │ Create Notification       │     │
        │ for BUYER                 │     │
        │ - offer_accepted          │     │
        │ - offer_declined          │     │
        │ - offer_countered         │     │
        └───────────┬───────────────┘     │
                    │                     │
                    └─────────────────────┤
                                          ▼
                              ┌────────────────────┐
                              │ BUYER SEES UPDATE  │
                              │ - Notification bell│
                              │ - Sent Offers tab  │
                              └─────────┬──────────┘
                                        │
                      If countered:     │
                                        ▼
                              ┌────────────────────┐
                              │ BUYER COUNTER      │
                              │ RESPONSE           │
                              │ - Accept Counter   │
                              │ - Decline Counter  │
                              └─────────┬──────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ Create Notification│
                              │ for SELLER         │
                              └────────────────────┘
```

## Navigation Structure

```
Dashboard (/)
├── My Listings
│   └── [Shows user's listings]
│
└── My Offers (NEW - Part 5)
    ├── Badge: Shows pending count
    └── Link: /dashboard/offers
            │
            ▼
    /dashboard/offers (NEW - Part 4)
    ├── Received Offers Tab
    │   ├── Accept Offer → Update status → Notify buyer
    │   ├── Decline → Update status → Notify buyer
    │   └── Counter Offer → Update status + counter → Notify buyer
    │
    └── Sent Offers Tab
        ├── View offer status
        └── If countered:
            ├── Accept Counter → Update status → Notify seller
            └── Decline Counter → Update status → Notify seller

Notification Bell (Navbar)
├── Shows unread count
├── Popover: 5 recent notifications
└── Link: View all notifications
          │
          ▼
    /notifications (NEW - Part 6)
    ├── All notifications (newest first)
    ├── Click to mark as read + navigate
    └── Mark all as read button
```

## Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         OFFERS TABLE                            │
├─────────────────────────────────────────────────────────────────┤
│ id, listing_id, buyer_id, seller_id, offer_price, message,     │
│ status, counter_price, counter_message, created_at             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Every status change triggers:
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATIONS TABLE                          │
├─────────────────────────────────────────────────────────────────┤
│ id, user_id, type, title, message, link, read, created_at      │
│                                                                 │
│ Types:                                                          │
│ - offer_received    (buyer → seller)                            │
│ - offer_accepted    (seller → buyer)                            │
│ - offer_declined    (seller → buyer)                            │
│ - offer_countered   (seller → buyer)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Queried by:
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Bell Popover │  │ Notifications│  │   Dashboard  │
│ (5 recent)   │  │ Page (all)   │  │ (count only) │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Component Hierarchy

```
App
├── Navbar
│   └── NotificationBell (Updated - Part 6)
│       ├── Badge (unread count)
│       └── Popover
│           ├── Recent 5 notifications
│           └── Link → /notifications
│
├── /dashboard (Updated - Part 5)
│   ├── Header
│   ├── Quick Navigation Card (NEW)
│   │   └── My Offers Button + Badge
│   └── Listings Grid
│
├── /dashboard/offers (NEW - Part 4)
│   ├── Tabs
│   │   ├── Received Offers
│   │   │   └── OfferCard[]
│   │   │       ├── Listing thumbnail
│   │   │       ├── Buyer info
│   │   │       ├── Offer details
│   │   │       └── Action buttons
│   │   │           ├── Accept → Mutation
│   │   │           ├── Decline → Mutation
│   │   │           └── Counter → Dialog
│   │   │               └── CounterOfferForm
│   │   │
│   │   └── Sent Offers
│   │       └── OfferCard[]
│   │           ├── Listing info
│   │           ├── Offer status
│   │           └── If countered:
│   │               ├── Accept Counter → Mutation
│   │               └── Decline Counter → Mutation
│   │
│   └── CounterOfferDialog
│       ├── Price input
│       ├── Message textarea
│       └── Submit button
│
└── /notifications (NEW - Part 6)
    ├── Header
    │   └── Mark all as read button
    ├── NotificationCard[]
    │   ├── Icon (color-coded)
    │   ├── Title
    │   ├── Message
    │   ├── Time ago
    │   └── Read/Unread badge
    └── Empty state
```

## Notification Types & Colors

```
┌─────────────────────┬──────────┬────────────────────────────────┐
│ Type                │ Color    │ Icon                           │
├─────────────────────┼──────────┼────────────────────────────────┤
│ offer_received      │ Blue     │ MessageSquare                  │
│ offer_countered     │ Blue     │ MessageSquare                  │
│ offer_accepted      │ Green    │ CheckCircle2                   │
│ listing_sold        │ Green    │ Package                        │
│ listing_approved    │ Green    │ CheckCircle                    │
│ offer_declined      │ Red      │ XCircle                        │
│ listing_rejected    │ Red      │ XCircle                        │
│ default             │ Gray     │ Bell                           │
└─────────────────────┴──────────┴────────────────────────────────┘
```

## Status Badge Colors

```
┌─────────────────────┬──────────────────────────────────────────┐
│ Status              │ Style                                    │
├─────────────────────┼──────────────────────────────────────────┤
│ pending             │ bg-yellow-100 text-yellow-800            │
│ accepted            │ bg-green-100 text-green-800              │
│ declined            │ bg-red-100 text-red-800                  │
│ countered           │ bg-blue-100 text-blue-800                │
└─────────────────────┴──────────────────────────────────────────┘
```

## Query Keys (TanStack Query)

```
["received-offers", userId]      → Offers where user is seller
["sent-offers", userId]          → Offers where user is buyer
["pending-offers-count", userId] → Count of pending received offers
["notifications", userId]        → All user notifications
["notification-count", userId]   → Unread notifications count
["notifications-recent", userId] → 5 most recent notifications
```

## Mutation Flow Example: Accept Offer

```
User clicks "Accept Offer"
        │
        ▼
acceptOfferMutation.mutate(offer)
        │
        ├─→ Update offers table: status = "accepted"
        │
        ├─→ Insert notification for buyer:
        │   {
        │     user_id: offer.buyer_id,
        │     type: "offer_accepted",
        │     title: "Your Offer was Accepted",
        │     message: "Your offer of NPR X for Y has been accepted...",
        │     link: "/listings/:id"
        │   }
        │
        ├─→ onSuccess:
        │   ├─ queryClient.invalidateQueries(["received-offers"])
        │   ├─ queryClient.invalidateQueries(["notification-count"])
        │   └─ toast.success("Offer accepted successfully!")
        │
        └─→ UI updates automatically (optimistic)
```

---

This flow diagram shows how all 6 parts work together to create a complete offers and notifications system.
