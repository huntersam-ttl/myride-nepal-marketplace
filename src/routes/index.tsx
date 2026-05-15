import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, Users, Zap, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POPULAR_BRANDS, NEPAL_DISTRICTS } from "@/lib/nepal";
import { motion } from "framer-motion";
import { getRecentlyViewed, clearRecentlyViewed } from "@/utils/recentlyViewed";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "MyRideNepal — Nepal's Trusted Bike & Scooter Marketplace" },
      { name: "description", content: "Find your next bike or scooter in Nepal. Browse thousands of listings, compare prices, and connect directly with verified sellers." },
    ],
  }),
});

function HomePage() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed());

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const { data: listings, error } = await supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured,accident_history,num_owners,user_id,has_bluebook,has_insurance,has_tax_clearance,has_registration")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;

      // Fetch verification levels
      if (listings && listings.length > 0) {
        const userIds = [...new Set(listings.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
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

  // Fetch "You Might Also Like" based on most recently viewed listing
  const lastViewed = recentlyViewed[0];
  const { data: mightLike, isLoading: mightLikeLoading } = useQuery({
    queryKey: ["might-like", lastViewed?.brand, lastViewed?.price],
    enabled: !!lastViewed,
    queryFn: async () => {
      if (!lastViewed) return [];

      const minPrice = Math.floor(lastViewed.price * 0.7);
      const maxPrice = Math.ceil(lastViewed.price * 1.3);

      const { data: listings } = await supabase
        .from("listings")
        .select("id,title,brand,model,bike_type,price,year,mileage,district,condition,images,featured,user_id,status,created_at")
        .eq("status", "active")
        .or(`brand.eq.${lastViewed.brand},and(price.gte.${minPrice},price.lte.${maxPrice})`)
        .neq("id", lastViewed.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (listings && listings.length > 0) {
        const userIds = [...new Set(listings.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
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

  // Real listing count for stats bar
  const { data: listingCount } = useQuery({
    queryKey: ["listing-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count ?? 0;
    },
  });

  const doSearch = () => {
    const params: Record<string, string | number> = {};
    if (brand && brand !== "all") params.brand = brand;
    if (district && district !== "all") params.district = district;
    if (maxPrice) params.maxPrice = Number(maxPrice);
    navigate({ to: "/browse", search: params as any });
  };

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setRecentlyViewed([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  const stats = [
    {
      value: listingCount != null ? (listingCount > 0 ? `${listingCount}+` : "Growing") : "—",
      label: "Active listings",
    },
    { value: "77", label: "Districts covered" },
    { value: "Free", label: "To list your bike" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.25), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-center mx-auto"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-5">
              🇳🇵 Made for Nepal
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Nepal's Trusted Bike &<br className="hidden sm:block" /> Scooter Marketplace
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/75 max-w-xl mx-auto">
              Browse verified bikes across all 77 districts. Buy and sell with confidence — no middlemen.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate({ to: "/browse" })} className="text-base gap-2">
                Browse Bikes <ArrowRight className="w-4 h-4" />
              </Button>
              {/* Solid white — passes WCAG AA contrast */}
              <Button
                size="lg"
                onClick={() => navigate({ to: "/sell" })}
                className="text-base bg-white text-secondary font-semibold hover:bg-white/90 border-0"
              >
                Sell Your Bike — Free
              </Button>
            </div>
          </motion.div>

          {/* Stats bar — real data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white/60 text-sm"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{s.value}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 max-w-4xl mx-auto p-4 rounded-2xl bg-card shadow-2xl"
          >
            {/* 2×2 on mobile, 4-col on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="All brands" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue placeholder="All districts" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All districts</SelectItem>
                  {NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Max price (NPR)"
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                min={0}
              />
              <Button onClick={doSearch} size="lg" className="gap-2 w-full">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Browse by brand — pill tag style */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Browse by brand</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_BRANDS.map(b => (
            <Link
              key={b}
              to="/browse"
              search={{ brand: b } as any}
              className="px-4 py-2.5 rounded-full border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all duration-150"
            >
              {b}
            </Link>
          ))}
          <Link
            to="/browse"
            className="px-4 py-2.5 rounded-full border bg-muted text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary active:scale-95 transition-all duration-150"
          >
            All bikes →
          </Link>
        </div>
      </section>

      {/* Latest listings */}
      <section className="container mx-auto px-4 py-12 pt-0">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Latest listings</h2>
            <p className="text-sm text-muted-foreground mt-1">Fresh bikes added daily across Nepal</p>
          </div>
          <Link to="/browse" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : featured?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(l => <ListingCard key={l.id} listing={l as any} />)}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-xl bg-card">
            <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No listings yet. Be the first to sell!</p>
            <Button onClick={() => navigate({ to: "/sell" })}>Post your bike for free</Button>
          </div>
        )}

        {/* You Might Also Like - based on recently viewed */}
        {lastViewed && !mightLikeLoading && mightLike && mightLike.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">You Might Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mightLike.map(l => <ListingCard key={l.id} listing={l as any} />)}
            </div>
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="container mx-auto px-4 py-12 pt-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-2xl md:text-3xl font-bold">Recently Viewed</h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear History
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="flex lg:grid lg:grid-cols-4 gap-5 pb-4 lg:pb-0" style={{ minWidth: 'min-content' }}>
              {recentlyViewed.slice(0, 4).map((listing) => (
                <div key={listing.id} className="flex-shrink-0 w-72 lg:w-auto relative">
                  <ListingCard listing={listing as any} />
                  {listing.status !== "active" && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <div className="bg-white px-4 py-2 rounded-lg font-semibold text-sm">
                        {listing.status === "sold" ? "Sold" : "Unavailable"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">How MyRideNepal works</h2>
            <p className="text-muted-foreground mt-2">Sell your bike in 3 easy steps — completely free</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "1. List your bike", desc: "Create a free listing in under 3 minutes with photos, specs, and your asking price.", color: "bg-orange-500/10 text-orange-500" },
              { icon: Users, title: "2. Get contacted", desc: "Buyers reach out directly via WhatsApp or phone. No middlemen, no commissions.", color: "bg-blue-500/10 text-blue-500" },
              { icon: ShieldCheck, title: "3. Sell safely", desc: "Meet in a safe public location. Verified dealer listings also available.", color: "bg-green-500/10 text-green-500" },
            ].map((step, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border shadow-[var(--shadow-card)]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate({ to: "/sell" })} className="gap-2">
              Post your bike for free <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
