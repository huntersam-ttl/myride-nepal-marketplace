import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS } from "@/lib/nepal";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { useSavedIds, useToggleSave } from "@/hooks/use-saved";
import { calculateListingScore } from "@/utils/listingScore";
import { getRecentlyViewed } from "@/utils/recentlyViewed";
import { Card } from "@/components/ui/card";

interface SearchParams {
  brand?: string; district?: string; type?: string; condition?: string;
  minPrice?: number; maxPrice?: number; sort?: string;
}

const PUBLIC_BROWSE_LISTING_COLUMNS = [
  "id",
  "title",
  "brand",
  "price",
  "year",
  "mileage",
  "district",
  "condition",
  "images",
  "featured",
  "accident_history",
  "num_owners",
  "user_id",
  "has_bluebook",
  "has_insurance",
  "has_tax_clearance",
  "has_registration",
  "bluebook_name_match",
  "service_history",
  "last_service_date",
  "registration_expiry",
  "created_at",
  "views",
  "shares",
].join(",");

const RELATED_LISTING_COLUMNS = [
  "id",
  "title",
  "brand",
  "price",
  "year",
  "mileage",
  "district",
  "condition",
  "images",
  "featured",
  "user_id",
  "created_at",
].join(",");

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    brand: typeof s.brand === "string" ? s.brand : undefined,
    district: typeof s.district === "string" ? s.district : undefined,
    type: typeof s.type === "string" ? s.type : undefined,
    condition: typeof s.condition === "string" ? s.condition : undefined,
    minPrice: s.minPrice ? Number(s.minPrice) : undefined,
    maxPrice: s.maxPrice ? Number(s.maxPrice) : undefined,
    sort: typeof s.sort === "string" ? s.sort : "newest",
  }),
  component: BrowsePage,
  head: () => ({
    meta: [
      { title: "Browse Bikes & Scooters for Sale in Nepal — MyRideNepal" },
      { name: "description", content: "Find bikes and scooters for sale across all 77 districts of Nepal. Free listings, verified sellers, direct contact. No commission." },
    ],
  }),
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: savedIds } = useSavedIds();
  const toggleSave = useToggleSave();
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed().slice(0, 3));
  const [dismissedRecent, setDismissedRecent] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("dismissed_recent_browse") === "true";
    }
    return false;
  });

  const dismissRecentlyViewed = () => {
    setDismissedRecent(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismissed_recent_browse", "true");
    }
  };

  const update = (patch: Partial<SearchParams>) => {
    navigate({ to: "/browse", search: { ...search, ...patch } as any });
  };

  const clearAll = () => navigate({ to: "/browse", search: {} as any });

  // Distinct brands actually present in active listings — used to enrich the brand filter.
  // Merged with POPULAR_BRANDS so the dropdown always has the popular set even if
  // no listings exist yet, plus any extra brand someone actually listed.
  const { data: dbBrands } = useQuery({
    queryKey: ["browse-distinct-brands"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("brand")
        .eq("status", "active")
        .is("deleted_at", null);
      if (error) throw error;
      return (data ?? []).map((r) => r.brand).filter((b): b is string => !!b);
    },
  });

  const brandOptions = useMemo(() => {
    const merged = new Set<string>();
    for (const b of POPULAR_BRANDS) merged.add(b);
    for (const b of (dbBrands ?? [])) {
      const trimmed = b.trim();
      if (trimmed) merged.add(trimmed);
    }
    return Array.from(merged).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [dbBrands]);

  const { data, isLoading } = useQuery({
    queryKey: ["listings", search],
    queryFn: async () => {
      let q = supabase
        .from("listings")
        .select(PUBLIC_BROWSE_LISTING_COLUMNS)
        .eq("status", "active")
        .is("deleted_at", null); // Exclude soft-deleted listings
      if (search.brand) q = q.eq("brand", search.brand);
      if (search.district) q = q.eq("district", search.district);
      if (search.type) q = q.eq("bike_type", search.type as any);
      if (search.condition) q = q.eq("condition", search.condition as any);
      if (search.minPrice) q = q.gte("price", search.minPrice);
      if (search.maxPrice) q = q.lte("price", search.maxPrice);
      switch (search.sort) {
        case "price_asc": q = q.order("price", { ascending: true }); break;
        case "price_desc": q = q.order("price", { ascending: false }); break;
        case "views": q = q.order("views", { ascending: false }); break;
        case "most_shared": q = q.order("shares", { ascending: false }); break;
        default: q = q.order("created_at", { ascending: false });
      }
      const { data: listings, error } = await q.limit(48);
      if (error) throw error;

      // Fetch verification levels for all unique user_ids
      if (listings && listings.length > 0) {
        const userIds = [...new Set(listings.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("public_profile_badges")
          .select("id, verification_level")
          .in("id", userIds);

        const verificationMap = new Map(profiles?.map(p => [p.id, p.verification_level]) || []);
        
        const listingsWithVerification = listings.map(listing => ({
          ...listing,
          verification_level: verificationMap.get(listing.user_id) || null,
        }));

        // Calculate quality scores for secondary sorting
        const listingsWithScores = listingsWithVerification.map(listing => ({
          ...listing,
          qualityScore: calculateListingScore(listing).score,
        }));

        // Apply secondary sorting by quality score for newest and relevance sorts
        if (!search.sort || search.sort === "newest") {
          // Group by date, sort by score within same date
          listingsWithScores.sort((a, b) => {
            const dateA = new Date(a.created_at).toDateString();
            const dateB = new Date(b.created_at).toDateString();
            if (dateA === dateB) {
              return b.qualityScore - a.qualityScore; // Higher score first
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        } else if (search.sort === "views") {
          // Group by view count, sort by score within same views
          listingsWithScores.sort((a, b) => {
            const viewsA = a.views || 0;
            const viewsB = b.views || 0;
            if (viewsA === viewsB) {
              return b.qualityScore - a.qualityScore;
            }
            return viewsB - viewsA;
          });
        } else if (search.sort === "most_shared") {
          // Group by share count, sort by score within same shares
          listingsWithScores.sort((a, b) => {
            const sharesA = (a as any).shares || 0;
            const sharesB = (b as any).shares || 0;
            if (sharesA === sharesB) {
              return b.qualityScore - a.qualityScore;
            }
            return sharesB - sharesA;
          });
        }

        return listingsWithScores;
      }

      return listings || [];
    },
  });

  // Fetch related listings when main results are fewer than 4
  const showRelated = data && data.length > 0 && data.length < 4;
  const { data: relatedListings, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-listings", search],
    enabled: showRelated,
    queryFn: async () => {
      if (!showRelated) return [];

      const excludeIds = data?.map(l => l.id) || [];
      
      // Build a more relaxed query based on current search criteria
      let q = supabase
        .from("listings")
        .select(RELATED_LISTING_COLUMNS)
        .eq("status", "active")
        .not("id", "in", `(${excludeIds.join(",")})`);

      // Relax filters progressively
      if (search.brand) {
        // Try similar price range if brand search is active
        if (data && data.length > 0) {
          const avgPrice = data.reduce((sum, l) => sum + l.price, 0) / data.length;
          const minPrice = Math.floor(avgPrice * 0.6);
          const maxPrice = Math.ceil(avgPrice * 1.4);
          q = q.gte("price", minPrice).lte("price", maxPrice);
        }
      } else if (search.type) {
        // If filtering by type, show other types in similar price range
        if (data && data.length > 0) {
          const avgPrice = data.reduce((sum, l) => sum + l.price, 0) / data.length;
          const minPrice = Math.floor(avgPrice * 0.7);
          const maxPrice = Math.ceil(avgPrice * 1.3);
          q = q.gte("price", minPrice).lte("price", maxPrice);
        }
      }

      if (search.district) q = q.eq("district", search.district);

      const { data: listings } = await q
        .order("created_at", { ascending: false })
        .limit(6);

      if (listings && listings.length > 0) {
        const userIds = [...new Set(listings.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("public_profile_badges")
          .select("id, verification_level")
          .in("id", userIds);

        const verificationMap = new Map(profiles?.map(p => [p.id, p.verification_level]) || []);
        
        return listings.map(listing => ({
          ...listing,
          verification_level: verificationMap.get(listing.user_id) || null,
        }));
      }

      return listings || [];
    },
  });

  // Build active filter chips
  const activeFilters = useMemo(() => {
    const chips: Array<{ key: keyof SearchParams; label: string }> = [];
    if (search.brand) chips.push({ key: "brand", label: search.brand });
    if (search.district) chips.push({ key: "district", label: search.district });
    if (search.type) chips.push({ key: "type", label: `Type: ${search.type}` });
    if (search.condition) chips.push({ key: "condition", label: `Condition: ${search.condition}` });
    if (search.minPrice) chips.push({ key: "minPrice", label: `Min: NPR ${search.minPrice.toLocaleString()}` });
    if (search.maxPrice) chips.push({ key: "maxPrice", label: `Max: NPR ${search.maxPrice.toLocaleString()}` });
    return chips;
  }, [search]);

  const filters = (
    <div className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 block">Brand</Label>
        <Select value={search.brand ?? "_all"} onValueChange={(v) => update({ brand: v === "_all" ? undefined : v })}>
          <SelectTrigger className="h-11 border-border/60"><SelectValue placeholder="All brands" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="_all">All brands</SelectItem>
            {brandOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 block">District</Label>
        <Select value={search.district ?? "_all"} onValueChange={(v) => update({ district: v === "_all" ? undefined : v })}>
          <SelectTrigger className="h-11 border-border/60"><SelectValue placeholder="All districts" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="_all">All districts</SelectItem>
            {NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 block">Bike type</Label>
        <Select value={search.type ?? "_all"} onValueChange={(v) => update({ type: v === "_all" ? undefined : v })}>
          <SelectTrigger className="h-11 border-border/60"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All types</SelectItem>
            {BIKE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 block">Condition</Label>
        <Select value={search.condition ?? "_all"} onValueChange={(v) => update({ condition: v === "_all" ? undefined : v })}>
          <SelectTrigger className="h-11 border-border/60"><SelectValue placeholder="Any condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Any condition</SelectItem>
            {CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 block">Price range (NPR)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={search.minPrice ?? ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Min"
            className="h-11 border-border/60"
          />
          <Input
            type="number"
            value={search.maxPrice ?? ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Max"
            className="h-11 border-border/60"
          />
        </div>
      </div>
      {activeFilters.length > 0 && (
        <Button variant="outline" onClick={clearAll} className="w-full gap-2 text-muted-foreground h-11 mt-2">
          <X className="w-4 h-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile search header - sticky */}
      <div className="sticky top-14 z-30 bg-background/98 backdrop-blur-lg border-b shadow-sm lg:static lg:bg-transparent lg:border-0 lg:shadow-none">
        <div className="container mx-auto px-4 py-4 lg:py-8">
          {/* Title and count */}
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0B1D3A]">Browse Bikes</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {isLoading ? "Loading..." : `${data?.length ?? 0} listing${data?.length !== 1 ? "s" : ""} found`}
              </p>
            </div>
            {/* Sort - always visible */}
            <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v })}>
              <SelectTrigger className="w-[140px] md:w-[170px] h-10 text-sm">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="most_shared">Most shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full lg:hidden h-11 gap-2 border-border/60">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {activeFilters.length > 0 && (
                  <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs rounded-full bg-[#FF6A00] text-white">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] overflow-y-auto">
              <SheetTitle className="sr-only">Browse filters</SheetTitle>
              <SheetDescription className="sr-only">Filter marketplace listings by brand, district, type, condition, and price.</SheetDescription>
              <div className="mt-6 px-1">{filters}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Continue where you left off */}
        {!dismissedRecent && recentlyViewed.length > 0 && (
          <Card className="p-4 mb-5 bg-[#FF6A00]/5 border-[#FF6A00]/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#0B1D3A]">Continue where you left off</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={dismissRecentlyViewed}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex gap-4 pb-2" style={{ minWidth: 'min-content' }}>
                {recentlyViewed.map((listing) => (
                  <div key={listing.id} className="flex-shrink-0 w-64">
                    <ListingCard listing={listing as any} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map(({ key, label }) => (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1.5 pr-1.5 py-1.5 text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors capitalize"
                onClick={() => update({ [key]: undefined })}
              >
                {label}
                <X className="w-3.5 h-3.5" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs text-muted-foreground hover:text-foreground">
              Clear all
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 bg-card border rounded-xl p-5 shadow-sm border-border/60">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-[#0B1D3A]">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </h2>
              {filters}
            </div>
          </aside>

          {/* Results */}
          <section>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-card border overflow-hidden shadow-sm">
                    <div className="aspect-[16/10] bg-muted animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {data.map(l => (
                    <ListingCard
                      key={l.id}
                      listing={l as any}
                      onSave={(id: string) => toggleSave(id, l.price)}
                      isSaved={savedIds?.has(l.id)}
                    />
                  ))}
                </div>

                {/* Related Listings - shown when fewer than 4 results */}
                {showRelated && (
                  <div className="mt-12">
                    <h3 className="text-lg font-semibold mb-4 text-[#0B1D3A]">You might also like these similar bikes</h3>
                    {relatedLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="rounded-xl bg-card border overflow-hidden shadow-sm">
                            <div className="aspect-[16/10] bg-muted animate-pulse" />
                            <div className="p-4 space-y-3">
                              <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                              <div className="h-3 bg-muted animate-pulse rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : relatedListings && relatedListings.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                        {relatedListings.map(l => (
                          <ListingCard
                            key={l.id}
                            listing={l as any}
                            onSave={(id: string) => toggleSave(id, l.price)}
                            isSaved={savedIds?.has(l.id)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 lg:py-20 border rounded-2xl bg-card text-center px-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg lg:text-xl mb-2 text-[#0B1D3A]">No bikes found</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Try changing your filters or browse all listings to see available bikes.
                </p>
                <Button onClick={clearAll} className="gap-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white">
                  <X className="w-4 h-4" />
                  Clear all filters
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
