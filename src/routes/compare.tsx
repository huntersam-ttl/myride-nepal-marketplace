import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/nepal";
import { X, Plus, GitCompare, Search } from "lucide-react";

interface Search { ids?: string }
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ids: typeof s.ids === "string" ? s.ids : undefined }),
  component: ComparePage,
  head: () => ({ meta: [{ title: "Compare Bikes — MyRideNepal" }] }),
});

const COMPARE_ROWS: { label: string; key: string; format?: (v: any) => string }[] = [
  { label: "Price", key: "price", format: (v) => formatNPR(v) },
  { label: "Year", key: "year" },
  { label: "Mileage", key: "mileage", format: (v) => `${Number(v).toLocaleString()} km` },
  { label: "Brand", key: "brand" },
  { label: "Model", key: "model" },
  { label: "Condition", key: "condition" },
  { label: "Fuel type", key: "fuel_type" },
  { label: "Bike type", key: "bike_type" },
  { label: "Colour", key: "colour" },
  { label: "District", key: "district" },
];

function ComparePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const initial = (search.ids ?? "").split(",").filter(Boolean);
  const [ids, setIds] = useState<string[]>(initial);

  useEffect(() => {
    navigate({ to: "/compare", search: { ids: ids.join(",") || undefined } as any, replace: true });
  }, [ids]);

  const { data: listings } = useQuery({
    queryKey: ["compare", ids],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("listings").select("*").in("id", ids)).data ?? [],
  });

  const remove = (id: string) => setIds(p => p.filter(x => x !== id));

  // Detect best value for numeric fields (price = lowest, mileage = lowest, year = highest)
  const getBestClass = (key: string, val: any, allVals: any[]) => {
    if (!listings || listings.length < 2) return "";
    const nums = allVals.map(Number).filter(n => !isNaN(n));
    if (nums.length < 2) return "";
    const num = Number(val);
    if (isNaN(num)) return "";
    if (key === "year") return num === Math.max(...nums) ? "text-green-600 font-semibold" : "";
    if (key === "price" || key === "mileage") return num === Math.min(...nums) ? "text-green-600 font-semibold" : "";
    return "";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-10 max-w-5xl text-center mrn-fade-in-up">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
            <GitCompare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Compare bikes</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Add up to 3 listings to compare price, specs, and condition side by side.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search to add */}
        {ids.length < 3 && (
          <div className="mb-6">
            <AddListingSearch onAdd={(id) => !ids.includes(id) && setIds(p => [...p, id])} />
          </div>
        )}

        {ids.length === 0 ? (
          <Card className="p-12 sm:p-16 text-center shadow-[var(--shadow-card)] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <GitCompare className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="font-semibold text-lg mb-1.5">No bikes selected</p>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Search for listings above or browse the marketplace to pick bikes you'd like to compare side by side.
            </p>
            <Button asChild className="transition-all duration-200 active:scale-[0.98]">
              <Link to="/browse">Browse listings</Link>
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[540px]">
              {/* Bike header cards */}
              <div className="grid gap-4 mb-2" style={{ gridTemplateColumns: `160px repeat(${ids.length}, 1fr)` }}>
                <div /> {/* label column spacer */}
                {listings?.map(l => (
                  <Card
                    key={l.id}
                    className="overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="relative">
                      <img
                        src={l.images?.[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400"}
                        alt={l.title}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <button
                        onClick={() => remove(l.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        aria-label="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <Link to="/listings/$id" params={{ id: l.id }} className="focus-visible:outline-none focus-visible:underline">
                        <p className="font-semibold text-sm line-clamp-2 hover:text-primary leading-snug transition-colors">{l.title}</p>
                      </Link>
                      <p className="text-primary font-bold mt-1">{formatNPR(l.price)}</p>
                    </div>
                  </Card>
                ))}
                {/* Empty slot(s) */}
                {Array.from({ length: 3 - (listings?.length ?? 0) }).map((_, i) => (
                  <div
                    key={i}
                    className="border-2 border-dashed rounded-xl aspect-[4/3] flex items-center justify-center text-muted-foreground text-sm flex-col gap-2 bg-card"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add bike</span>
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              <Card className="overflow-hidden shadow-[var(--shadow-card)]">
                {COMPARE_ROWS.map((row, ri) => {
                  const allVals = (listings ?? []).map(l => (l as any)[row.key]);
                  return (
                    <div
                      key={row.key}
                      className={`grid items-center ${ri !== 0 ? "border-t" : ""}`}
                      style={{ gridTemplateColumns: `160px repeat(${Math.max(ids.length, 1)}, 1fr)` }}
                    >
                      <div className={`px-4 py-3 text-sm font-medium text-muted-foreground ${ri % 2 === 0 ? "bg-muted/40" : ""}`}>
                        {row.label}
                      </div>
                      {(listings ?? []).map(l => {
                        const val = (l as any)[row.key];
                        const displayVal = val != null ? (row.format ? row.format(val) : String(val)) : "—";
                        const highlightClass = getBestClass(row.key, val, allVals);
                        return (
                          <div
                            key={l.id}
                            className={`px-4 py-3 text-sm capitalize border-l ${ri % 2 === 0 ? "bg-muted/40" : ""} ${highlightClass}`}
                          >
                            {displayVal}
                            {highlightClass && <span className="ml-1.5 text-xs">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </Card>

              {listings && listings.length > 1 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  <span className="text-green-600 font-medium">✓</span> highlights the best value for each spec
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddListingSearch({ onAdd }: { onAdd: (id: string) => void }) {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["compare-search", q],
    enabled: q.length > 1,
    queryFn: async () => (await supabase.from("listings").select("id,title,price,images,brand,district").eq("status", "active").ilike("title", `%${q}%`).limit(6)).data ?? [],
  });

  return (
    <Card className="p-4 max-w-xl mx-auto shadow-[var(--shadow-card)]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search listings to compare (e.g. Pulsar, Activa)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="pl-9 h-11"
        />
      </div>
      {data && data.length > 0 && (
        <div className="mt-2 space-y-1 border rounded-lg overflow-hidden">
          {data.map(l => (
            <button
              key={l.id}
              onClick={() => { onAdd(l.id); setQ(""); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
            >
              <img
                src={l.images?.[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=80"}
                alt=""
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{l.title}</span>
                <span className="text-xs text-muted-foreground">{l.district} · {formatNPR(l.price)}</span>
              </div>
              <Plus className="w-4 h-4 text-primary flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
