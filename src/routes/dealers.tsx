import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dealers")({
  component: DealersPage,
  head: () => ({
    meta: [
      { title: "Verified Dealers — MyRideNepal" },
      { name: "description", content: "Browse trusted bike and scooter dealers across Nepal." },
    ],
  }),
});

function DealersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_profiles")
        .select("*")
        .order("verified", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Verified dealers</h1>
          <p className="text-muted-foreground mt-1">Established showrooms and bike sellers across Nepal.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dealer-signup">Become a dealer</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading…</div>
      ) : data?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((d) => (
            <Link key={d.id} to="/dealers/$slug" params={{ slug: d.slug }}>
              <Card className="overflow-hidden h-full hover:shadow-[var(--shadow-elegant)] transition-shadow">
                <div className="h-28 bg-gradient-to-br from-primary/15 to-secondary/20 relative">
                  {d.banner_url && <img src={d.banner_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {d.logo_url ? <img src={d.logo_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{d.business_name}</h3>
                        {d.verified && <Badge className="gap-1 bg-primary/10 text-primary border-primary/30" variant="outline"><ShieldCheck className="w-3 h-3" /> Verified</Badge>}
                      </div>
                      {d.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.location}</p>}
                    </div>
                  </div>
                  {d.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{d.description}</p>}
                  {d.brands && d.brands.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {d.brands.slice(0, 4).map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No dealers yet. Be the first!</p>
          <Button asChild><Link to="/dealer-signup">Register as a dealer</Link></Button>
        </Card>
      )}
    </div>
  );
}
