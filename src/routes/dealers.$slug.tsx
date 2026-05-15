import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Store } from "lucide-react";

export const Route = createFileRoute("/dealers/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("dealer_profiles").select("*").eq("slug", params.slug).maybeSingle();
    if (error || !data) throw notFound();
    return { dealer: data };
  },
  component: DealerProfilePage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Dealer not found</h1>
      <Link to="/dealers" className="text-primary mt-3 inline-block">Browse all dealers</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="container mx-auto py-20 text-center text-destructive">{error.message}</div>,
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

  return (
    <div>
      <div className="h-44 md:h-56 bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 relative">
        {dealer.banner_url && <img src={dealer.banner_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="container mx-auto px-4 -mt-12 md:-mt-16 relative">
        <div className="bg-card rounded-xl border shadow-[var(--shadow-elegant)] p-5 md:p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted border-4 border-card overflow-hidden flex items-center justify-center flex-shrink-0 -mt-12 md:-mt-16">
              {dealer.logo_url ? <img src={dealer.logo_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{dealer.business_name}</h1>
                {dealer.verified && (
                  <Badge className="gap-1 bg-primary/10 text-primary border-primary/30" variant="outline">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              {dealer.location && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> {dealer.location}</p>}
              {dealer.description && <p className="text-sm mt-3 text-muted-foreground">{dealer.description}</p>}
              {dealer.brands && dealer.brands.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {dealer.brands.map((b: string) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-10 pb-12">
          <h2 className="text-xl font-bold mb-4">Listings ({listings?.length ?? 0})</h2>
          {listings?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l) => <ListingCard key={l.id} listing={l as any} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No active listings yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
