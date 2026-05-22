import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { AccessDenied } from "@/components/AccessDenied";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Check, Share2, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";
import { formatNPR } from "@/lib/nepal";
import { toast } from "sonner";

export const Route = createFileRoute("/dealer/dashboard/share")({
  component: SharePage,
});

function SharePage() {
  const { user } = useAuth();
  const { canUseShareTools, isLoading: accessLoading } = useDealerAccess();
  const [selectedListingId, setSelectedListingId] = useState<string>("");
  const [copiedPlatform, setCopiedPlatform] = useState<string>("");

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canUseShareTools) {
    return (
      <AccessDenied message="Only owners and listing managers can use share tools. Contact your manager if you need access." />
    );
  }

  // Fetch dealer profile
  const { data: dealerProfile } = useQuery({
    queryKey: ["dealer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch dealer listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ["dealer-listings-share", dealerProfile?.user_id],
    enabled: !!dealerProfile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, year, condition, mileage, images")
        .eq("user_id", dealerProfile!.user_id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const selectedListing = listings?.find(l => l.id === selectedListingId);

  const generateCaption = (platform: "facebook" | "instagram" | "tiktok" | "whatsapp") => {
    if (!selectedListing || !dealerProfile) return "";

    const listingUrl = `https://myridenepal.com/listings/${selectedListing.id}`;
    const bikeName = selectedListing.title;
    const price = formatNPR(selectedListing.price);
    const year = selectedListing.year || "N/A";
    const condition = selectedListing.condition || "Used";
    const dealerName = dealerProfile.business_name;
    const location = dealerProfile.district || "Kathmandu";

    const hashtags = {
      facebook: "#MyRideNepal #BikeSaleNepal #KathmanduBikes #NepalBikes #BikeDealer",
      instagram: "#MyRideNepal #BikeSaleNepal #KathmanduBikes #NepalBikes #BikeDealer #MotorcycleSale #BikeForSale",
      tiktok: "#MyRideNepal #BikeSaleNepal #KathmanduBikes #NepalBikes #BikeDealer #MotorcycleSale #BikeForSale #NepalTikTok",
      whatsapp: ""
    };

    const captions = {
      facebook: `🏍️ ${bikeName} - ${condition}

💰 Price: ${price}
📅 Year: ${year}
📍 Location: ${location}
🏢 Dealer: ${dealerName}

✅ Ready for immediate delivery
✅ Test ride available
✅ Documentation support

🔗 View details: ${listingUrl}

${hashtags.facebook}`,

      instagram: `🏍️ ${bikeName}

💰 ${price} | 📅 ${year}
📍 ${location}

${condition} • Ready to ride
Test ride available ✅

👉 Check link in bio or DM for details

${hashtags.instagram}`,

      tiktok: `🏍️ ${bikeName} for sale!

💰 ${price}
📅 ${year} model
📍 ${location}

${condition} condition
Ready for you! 🔥

Link in bio! 👆

${hashtags.tiktok}`,

      whatsapp: `🏍️ *${bikeName}*

💰 Price: ${price}
📅 Year: ${year}
📍 Location: ${location}
🏢 Dealer: ${dealerName}

Condition: ${condition}
Test ride available ✅

View full details here:
${listingUrl}

Interested? Let me know! 😊`
    };

    return captions[platform];
  };

  const copyCaption = async (platform: "facebook" | "instagram" | "tiktok" | "whatsapp") => {
    const caption = generateCaption(platform);
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedPlatform(platform);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} caption copied!`);
      setTimeout(() => setCopiedPlatform(""), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Share2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create listings to generate share cards
        </p>
        <Button asChild>
          <a href="/sell">Create Listing</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Share Card Generator</h2>
        <p className="text-muted-foreground">Create social media posts for your listings</p>
      </div>

      {/* Listing Selector */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">Select Listing</label>
        <Select value={selectedListingId} onValueChange={setSelectedListingId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a listing to share" />
          </SelectTrigger>
          <SelectContent>
            {listings.map((listing) => (
              <SelectItem key={listing.id} value={listing.id}>
                {listing.title} - {formatNPR(listing.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Preview Card */}
      {selectedListing && (
        <>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="max-w-md mx-auto border rounded-lg overflow-hidden bg-card">
              {selectedListing.images?.[0] && (
                <img
                  src={selectedListing.images[0]}
                  alt={selectedListing.title}
                  className="w-full aspect-video object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-lg">{selectedListing.title}</h4>
                <p className="text-2xl font-bold text-primary">{formatNPR(selectedListing.price)}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>📅 {selectedListing.year || "N/A"}</span>
                  <span>📊 {selectedListing.condition || "Used"}</span>
                  {selectedListing.mileage && <span>🛣️ {selectedListing.mileage} km</span>}
                </div>
                {dealerProfile && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium">{dealerProfile.business_name}</p>
                    <p className="text-xs text-muted-foreground">
                      📍 {dealerProfile.district || "Kathmandu"}
                    </p>
                  </div>
                )}
                <div className="pt-3">
                  <p className="text-xs text-muted-foreground">MyRideNepal.com</p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              💡 Image download feature coming soon
            </p>
          </Card>

          {/* Caption Buttons */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Copy Caption For:</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-4"
                onClick={() => copyCaption("facebook")}
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">Facebook</div>
                  <div className="text-xs text-muted-foreground">
                    {copiedPlatform === "facebook" ? "Copied!" : "Copy caption"}
                  </div>
                </div>
                {copiedPlatform === "facebook" ? (
                  <Check className="h-4 w-4 ml-auto text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 ml-auto" />
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-4"
                onClick={() => copyCaption("instagram")}
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                <div className="text-left">
                  <div className="font-semibold">Instagram</div>
                  <div className="text-xs text-muted-foreground">
                    {copiedPlatform === "instagram" ? "Copied!" : "Copy caption"}
                  </div>
                </div>
                {copiedPlatform === "instagram" ? (
                  <Check className="h-4 w-4 ml-auto text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 ml-auto" />
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-4"
                onClick={() => copyCaption("tiktok")}
              >
                <div className="h-5 w-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                  T
                </div>
                <div className="text-left">
                  <div className="font-semibold">TikTok</div>
                  <div className="text-xs text-muted-foreground">
                    {copiedPlatform === "tiktok" ? "Copied!" : "Copy caption"}
                  </div>
                </div>
                {copiedPlatform === "tiktok" ? (
                  <Check className="h-4 w-4 ml-auto text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 ml-auto" />
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-2 h-auto py-4"
                onClick={() => copyCaption("whatsapp")}
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-xs text-muted-foreground">
                    {copiedPlatform === "whatsapp" ? "Copied!" : "Copy caption"}
                  </div>
                </div>
                {copiedPlatform === "whatsapp" ? (
                  <Check className="h-4 w-4 ml-auto text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 ml-auto" />
                )}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
