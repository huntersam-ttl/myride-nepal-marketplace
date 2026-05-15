import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNPR } from "@/lib/nepal";
import { Loader2, Tag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/offers")({
  component: OffersPage,
  head: () => ({ meta: [{ title: "My Offers — MyRideNepal" }] }),
});

function OffersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    navigate({ to: "/auth", search: { redirect: "/dashboard/offers" } as any });
  }

  const { data: receivedOffers, isLoading: receivedLoading } = useQuery({
    queryKey: ["received-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*, listing:listings(id, title, price, images), buyer:profiles!offers_buyer_id_fkey(name, email)")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sentOffers, isLoading: sentLoading } = useQuery({
    queryKey: ["sent-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*, listing:listings(id, title, price, images, user_id), seller:profiles!offers_seller_id_fkey(name, email)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offer accepted!");
      queryClient.invalidateQueries({ queryKey: ["received-offers", user?.id] });
    },
    onError: (error) => {
      console.error("Error accepting offer:", error);
      toast.error("Failed to accept offer");
    },
  });

  const declineOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase.from("offers").update({ status: "declined" }).eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offer declined");
      queryClient.invalidateQueries({ queryKey: ["received-offers", user?.id] });
    },
    onError: (error) => {
      console.error("Error declining offer:", error);
      toast.error("Failed to decline offer");
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: async ({ offerId, price, message }: { offerId: string; price: number; message: string }) => {
      const { error } = await supabase
        .from("offers")
        .update({ status: "countered", counter_price: price, counter_message: message || null })
        .eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Counter offer sent!");
      setCounterDialogOpen(false);
      setSelectedOffer(null);
      setCounterPrice("");
      setCounterMessage("");
      queryClient.invalidateQueries({ queryKey: ["received-offers", user?.id] });
    },
    onError: (error) => {
      console.error("Error sending counter offer:", error);
      toast.error("Failed to send counter offer");
    },
  });

  const handleCounterOffer = () => {
    if (!selectedOffer || !counterPrice) return;
    const price = Number(counterPrice);
    if (price <= 0 || isNaN(price)) {
      toast.error("Please enter a valid price");
      return;
    }
    setSubmitting(true);
    counterOfferMutation.mutate(
      { offerId: selectedOffer.id, price, message: counterMessage },
      { onSettled: () => setSubmitting(false) }
    );
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  const pendingReceived = receivedOffers?.filter(o => o.status === "pending") || [];
  const pendingSent = sentOffers?.filter(o => o.status === "pending") || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Offers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage offers for your listings</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="received">
            Received
            {pendingReceived.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingReceived.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent
            {pendingSent.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingSent.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {receivedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : receivedOffers && receivedOffers.length > 0 ? (
            <div className="space-y-4">
              {receivedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} type="received" onAccept={acceptOfferMutation.mutate} onDecline={declineOfferMutation.mutate} onCounter={(offer) => { setSelectedOffer(offer); setCounterDialogOpen(true); }} />
              ))}
            </div>
          ) : (
            <EmptyState message="No offers received yet" description="When buyers make offers on your listings, they'll appear here." />
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : sentOffers && sentOffers.length > 0 ? (
            <div className="space-y-4">
              {sentOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} type="sent" />
              ))}
            </div>
          ) : (
            <EmptyState message="No sent offers yet" description="Browse listings and make offers to start negotiating." showBrowseButton />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Counter Offer</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4 py-4">
              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your asking price:</span>
                  <span className="font-semibold">{formatNPR(selectedOffer.listing.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Their offer:</span>
                  <span className="font-semibold">{formatNPR(selectedOffer.offer_price)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="counter-price">Your Counter Offer *</Label>
                <Input id="counter-price" type="number" placeholder="Enter your counter offer" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} min="0" step="1000" />
                {counterPrice && Number(counterPrice) > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Difference: {formatNPR(Math.abs(Number(counterPrice) - selectedOffer.offer_price))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="counter-message">Message (Optional)</Label>
                <Textarea id="counter-message" placeholder="Explain your counter offer..." value={counterMessage} onChange={(e) => { if (e.target.value.length <= 300) setCounterMessage(e.target.value); }} rows={3} maxLength={300} />
                <p className="text-xs text-muted-foreground text-right">{counterMessage.length}/300 characters</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setCounterDialogOpen(false)} disabled={submitting}>Cancel</Button>
                <Button className="flex-1" disabled={!counterPrice || Number(counterPrice) <= 0 || submitting} onClick={handleCounterOffer}>
                  {submitting ? "Sending..." : "Send Counter Offer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferCard({ offer, type, onAccept, onDecline, onCounter }: any) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/listings/$id" params={{ id: offer.listing.id }} className="w-full sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {offer.listing.images?.[0] ? (
            <img src={offer.listing.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No photo</div>
          )}
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/listings/$id" params={{ id: offer.listing.id }} className="font-semibold hover:text-primary transition-colors">
              {offer.listing.title}
            </Link>
            <Badge variant={offer.status === "pending" ? "secondary" : offer.status === "accepted" ? "default" : offer.status === "countered" ? "outline" : "destructive"} className="capitalize">
              {offer.status}
            </Badge>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{type === "received" ? "Your asking price:" : "Asking price:"}</span>
              <span className="font-semibold">{formatNPR(offer.listing.price)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{type === "received" ? "Offer price:" : "Your offer:"}</span>
              <span className="font-semibold text-primary">{formatNPR(offer.offer_price)}</span>
            </div>
            {offer.counter_price && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{type === "received" ? "Your counter:" : "Seller's counter:"}</span>
                <span className="font-semibold text-blue-600">{formatNPR(offer.counter_price)}</span>
              </div>
            )}
          </div>
          {offer.message && <p className="text-sm text-muted-foreground italic">"{offer.message}"</p>}
          <div className="text-xs text-muted-foreground">
            {type === "received" ? `From: ${offer.buyer?.name || offer.buyer?.email || "Unknown"}` : `To: ${offer.seller?.name || offer.seller?.email || "Unknown"}`} •{" "}
            {new Date(offer.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </div>
          {type === "received" && offer.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => onAccept(offer.id)} className="bg-green-600 hover:bg-green-700">Accept</Button>
              <Button size="sm" variant="outline" onClick={() => onCounter(offer)}>Counter</Button>
              <Button size="sm" variant="outline" onClick={() => onDecline(offer.id)} className="text-destructive">Decline</Button>
            </div>
          )}
          {type === "sent" && offer.status === "accepted" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-green-700 font-medium">✓ Your offer was accepted! Contact the seller to complete the purchase.</p>
            </div>
          )}
          {type === "sent" && offer.status === "countered" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-700 font-medium">The seller has made a counter offer. View the listing to accept or decline.</p>
              <Button asChild size="sm" className="mt-2 gap-1">
                <Link to="/listings/$id" params={{ id: offer.listing.id }}>View Listing <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ message, description, showBrowseButton }: any) {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Tag className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {showBrowseButton && (
        <Button asChild>
          <Link to="/browse">Browse Listings</Link>
        </Button>
      )}
    </Card>
  );
}
