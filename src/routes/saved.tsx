import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToggleSave, useSavedIds } from "@/hooks/use-saved";
import { ListingCard } from "@/components/ListingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  head: () => ({ meta: [{ title: "Saved Listings — MyRideNepal" }] }),
});

function SavedPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: savedIds } = useSavedIds();
  const toggle = useToggleSave();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/saved" } as any });
  }, [user, loading]);

  const ids = Array.from(savedIds ?? []);
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["saved-full", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("public_listings")
      .select("id,title,brand,price,year,mileage,district,condition,images,featured")
      .in("id", ids)).data ?? [],
  });

  if (loading || !user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Saved listings</h1>
              {ids.length > 0 && (
                <p className="text-sm text-muted-foreground mt-0.5">{ids.length} bike{ids.length !== 1 ? "s" : ""} saved</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {ids.length === 0 ? (
          <Card className="p-16 text-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h2 className="font-semibold text-lg mb-1">No saved listings yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Tap the heart icon on any listing to save it here for quick access later.
            </p>
            <Button asChild className="gap-2">
              <Link to="/browse">
                Browse bikes <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        ) : listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: Math.min(ids.length, 6) }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(l => (
              <ListingCard key={l.id} listing={l as any} onSave={toggle} isSaved={savedIds?.has(l.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
