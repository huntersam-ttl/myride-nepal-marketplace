# Make an Offer Feature

## Overview
The Make an Offer feature allows buyers to negotiate with sellers by submitting custom price offers on listings. This creates a transparent negotiation process within the MyRideNepal marketplace.

## Features

### Buyer Experience
- **Offer Button**: Navy blue "Make an Offer" button with tag icon appears below contact buttons
- **Authentication Required**: 
  - Only logged-in users can make offers
  - Disabled for listing owners (can't offer on own listings)
  - Tooltip shows "Login to make an offer" for logged-out users
- **Offer Dialog**:
  - Shows asking price at top
  - Price input field with NPR formatting
  - Live price comparison with percentage difference
  - Optional message textarea (max 300 characters with counter)
  - Visual indicators: green ↓ for lower offers, red ↑ for higher offers
  - Disabled submit button until valid price entered
  - Loading state during submission
  - **Duplicate Prevention**: Checks for existing pending offers before submission
- **Offer Status Card**: 
  - Replaces Make an Offer button when user has submitted an offer
  - Shows offer amount, status badge (pending/accepted/declined/countered)
  - Displays user's original message if provided
  - **Counter Offer Display**:
    - Shows seller's counter price and message
    - "Accept Counter Offer" button (green) updates status to accepted
    - "Decline" button updates status to declined
    - Both buttons show toast notifications and refresh offer data

### Seller Experience (Future)
- View all offers on their listings
- Accept, reject, or counter offers
- Notification when new offers arrive

## Database Schema

### `offers` Table
```sql
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_price BIGINT NOT NULL CHECK (offer_price > 0),
  message TEXT CHECK (char_length(message) <= 300),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  counter_price BIGINT CHECK (counter_price > 0),
  counter_message TEXT CHECK (char_length(counter_message) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Indexes
- `idx_offers_listing_id`: Fast lookup of offers by listing
- `idx_offers_buyer_id`: Fast lookup of buyer's offers
- `idx_offers_status`: Filter by offer status
- `idx_offers_created_at`: Sort by creation date

### Row Level Security (RLS)

#### Buyers
- ✅ View their own offers
- ✅ Create offers on active listings (not their own)
- ❌ Cannot offer on own listings
- ❌ Cannot update offers after submission

#### Sellers
- ✅ View offers on their listings
- ✅ Update offer status (accept/reject/counter)
- ❌ Cannot view offers on other sellers' listings

## UI Components

### Make an Offer Button
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div>
        <Button
          size="lg"
          className="w-full gap-2 bg-secondary text-white hover:bg-secondary/90"
          disabled={!user || listing.user_id === user?.id}
          onClick={() => setOfferDialogOpen(true)}
        >
          <Tag className="w-4 h-4" /> Make an Offer
        </Button>
      </div>
    </TooltipTrigger>
    {!user && (
      <TooltipContent>
        <p>Login to make an offer</p>
      </TooltipContent>
    )}
  </Tooltip>
</TooltipProvider>
```

### Offer Dialog
- **Asking Price Display**: Shows formatted NPR price
- **Offer Input**: Number input with min=0, step=1000
- **Live Comparison**: Calculates difference and percentage
- **Message Input**: Optional textarea with character counter
- **Action Buttons**: Cancel (resets form) and Submit (with loading state)

## Price Comparison Logic

```tsx
const difference = Number(offerPrice) - listing.price;
const percentage = (difference / listing.price * 100).toFixed(1);
const isLower = difference < 0;

// Display format:
// ↓ NPR 850,000 (-15.0%)  [green text]
// ↑ NPR 1,150,000 (+15.0%) [red text]
// Difference: NPR 150,000  [gray text]
```

## State Management

```tsx
const [offerDialogOpen, setOfferDialogOpen] = useState(false);
const [offerPrice, setOfferPrice] = useState("");
const [offerMessage, setOfferMessage] = useState("");
const [submittingOffer, setSubmittingOffer] = useState(false);
const { user } = useAuth();

// Query for existing offer
const { data: existingOffer, refetch: refetchOffer } = useQuery({
  queryKey: ["my-offer", listing.id, user?.id],
  enabled: !!user?.id,
  queryFn: async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },
});
```

## Submission Flow

1. **Validation**:
   - User must be logged in
   - Offer price must be > 0
   - User cannot be listing owner
   - Listing must be active
   - **No existing pending offer** (prevents duplicates)

2. **Duplicate Check**:
   ```tsx
   const { data: existingOffers } = await supabase
     .from("offers")
     .select("id, status")
     .eq("listing_id", listing.id)
     .eq("buyer_id", user.id)
     .eq("status", "pending");

   if (existingOffers && existingOffers.length > 0) {
     toast.error("You already have a pending offer on this listing");
     return;
   }
   ```

3. **Insert Offer**:
   ```tsx
   const { error } = await supabase.from("offers").insert({
     listing_id: listing.id,
     buyer_id: user.id,
     seller_id: listing.user_id,
     offer_price: Number(offerPrice),
     message: offerMessage || null,
     status: "pending"
   });
   ```

4. **Success**:
   - Show success toast: "Offer submitted successfully! The seller will be notified."
   - Close dialog
   - Reset form fields
   - Refetch offer data to show status card

5. **Error Handling**:
   - Log error to console
   - Show error toast: "Failed to submit offer. Please try again."
   - Keep dialog open
   - Reset submitting state

## Offer Status Display

When a buyer has submitted an offer, the Make an Offer button is replaced with a status card:

### Status Card Structure
```tsx
<Card className="p-4 space-y-3">
  {/* Header with status badge */}
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Your Offer</span>
    <Badge className={statusColor}>
      {status}
    </Badge>
  </div>
  
  {/* Offer amount */}
  <div className="text-lg font-semibold">{formatNPR(offer_price)}</div>
  
  {/* User's message */}
  {message && <p className="text-sm text-muted-foreground">{message}</p>}
  
  {/* Counter offer section (if status === "countered") */}
  {status === "countered" && counter_price && (
    <div className="mt-3 pt-3 border-t space-y-3">
      <div className="space-y-1">
        <span className="text-sm font-medium text-muted-foreground">
          Seller's Counter Offer
        </span>
        <div className="text-lg font-semibold text-blue-600">
          {formatNPR(counter_price)}
        </div>
        {counter_message && (
          <p className="text-sm text-muted-foreground">{counter_message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={acceptCounterOffer}>Accept Counter Offer</Button>
        <Button variant="outline" onClick={declineCounterOffer}>Decline</Button>
      </div>
    </div>
  )}
</Card>
```

### Status Badge Colors
- **Pending**: Yellow (`bg-yellow-500/10 text-yellow-700 border-yellow-500/20`)
- **Accepted**: Green (`bg-green-500/10 text-green-700 border-green-500/20`)
- **Declined**: Red (`bg-red-500/10 text-red-700 border-red-500/20`)
- **Countered**: Blue (`bg-blue-500/10 text-blue-700 border-blue-500/20`)

### Counter Offer Actions

**Accept Counter Offer**:
```tsx
const acceptCounterOffer = async () => {
  const { error } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", existingOffer.id);
  
  if (error) throw error;
  toast.success("Counter offer accepted!");
  refetchOffer();
};
```

**Decline Counter Offer**:
```tsx
const declineCounterOffer = async () => {
  const { error } = await supabase
    .from("offers")
    .update({ status: "declined" })
    .eq("id", existingOffer.id);
  
  if (error) throw error;
  toast.success("Counter offer declined");
  refetchOffer();
};
```

## Accessibility

- ✅ Keyboard navigation (Tab through inputs)
- ✅ Screen reader support (ARIA labels)
- ✅ Focus management (dialog traps focus)
- ✅ Tooltip for disabled state explanation
- ✅ Clear error states and feedback
- ✅ Loading indicators during submission

## Future Enhancements

### Phase 1: Seller Dashboard
- View all offers in dashboard
- Accept/reject/counter buttons
- Email notifications for new offers

### Phase 2: Counter Offers
- Sellers can propose different prices
- Buyers receive counter-offer notifications
- Multi-round negotiation support

### Phase 3: Offer History
- Timeline view of offer/counter-offer exchanges
- Status badges (pending, accepted, rejected, countered)
- Chat-style interface for negotiation

### Phase 4: Smart Pricing
- Show market average in offer dialog
- Suggest reasonable offer range
- Historical offer data for similar bikes

## Technical Notes

### Dependencies
- `@tanstack/react-query` for data fetching
- `sonner` for toast notifications
- `lucide-react` for Tag icon
- `@/components/ui/*` for UI components
- `@/hooks/use-auth` for authentication
- `@/lib/nepal` for NPR formatting

### Performance
- Dialog only renders when open (lazy rendering)
- Minimal re-renders with controlled inputs
- Optimistic UI updates for better UX
- Database indexes for fast queries

### Security
- RLS policies prevent unauthorized access
- Input validation on both client and database
- CSRF protection via Supabase Auth
- SQL injection prevention (parameterized queries)

## Testing Checklist

### Basic Functionality
- [ ] Logged-out users see disabled button with tooltip
- [ ] Logged-in users see active button
- [ ] Button disabled for listing owners
- [ ] Dialog opens/closes properly
- [ ] Price input accepts valid numbers
- [ ] Live comparison calculates correctly
- [ ] Message textarea enforces 300 char limit
- [ ] Submit button disabled until valid price entered
- [ ] Success toast appears on submission
- [ ] Error toast appears on failure
- [ ] Form resets after successful submission
- [ ] Loading state works during submission

### Duplicate Prevention
- [ ] Cannot submit multiple pending offers on same listing
- [ ] Toast shows "You already have a pending offer on this listing"
- [ ] Can submit new offer after previous one is accepted/declined

### Offer Status Display
- [ ] Status card replaces Make an Offer button after submission
- [ ] Correct badge color for each status (pending/accepted/declined/countered)
- [ ] Offer amount displays correctly formatted
- [ ] User's message shows if provided
- [ ] Counter offer section appears when status is "countered"
- [ ] Counter price and message display correctly
- [ ] Accept Counter Offer button updates status to accepted
- [ ] Decline button updates status to declined
- [ ] Toast notifications appear for counter offer actions
- [ ] Offer data refreshes after accepting/declining counter offer

### Data Integrity
- [ ] seller_id correctly set to listing.user_id
- [ ] buyer_id correctly set to authenticated user
- [ ] Status defaults to "pending"
- [ ] Timestamps (created_at, updated_at) auto-populate
- [ ] RLS policies prevent unauthorized access

## Migration Files

- `20260515130000_create_offers_table.sql`: Creates offers table with RLS policies
- Run: `npx supabase db push` to apply migration
- Generate types: `npx supabase gen types --lang=typescript --project-id <id> > src/integrations/supabase/types.ts`
