import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatNPR } from "@/lib/nepal";
import { Loader2, CheckCircle, XCircle, Reply } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/offers")({
  component: OffersPage,
  head: () => ({ meta: [{ title: "My Offers — MyRideNepal" }] }),
});

type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_price: number;
  message: string | null;
  status: string;
  counter_price: number | null;
  counter_message: string | null;
  created_at: string;
  buyer_email?: string;
  buyer_name?: string;
  listing_title?: string;
  listing_image?: string;
  listing_price?: number;
};

function OffersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [counterDialogOpen, setCounterDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: "/dashboard/offers" } as any });
    }
  }, [user, loading]);

  const { data: receivedOffers, isLoading: loadingReceived } = useQuery({
    queryKey: ["received-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          buyer:buyer_id(email, raw_user_meta_data),
          listing:listing_id(title, images, price)
        `)
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((offer: any) => ({
        id: offer.id,
        listing_id: offer.listing_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        offer_price: offer.offer_price,
        message: offer.message,
        status: offer.status,
        counter_price: offer.counter_price,
        counter_message: offer.counter_message,
        created_at: offer.created_at,
        buyer_email: offer.buyer?.email,
        buyer_name: offer.buyer?.raw_user_meta_data?.full_name || offer.buyer?.email?.split('@')[0] || "Buyer",
        listing_title: offer.listing?.title,
        listing_image: offer.listing?.images?.[0],
        listing_price: offer.listing?.price,
      })) as Offer[];
    },
  });

  const { data: sentOffers, isLoading: loadingSent } = useQuery({
    queryKey: ["sent-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          listing:listing_id(title, images, price, user_id)
        `)
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((offer: any) => ({
        id: offer.id,
        listing_id: offer.listing_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        offer_price: offer.offer_price,
        message: offer.message,
        status: offer.status,
        counter_price: offer.counter_price,
        counter_message: offer.counter_message,
        created_at: offer.created_at,
        listing_title: offer.listing?.title,
        listing_image: offer.listing?.images?.[0],
        listing_price: offer.listing?.price,
      })) as Offer[];
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { error } = await supabase
        .from("offers")
        .update({ status: "accepted" })
        .eq("id", offer.id);

      if (error) throw error;

      // TODO(security-s3): restore trusted buyer notifications via trigger/server function.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["received-offers"] });
      toast.success("Offer accepted successfully!");
    },
    onError: () => {
      toast.error("Failed to accept offer");
    },
  });

  const declineOfferMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { error } = await supabase
        .from("offers")
        .update({ status: "declined" })
        .eq("id", offer.id);

      if (error) throw error;

      // TODO(security-s3): restore trusted buyer notifications via trigger/server function.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["received-offers"] });
      toast.success("Offer declined");
    },
    onError: () => {
      toast.error("Failed to decline offer");
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOffer) return;

      const { error } = await supabase
        .from("offers")
        .update({
          status: "countered",
          counter_price: Number(counterPrice),
          counter_message: counterMessage || null,
        })
        .eq("id", selectedOffer.id);

      if (error) throw error;

      // TODO(security-s3): restore trusted buyer notifications via trigger/server function.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["received-offers"] });
      setCounterDialogOpen(false);
      setCounterPrice("");
      setCounterMessage("");
      setSelectedOffer(null);
      toast.success("Counter offer sent!");
    },
    onError: () => {
      toast.error("Failed to send counter offer");
    },
  });

  const acceptCounterMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { error } = await supabase
        .from("offers")
        .update({ status: "accepted" })
        .eq("id", offer.id);

      if (error) throw error;

      // TODO(security-s3): restore trusted seller notifications via trigger/server function.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent-offers"] });
      toast.success("Counter offer accepted!");
    },
    onError: () => {
      toast.error("Failed to accept counter offer");
    },
  });

  const declineCounterMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { error } = await supabase
        .from("offers")
        .update({ status: "declined" })
        .eq("id", offer.id);

      if (error) throw error;

      // TODO(security-s3): restore trusted seller notifications via trigger/server function.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent-offers"] });
      toast.success("Counter offer declined");
    },
    onError: () => {
      toast.error("Failed to decline counter offer");
    },
  });

  if (loading || !user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      accepted: { color: "bg-green-100 text-green-800 border-green-200", label: "Accepted" },
      declined: { color: "bg-red-100 text-red-800 border-red-200", label: "Declined" },
      countered: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Countered" },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={`${variant.color} border`} variant="outline">
        {variant.label}
      </Badge>
    );
  };

  const OfferCard = ({ offer, showActions }: { offer: Offer; showActions: boolean }) => (
    <Card className="p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {offer.listing_image ? (
            <img
              src={offer.listing_image}
              alt={offer.listing_title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {offer.buyer_name?.charAt(0).toUpperCase() || "B"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{offer.listing_title}</h3>
              <p className="text-sm text-muted-foreground">
                {showActions ? `From ${offer.buyer_name}` : `Asking price: ${formatNPR(offer.listing_price || 0)}`}
              </p>
            </div>
            {getStatusBadge(offer.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Offer Amount</p>
              <p className="text-xl font-bold text-primary">{formatNPR(offer.offer_price)}</p>
            </div>
            {offer.counter_price && (
              <div>
                <p className="text-xs text-muted-foreground">Counter Offer</p>
                <p className="text-xl font-bold text-blue-600">{formatNPR(offer.counter_price)}</p>
              </div>
            )}
          </div>

          {offer.message && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Message</p>
              <p className="text-sm">{offer.message}</p>
            </div>
          )}

          {offer.counter_message && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">Counter Offer Message</p>
              <p className="text-sm">{offer.counter_message}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-3">
            {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
          </p>

          {showActions && offer.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => acceptOfferMutation.mutate(offer)}
                disabled={acceptOfferMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept Offer
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => declineOfferMutation.mutate(offer)}
                disabled={declineOfferMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90"
                onClick={() => {
                  setSelectedOffer(offer);
                  setCounterDialogOpen(true);
                }}
              >
                <Reply className="w-4 h-4 mr-1" />
                Counter Offer
              </Button>
            </div>
          )}

          {!showActions && offer.status === "countered" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => acceptCounterMutation.mutate(offer)}
                disabled={acceptCounterMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept Counter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => declineCounterMutation.mutate(offer)}
                disabled={declineCounterMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline Counter
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">My Offers</h1>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="received">Received Offers</TabsTrigger>
          <TabsTrigger value="sent">Sent Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {loadingReceived ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : receivedOffers && receivedOffers.length > 0 ? (
            <div className="space-y-4">
              {receivedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} showActions={true} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No offers received yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {loadingSent ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : sentOffers && sentOffers.length > 0 ? (
            <div className="space-y-4">
              {sentOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} showActions={false} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">You haven't made any offers yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Counter Price (NPR)</Label>
              <Input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                placeholder="Enter your counter offer amount"
              />
              {selectedOffer && counterPrice && (
                <p className="text-xs text-muted-foreground mt-1">
                  Original offer: {formatNPR(selectedOffer.offer_price)} · Difference:{" "}
                  {formatNPR(Math.abs(Number(counterPrice) - selectedOffer.offer_price))}
                </p>
              )}
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explain your counter offer..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCounterDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => counterOfferMutation.mutate()}
                disabled={!counterPrice || Number(counterPrice) <= 0 || counterOfferMutation.isPending}
              >
                {counterOfferMutation.isPending ? "Sending..." : "Send Counter Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
