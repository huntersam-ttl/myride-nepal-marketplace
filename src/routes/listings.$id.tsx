import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListingCard } from "@/components/ListingCard";
import { formatNPR, whatsappLink } from "@/lib/nepal";
import { Phone, MessageCircle, MapPin, Calendar, Gauge, Fuel, Bike, Heart, GitCompare } from "lucide-react";
import { useSavedIds, useToggleSave } from "@/hooks/use-saved";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetailPage,
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("listings").select("*").eq("id", params.id).maybeSingle();
    if (error || !data) throw notFound();
    // increment views (best effort)
    supabase.from("listings").update({ views: (data.views ?? 0) + 1 }).eq("id", params.id).then(() => {});
    return { listing: data };
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <Link to="/browse" className="text-primary mt-3 inline-block">Browse all listings</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.listing?.title ?? "Listing"} — MyRideNepal` },
      { name: "description", content: loaderData?.listing?.description?.slice(0, 160) ?? "Bike for sale on MyRideNepal" },
      { property: "og:image", content: loaderData?.listing?.images?.[0] ?? "" },
    ],
  }),
});

function ListingDetailPage() {
  const { listing } = Route.useLoaderData();
  const [imgIdx, setImgIdx] = useState(0);
  const cover = listing.images?.[imgIdx] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200";

  const { data: similar } = useQuery({
    queryKey: ["similar", listing.brand, listing.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured")
        .eq("status", "active").eq("brand", listing.brand).neq("id", listing.id).limit(4);
      return data ?? [];
    },
  });

  const waMsg = `Hi, I saw your listing "${listing.title}" on MyRideNepal. Is it still available?`;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">← Back to listings</Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-4">
        <div>
          {/* Gallery */}
          <div className="rounded-xl overflow-hidden bg-muted aspect-[4/3]">
            <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {listing.images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.district}</span>
                  <Badge variant="secondary" className="capitalize">{listing.condition}</Badge>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">{formatNPR(listing.price)}</p>
            </div>
          </div>

          {/* Specs */}
          <Card className="mt-6 p-5">
            <h2 className="font-semibold mb-4">Key specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Spec icon={Calendar} label="Year" value={String(listing.year)} />
              <Spec icon={Gauge} label="Mileage" value={`${listing.mileage.toLocaleString()} km`} />
              <Spec icon={Fuel} label="Fuel" value={listing.fuel_type} />
              <Spec icon={Bike} label="Brand" value={listing.brand} />
              <Spec icon={Bike} label="Model" value={listing.model} />
              <Spec icon={Bike} label="Type" value={listing.bike_type} />
              {listing.colour && <Spec icon={Bike} label="Colour" value={listing.colour} />}
            </div>
          </Card>

          {listing.description && (
            <Card className="mt-6 p-5">
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground leading-relaxed">{listing.description}</p>
            </Card>
          )}
        </div>

        {/* Sticky contact card */}
        <aside>
          <Card className="p-5 sticky top-20">
            <p className="text-sm text-muted-foreground">Contact seller</p>
            <p className="font-semibold mt-1">MyRideNepal Verified Listing</p>
            <div className="space-y-2 mt-4">
              <Button asChild size="lg" className="w-full gap-2">
                <a href={whatsappLink(listing.whatsapp || listing.phone, waMsg)} target="_blank" rel="noopener">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full gap-2">
                <a href={`tel:${listing.phone}`}><Phone className="w-4 h-4" /> Call seller</a>
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Button variant="ghost" size="sm" className="gap-2"><Heart className="w-4 h-4" /> Save</Button>
              <Button variant="ghost" size="sm" className="gap-2"><Flag className="w-4 h-4" /> Report</Button>
            </div>
          </Card>
        </aside>
      </div>

      {/* Similar */}
      {similar && similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-5">Similar {listing.brand} listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.map(l => <ListingCard key={l.id} listing={l as any} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}
