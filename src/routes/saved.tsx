import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToggleSave, useSavedIds } from "@/hooks/use-saved";
import { ListingCard } from "@/components/ListingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";

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
  const { data: listings } = useQuery({
    queryKey: ["saved-full", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("listings")
      .select("id,title,brand,price,year,mileage,district,condition,images,featured")
      .in("id", ids)).data ?? [],
  });

  if (loading || !user) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-primary fill-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Saved listings</h1>
      </div>
      {ids.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">You haven't saved any listings yet.</p>
          <Button asChild><Link to="/browse">Browse bikes</Link></Button>
        </Card>
      ) : listings?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(l => <ListingCard key={l.id} listing={l as any} onSave={toggle} isSaved={savedIds?.has(l.id)} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      )}
    </div>
  );
}
