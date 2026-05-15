import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToggleSave, useSavedIds } from "@/hooks/use-saved";
import { ListingCard } from "@/components/ListingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Heart, ArrowRight, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  head: () => ({ meta: [{ title: "Saved Listings — MyRideNepal" }] }),
});

function SavedPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: savedIds } = useSavedIds();
  const toggle = useToggleSave();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/saved" } as any });
  }, [user, loading]);

  const ids = Array.from(savedIds ?? []);
  
  // Fetch full saved listings data including notify_price_drop
  const { data: savedListings, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-full-data", user?.id],
    enabled: !!user && ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_listings")
        .select("*, listings(id,title,brand,price,year,mileage,district,condition,images,featured)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const toggleNotifyPriceDrop = async (savedListingId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("saved_listings")
      .update({ notify_price_drop: !currentValue })
      .eq("id", savedListingId);
    
    if (error) {
      toast.error("Failed to update notification preference");
    } else {
      toast.success(currentValue ? "Price drop alerts disabled" : "Price drop alerts enabled");
      queryClient.invalidateQueries({ queryKey: ["saved-full-data", user?.id] });
    }
  };

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
        ) : savedLoading ? (
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
        ) : savedListings?.length ? (
          <div className="space-y-6">
            {savedListings.map((saved: any) => (
              <Card key={saved.id} className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/listings/$id" 
                    params={{ id: saved.listing_id }}
                    className="w-full sm:w-48 aspect-[4/3] rounded-lg overflow-hidden bg-muted flex-shrink-0"
                  >
                    {saved.listings?.images?.[0] ? (
                      <img src={saved.listings.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No photo</div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link to="/listings/$id" params={{ id: saved.listing_id }} className="font-semibold text-lg hover:text-primary transition-colors">
                      {saved.listings?.title}
                    </Link>
                    <p className="text-primary font-bold text-xl mt-1">NPR {saved.listings?.price?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {saved.listings?.year} · {saved.listings?.mileage?.toLocaleString()} km · {saved.listings?.district}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <Switch 
                        checked={saved.notify_price_drop ?? true}
                        onCheckedChange={() => toggleNotifyPriceDrop(saved.id, saved.notify_price_drop ?? true)}
                      />
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Notify me if price drops</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggle(saved.listing_id, saved.listings?.price)}
                    className="self-start"
                  >
                    <Heart className="w-4 h-4 fill-primary text-primary" />
                  </Button>
                </div>
              </Card>
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
