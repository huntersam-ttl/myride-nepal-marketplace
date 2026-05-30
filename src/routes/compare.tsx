import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNPR } from "@/lib/nepal";
import {
  X,
  Plus,
  GitCompare,
  Search,
  Tag,
  Calendar,
  Gauge,
  Bike,
  Fuel,
  Palette,
  MapPin,
  Layers,
  Sparkles,
  Eye,
  Info,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";

interface Search { ids?: string }
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ids: typeof s.ids === "string" ? s.ids : undefined }),
  component: ComparePage,
  head: () => ({ meta: [{ title: "Compare Bikes — MyRideNepal" }] }),
});

const PUBLIC_COMPARE_LISTING_COLUMNS =
  "id,title,images,price,year,mileage,brand,model,condition,fuel_type,bike_type,colour,district";

type CompareRow = {
  label: string;
  key: string;
  icon: typeof Tag;
  format?: (v: any) => string;
};

// Primary specs — the buyer's first signal: price / year / mileage
const PRIMARY_ROWS: CompareRow[] = [
  { label: "Price", key: "price", icon: Tag, format: (v) => formatNPR(v) },
  { label: "Year", key: "year", icon: Calendar },
  { label: "Mileage", key: "mileage", icon: Gauge, format: (v) => `${Number(v).toLocaleString()} km` },
];

// Secondary details — supporting info
const DETAIL_ROWS: CompareRow[] = [
  { label: "Brand", key: "brand", icon: Sparkles },
  { label: "Model", key: "model", icon: Layers },
  { label: "Condition", key: "condition", icon: Bike },
  { label: "Fuel type", key: "fuel_type", icon: Fuel },
  { label: "Bike type", key: "bike_type", icon: Bike },
  { label: "Colour", key: "colour", icon: Palette },
  { label: "District", key: "district", icon: MapPin },
];

const CONDITION_DOT: Record<string, string> = {
  new: "bg-green-500",
  excellent: "bg-emerald-500",
  good: "bg-blue-500",
  fair: "bg-yellow-500",
  poor: "bg-red-500",
};

function ComparePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const initial = (search.ids ?? "").split(",").filter(Boolean);
  const [ids, setIds] = useState<string[]>(initial);

  // Ref into the AddListingSearch input — empty slots scroll/focus it on click
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigate({ to: "/compare", search: { ids: ids.join(",") || undefined } as any, replace: true });
  }, [ids]);

  const { data: listings } = useQuery({
    queryKey: ["compare", ids],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("public_listings").select(PUBLIC_COMPARE_LISTING_COLUMNS).in("id", ids)).data ?? [],
  });

  const remove = (id: string) => setIds(p => p.filter(x => x !== id));
  const clearAll = () => setIds([]);

  const focusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Best value: price/mileage = lowest wins; year = highest wins. Untouched business rule.
  const getBestClass = (key: string, val: any, allVals: any[]) => {
    if (!listings || listings.length < 2) return "";
    const nums = allVals.map(Number).filter(n => !isNaN(n));
    if (nums.length < 2) return "";
    const num = Number(val);
    if (isNaN(num)) return "";
    if (key === "year") return num === Math.max(...nums) ? "text-green-700 font-semibold" : "";
    if (key === "price" || key === "mileage") return num === Math.min(...nums) ? "text-green-700 font-semibold" : "";
    return "";
  };

  const slotCount = Math.max(ids.length, 1);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* A. Navy gradient hero band with trust chips */}
      <div className="relative overflow-hidden text-white" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.18), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-14 max-w-5xl text-center relative mrn-fade-in-up">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <GitCompare className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Compare bikes</h1>
          <p className="text-white/70 mt-2.5 max-w-xl mx-auto leading-relaxed">
            Add up to 3 listings to compare price, specs, and condition side by side.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { icon: ArrowLeftRight, label: "Up to 3 bikes" },
              { icon: Layers, label: "Spec by spec" },
              { icon: Sparkles, label: "Best value highlighted" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-3 py-1.5 text-xs text-white/80"
              >
                <chip.icon className="w-3.5 h-3.5 text-white/60" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* B. Selection meta — counter (always shown) + Clear all (only when selected > 0) */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-muted-foreground tabular-nums">
            <span className="font-semibold text-foreground">{ids.length}/3</span> selected
          </p>
          {ids.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive gap-1.5 h-8 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </Button>
          )}
        </div>

        {/* Add-listing search (always rendered when below cap) */}
        {ids.length < 3 && (
          <div className="mb-6">
            <AddListingSearch
              inputRef={searchInputRef}
              onAdd={(id) => !ids.includes(id) && setIds(p => [...p, id])}
            />
          </div>
        )}

        {ids.length === 0 ? (
          <Card className="p-12 sm:p-16 text-center shadow-[var(--shadow-card)] max-w-xl mx-auto rounded-2xl border-border/60">
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
          // I. Mobile scroll-hint wrapper — right-edge fade signals more content
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="min-w-[540px]">
                {/* Bike header cards */}
                <div className="grid gap-4 mb-3" style={{ gridTemplateColumns: `160px repeat(${slotCount}, 1fr)` }}>
                  <div /> {/* label column spacer */}
                  {listings?.map(l => {
                    const cond = (l as any).condition as string | undefined;
                    const condDot = cond ? CONDITION_DOT[cond.toLowerCase()] ?? "bg-muted-foreground" : null;
                    return (
                      <Card
                        key={l.id}
                        className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-200 border-border/60"
                      >
                        <div className="relative">
                          <img
                            src={l.images?.[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400"}
                            alt={l.title}
                            className="w-full aspect-[4/3] object-cover"
                          />
                          <button
                            onClick={() => remove(l.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            aria-label="Remove from comparison"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-3 space-y-2">
                          <Link
                            to="/listings/$id"
                            params={{ id: l.id }}
                            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
                          >
                            <p className="font-semibold text-sm line-clamp-2 hover:text-primary leading-snug transition-colors">{l.title}</p>
                          </Link>
                          <p className="text-primary font-bold tabular-nums">{formatNPR(l.price)}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {cond && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-border/70 bg-card text-muted-foreground capitalize">
                                {condDot && <span className={`w-1.5 h-1.5 rounded-full ${condDot}`} />}
                                {cond}
                              </span>
                            )}
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs gap-1 ml-auto transition-all duration-200 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary/30"
                            >
                              <Link to="/listings/$id" params={{ id: l.id }}>
                                <Eye className="w-3 h-3" /> View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  {/* C. Interactive empty slots — focus the search input on click */}
                  {Array.from({ length: 3 - (listings?.length ?? 0) }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={focusSearch}
                      className="border-2 border-dashed border-border rounded-2xl aspect-[4/3] flex items-center justify-center text-muted-foreground text-sm flex-col gap-2 bg-card hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label="Add another bike to compare"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-medium">Add bike</span>
                    </button>
                  ))}
                </div>

                {/* Comparison rows — grouped into Key specs / Details */}
                <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] border-border/60">
                  <SectionHeading label="Key specs" />
                  {PRIMARY_ROWS.map((row, idx) => (
                    <CompareRowDisplay
                      key={row.key}
                      row={row}
                      listings={listings ?? []}
                      slotCount={slotCount}
                      striped={idx % 2 === 1}
                      isPrimary
                      getBestClass={getBestClass}
                    />
                  ))}
                  <SectionHeading label="Details" />
                  {DETAIL_ROWS.map((row, idx) => (
                    <CompareRowDisplay
                      key={row.key}
                      row={row}
                      listings={listings ?? []}
                      slotCount={slotCount}
                      striped={idx % 2 === 1}
                      getBestClass={getBestClass}
                    />
                  ))}
                </Card>

                {/* Best-value caption */}
                {listings && listings.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-700 uppercase tracking-wide">Best</span>
                    pill marks the best value for each spec
                  </p>
                )}
              </div>
            </div>
            {/* Right-edge mobile scroll hint — sm:hidden so it never shows on desktop */}
            <div
              className="absolute top-0 right-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-muted/30 via-muted/10 to-transparent sm:hidden"
              aria-hidden="true"
            />
          </div>
        )}

        {/* J. Seller-entered specs disclaimer */}
        {ids.length > 0 && (
          <Card className="mt-6 p-4 rounded-2xl border-border/60 bg-muted/40 shadow-none max-w-3xl mx-auto">
            <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/70" />
              <span>
                Specs are shown as entered by the seller on each listing. Verify details, documents, and condition before any purchase.
              </span>
            </div>
          </Card>
        )}

        {/* Browse more bikes CTA (only when cap reached or comparing < 3) */}
        {ids.length > 0 && ids.length < 3 && (
          <div className="mt-6 text-center">
            <Button
              asChild
              variant="outline"
              className="gap-2 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Link to="/browse">Browse more bikes <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Subcomponents — all kept inside this file so we don't touch shared primitives
 * ──────────────────────────────────────────────────────────────────────────── */

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="px-4 py-2.5 bg-muted/50 border-b text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
  );
}

type CompareRowProps = {
  row: CompareRow;
  listings: any[];
  slotCount: number;
  striped?: boolean;
  isPrimary?: boolean;
  getBestClass: (key: string, val: any, allVals: any[]) => string;
};

function CompareRowDisplay({ row, listings, slotCount, striped, isPrimary, getBestClass }: CompareRowProps) {
  const Icon = row.icon;
  const allVals = listings.map(l => l[row.key]);
  return (
    <div
      className={`grid items-stretch border-t first:border-t-0 ${striped ? "bg-muted/30" : ""}`}
      style={{ gridTemplateColumns: `160px repeat(${slotCount}, 1fr)` }}
    >
      {/* Label cell */}
      <div className="px-4 py-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground/70" />
        <span className="truncate">{row.label}</span>
      </div>
      {/* Value cells */}
      {listings.map(l => {
        const val = l[row.key];
        const displayVal = val != null ? (row.format ? row.format(val) : String(val)) : "—";
        const highlight = getBestClass(row.key, val, allVals);
        const isWinner = !!highlight;
        return (
          <div
            key={l.id}
            className={`px-4 py-3 text-sm capitalize border-l flex items-center gap-2 ${
              isPrimary ? "tabular-nums" : ""
            } ${highlight}`}
          >
            <span className={`truncate ${isPrimary ? "text-base font-semibold" : ""}`}>{displayVal}</span>
            {isWinner && (
              <span className="inline-flex items-center flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-700 uppercase tracking-wide">
                Best
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddListingSearch({
  onAdd,
  inputRef,
}: {
  onAdd: (id: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["compare-search", q],
    enabled: q.length > 1,
    queryFn: async () => (await supabase.from("public_listings").select("id,title,price,images,brand,district").eq("status", "active").ilike("title", `%${q}%`).limit(6)).data ?? [],
  });

  return (
    <Card className="p-4 max-w-xl mx-auto shadow-[var(--shadow-card)] rounded-2xl border-border/60">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          placeholder="Search listings to compare (e.g. Pulsar, Activa)…"
          value={q}
          onChange={e => setQ(e.target.value)}
          className="pl-9 h-11 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>
      {data && data.length > 0 && (
        <div className="mt-2 space-y-1 border rounded-xl overflow-hidden">
          {data.map(l => (
            <button
              key={l.id}
              onClick={() => { onAdd(l.id); setQ(""); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left focus-visible:outline-none focus-visible:bg-accent active:scale-[0.99]"
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
