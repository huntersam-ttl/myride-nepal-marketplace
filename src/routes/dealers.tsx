import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, Store, ArrowRight } from "lucide-react";

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

  const verified = (data ?? []).filter(d => d.verified);
  const unverified = (data ?? []).filter(d => !d.verified);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Verified dealers</h1>
              <p className="text-muted-foreground mt-1">Established showrooms and trusted sellers across Nepal.</p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/dealer-signup">
                Become a dealer <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          {!isLoading && data && data.length > 0 && (
            <div className="flex gap-6 mt-6 text-sm">
              <div>
                <span className="font-bold text-xl">{verified.length}</span>
                <span className="text-muted-foreground ml-2">Verified dealers</span>
              </div>
              <div>
                <span className="font-bold text-xl">{data.length}</span>
                <span className="text-muted-foreground ml-2">Total dealers</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border overflow-hidden animate-pulse">
                <div className="h-28 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-8">
            {verified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">Verified dealers</h2>
                  <Badge variant="outline" className="text-xs">{verified.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {verified.map(d => <DealerCard key={d.id} dealer={d} />)}
                </div>
              </div>
            )}
            {unverified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-muted-foreground">Other dealers</h2>
                  <Badge variant="secondary" className="text-xs">{unverified.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {unverified.map(d => <DealerCard key={d.id} dealer={d} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-16 text-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h2 className="font-semibold text-lg mb-1">No dealers yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Be the first verified dealer on MyRideNepal.</p>
            <Button asChild>
              <Link to="/dealer-signup">Register as a dealer</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function DealerCard({ dealer: d }: { dealer: any }) {
  return (
    <Link to="/dealers/$slug" params={{ slug: d.slug }}>
      <Card className="overflow-hidden h-full group hover:shadow-[var(--shadow-elegant)] transition-shadow shadow-[var(--shadow-card)]">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-primary/15 to-secondary/20 relative overflow-hidden">
          {d.banner_url && (
            <img src={d.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          {d.verified && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className="gap-1 bg-white/90 text-primary border-0 shadow-sm text-xs">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 -mt-8 mb-3">
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl bg-card border-2 border-card shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {d.logo_url
                ? <img src={d.logo_url} alt="" className="w-full h-full object-cover" />
                : <Store className="w-6 h-6 text-muted-foreground" />
              }
            </div>
            <div className="min-w-0 pt-8">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{d.business_name}</h3>
              {d.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{d.location}
                </p>
              )}
            </div>
          </div>

          {d.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{d.description}</p>
          )}

          {d.brands && d.brands.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {d.brands.slice(0, 4).map((b: string) => (
                <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
              ))}
              {d.brands.length > 4 && (
                <Badge variant="secondary" className="text-xs">+{d.brands.length - 4}</Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
