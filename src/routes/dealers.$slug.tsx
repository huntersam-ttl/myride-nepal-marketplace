import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Store, Phone, MessageCircle, Clock, Facebook, Youtube, Instagram, CheckCircle, Wrench, MapPinned, AlertTriangle, Calendar } from "lucide-react";
import { whatsappLink, telLink, formatNPR } from "@/lib/nepal";

// TikTok icon (Lucide doesn't have it)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const Route = createFileRoute("/dealers/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("dealer_profiles").select("*").eq("slug", params.slug).maybeSingle();
    if (error || !data) throw notFound();
    return { dealer: data };
  },
  component: DealerProfilePage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-muted-foreground opacity-40" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Dealer not found</h1>
        <p className="text-muted-foreground mb-6">This dealer doesn't exist or has been removed.</p>
        <Link to="/dealers">
          <Button variant="default">Browse all dealers</Button>
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-destructive mb-2">Error loading dealer</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Link to="/dealers">
          <Button variant="outline">Back to dealers</Button>
        </Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.dealer?.business_name ?? "Dealer"} — MyRideNepal` },
      { name: "description", content: loaderData?.dealer?.description?.slice(0, 160) ?? "Verified bike dealer in Nepal" },
    ],
  }),
});

function DealerProfilePage() {
  const { dealer } = Route.useLoaderData();
  const { data: listings } = useQuery({
    queryKey: ["dealer-listings", dealer.user_id],
    queryFn: async () => {
      const { data: listings } = await supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured,accident_history,num_owners,user_id,has_bluebook,has_insurance,has_tax_clearance,has_registration")
        .eq("user_id", dealer.user_id).eq("status", "active")
        .order("created_at", { ascending: false });
      
      // Fetch verification level
      if (listings && listings.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, verification_level")
          .eq("id", dealer.user_id)
          .maybeSingle();

        return listings.map(listing => ({
          ...listing,
          verification_level: profiles?.verification_level || null,
        }));
      }

      return listings ?? [];
    },
  });

  // Fetch recently sold listings
  const { data: soldListings } = useQuery({
    queryKey: ["dealer-sold-listings", dealer.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id,title,price,sold_at,images")
        .eq("user_id", dealer.user_id)
        .eq("status", "sold")
        .not("sold_at", "is", null)
        .order("sold_at", { ascending: false })
        .limit(10);
      
      return data ?? [];
    },
  });

  // Track analytics event
  const trackEvent = async (eventType: string, listingId?: string) => {
    try {
      await supabase.from("dealer_analytics_events").insert({
        dealer_id: dealer.id,
        listing_id: listingId || null,
        event_type: eventType,
        source: "profile_page",
      });
    } catch (error) {
      // Silently fail - don't block user action
      console.error("Failed to track event:", error);
    }
  };

  // Create lead on contact click
  const createLead = async (clickType: "whatsapp" | "phone") => {
    try {
      await supabase.from("dealer_leads").insert({
        dealer_id: dealer.id,
        source: "profile_contact",
        stage: "new",
        whatsapp_click: clickType === "whatsapp",
        phone_click: clickType === "phone",
      });
    } catch (error) {
      // Silently fail
      console.error("Failed to create lead:", error);
    }
  };

  const handleWhatsAppClick = async () => {
    await trackEvent("whatsapp_click");
    await createLead("whatsapp");
  };

  const handlePhoneClick = async () => {
    await trackEvent("phone_click");
    await createLead("phone");
  };

  const whatsappMessage = `Hi ${dealer.business_name}, I found your showroom on MyRideNepal and I'm interested in your bikes. Can you help me?`;
  const whatsappUrl = dealer.whatsapp ? whatsappLink(dealer.whatsapp, whatsappMessage) : null;
  const phoneUrl = dealer.phone ? telLink(dealer.phone) : null;
  
  // Parse opening hours (can be JSON or simple string)
  let openingHours: Record<string, string> | null = null;
  try {
    if (dealer.opening_hours && typeof dealer.opening_hours === 'object') {
      openingHours = dealer.opening_hours as Record<string, string>;
    }
  } catch {
    // Ignore parse errors
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Banner */}
      <div className="h-44 md:h-56 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 relative overflow-hidden">
        {dealer.banner_url && <img src={dealer.banner_url} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="container mx-auto px-4 -mt-12 md:-mt-16 relative pb-12">
        {/* Header Card */}
        <Card className="p-5 md:p-6 shadow-[var(--shadow-elegant)]">
          <div className="flex items-start gap-4 flex-wrap">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted border-4 border-card overflow-hidden flex items-center justify-center flex-shrink-0 -mt-12 md:-mt-16 shadow-md">
              {dealer.logo_url 
                ? <img src={dealer.logo_url} alt={dealer.business_name} className="w-full h-full object-cover" /> 
                : <Store className="w-8 h-8 text-muted-foreground" />
              }
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{dealer.business_name}</h1>
                {dealer.verified && (
                  <Badge className="gap-1 bg-primary/10 text-primary border-primary/30" variant="outline">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              
              {/* Location and years */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                {(dealer.district || dealer.location) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {dealer.district || dealer.location}
                  </span>
                )}
                {dealer.years_in_business && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {dealer.years_in_business} years in business
                  </span>
                )}
              </div>
              
              {dealer.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{dealer.description}</p>
              )}
              
              {/* Brands carried */}
              {dealer.brands && dealer.brands.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dealer.brands.map((b: string) => (
                    <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            {(dealer.exchange_accepted || dealer.financing_available || dealer.service_centre) && (
              <Card className="p-5">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5" /> Services
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {dealer.exchange_accepted && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Exchange accepted</span>
                    </div>
                  )}
                  {dealer.financing_available && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Financing available</span>
                    </div>
                  )}
                  {dealer.service_centre && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Service centre</span>
                    </div>
                  )}
                </div>
                
                {/* Service areas */}
                {dealer.service_area && dealer.service_area.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MapPinned className="w-4 h-4" /> Service areas:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dealer.service_area.slice(0, 10).map((area: string) => (
                        <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                      {dealer.service_area.length > 10 && (
                        <Badge variant="outline" className="text-xs">+{dealer.service_area.length - 10} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Inventory */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                Inventory {listings && listings.length > 0 && `(${listings.length})`}
              </h2>
              {listings && listings.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {listings.map((l) => <ListingCard key={l.id} listing={l as any} />)}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No active listings yet</p>
                </Card>
              )}
            </div>

            {/* Recently Sold */}
            {soldListings && soldListings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Recently Sold</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {soldListings.map((listing: any) => (
                    <Card key={listing.id} className="overflow-hidden opacity-75">
                      <div className="relative">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-blue-500">Sold</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatNPR(listing.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sold {new Date(listing.sold_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer Protection Tips */}
            <Card className="p-5 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <AlertTriangle className="w-5 h-5" /> Buyer Protection Tips
              </h3>
              <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Always inspect the bike thoroughly before making any payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Meet at the dealer's showroom address for safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Never pay 100% in advance without receiving the bike</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Check the bluebook and confirm ownership transfer process</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Card */}
            <Card className="p-5 sticky top-4">
              <h3 className="font-bold mb-4">Contact Showroom</h3>
              
              <div className="space-y-2">
                {phoneUrl && (
                  <Button asChild className="w-full gap-2" size="lg" onClick={handlePhoneClick}>
                    <a href={phoneUrl}>
                      <Phone className="w-4 h-4" /> Call Now
                    </a>
                  </Button>
                )}
                
                {whatsappUrl && (
                  <Button asChild variant="outline" className="w-full gap-2" size="lg" onClick={handleWhatsAppClick}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  </Button>
                )}
              </div>

              {/* Opening Hours */}
              {openingHours && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" /> Opening Hours
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize text-muted-foreground">{day}</span>
                        <span className="font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              {dealer.full_address && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" /> Address
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{dealer.full_address}</p>
                  
                  {/* Google Maps link */}
                  <Button asChild variant="outline" size="sm" className="w-full mt-3 gap-2">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.full_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPinned className="w-4 h-4" /> View on Map
                    </a>
                  </Button>
                </div>
              )}

              {/* Social Links */}
              {(dealer.facebook_url || dealer.instagram_url || dealer.youtube_url || dealer.tiktok_url) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 text-sm">Follow Us</h4>
                  <div className="flex gap-2">
                    {dealer.facebook_url && (
                      <Button asChild variant="outline" size="icon">
                        <a href={dealer.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                          <Facebook className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {dealer.instagram_url && (
                      <Button asChild variant="outline" size="icon">
                        <a href={dealer.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                          <Instagram className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {dealer.youtube_url && (
                      <Button asChild variant="outline" size="icon">
                        <a href={dealer.youtube_url} target="_blank" rel="noopener noreferrer" title="YouTube">
                          <Youtube className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {dealer.tiktok_url && (
                      <Button asChild variant="outline" size="icon">
                        <a href={dealer.tiktok_url} target="_blank" rel="noopener noreferrer" title="TikTok">
                          <TikTokIcon className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
