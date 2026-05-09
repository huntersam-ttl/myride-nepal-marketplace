import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS } from "@/lib/nepal";
import { Filter, X } from "lucide-react";
import { useSavedIds, useToggleSave } from "@/hooks/use-saved";

interface SearchParams {
  brand?: string; district?: string; type?: string; condition?: string;
  minPrice?: number; maxPrice?: number; sort?: string;
}

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
  head: () => ({ meta: [{ title: "Browse Bikes & Scooters — MyRideNepal" }] }),
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: savedIds } = useSavedIds();
  const toggleSave = useToggleSave();

  const update = (patch: Partial<SearchParams>) => {
    navigate({ to: "/browse", search: { ...search, ...patch } as any });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["listings", search],
    queryFn: async () => {
      let q = supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured")
        .eq("status", "active");
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
        default: q = q.order("created_at", { ascending: false });
      }
      const { data, error } = await q.limit(48);
      if (error) throw error;
      return data;
    },
  });

  const filters = (
    <div className="space-y-5">
      <div>
        <Label className="text-xs uppercase text-muted-foreground">Brand</Label>
        <Select value={search.brand ?? "_all"} onValueChange={(v) => update({ brand: v === "_all" ? undefined : v })}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="All brands" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All brands</SelectItem>
            {POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase text-muted-foreground">District</Label>
        <Select value={search.district ?? "_all"} onValueChange={(v) => update({ district: v === "_all" ? undefined : v })}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="All districts" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="_all">All districts</SelectItem>
            {NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase text-muted-foreground">Bike type</Label>
        <Select value={search.type ?? "_all"} onValueChange={(v) => update({ type: v === "_all" ? undefined : v })}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All types</SelectItem>
            {BIKE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs uppercase text-muted-foreground">Condition</Label>
        <Select value={search.condition ?? "_all"} onValueChange={(v) => update({ condition: v === "_all" ? undefined : v })}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Any</SelectItem>
            {CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs uppercase text-muted-foreground">Min NPR</Label>
          <Input
            type="number"
            value={search.minPrice ?? ""}
            onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs uppercase text-muted-foreground">Max NPR</Label>
          <Input
            type="number"
            value={search.maxPrice ?? ""}
            onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="∞"
            className="mt-1.5"
          />
        </div>
      </div>
      <Button variant="outline" onClick={() => navigate({ to: "/browse", search: {} as any })} className="w-full gap-2">
        <X className="w-4 h-4" /> Clear filters
      </Button>
    </div>
  );

  const activeCount = useMemo(() => Object.values(search).filter(v => v && v !== "newest").length, [search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Browse bikes & scooters</h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.length ?? 0} listings</p>
        </div>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden gap-2">
                <Filter className="w-4 h-4" /> Filters{activeCount > 0 && ` (${activeCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto"><div className="mt-8">{filters}</div></SheetContent>
          </Sheet>
          <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="views">Most viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block sticky top-20 self-start">{filters}</aside>
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : data?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.map(l => <ListingCard key={l.id} listing={l as any} onSave={toggleSave} isSaved={savedIds?.has(l.id)} />)}
            </div>
          ) : (
            <div className="text-center py-20 border rounded-xl">
              <p className="text-muted-foreground">No listings match your filters.</p>
              <Button variant="link" onClick={() => navigate({ to: "/browse", search: {} as any })}>
                Clear filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
