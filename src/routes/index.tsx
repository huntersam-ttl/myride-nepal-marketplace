import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, Users, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POPULAR_BRANDS, NEPAL_DISTRICTS } from "@/lib/nepal";
import { motion } from "framer-motion";

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
  const [brand, setBrand] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured")
        .eq("status", "active")
        .is("deleted_at", null) // Exclude soft-deleted listings
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  // Real listing count for stats bar
  const { data: listingCount } = useQuery({
    queryKey: ["listing-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("deleted_at", null); // Exclude soft-deleted listings
      return count ?? 0;
    },
  });

  const doSearch = () => {
    const params: Record<string, string | number> = {};
    if (brand) params.brand = brand;
    if (district) params.district = district;
    if (maxPrice) params.maxPrice = Number(maxPrice);
    navigate({ to: "/browse", search: params as any });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  const stats = [
    {
      value: listingCount != null && listingCount > 0 ? `${listingCount}+` : "Growing",
      label: "Verified listings",
    },
    { value: "77", label: "Districts covered" },
    { value: "Free", label: "No commission" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
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
              Free listings for bikes and scooters. Admin-reviewed. Contact sellers directly by phone or WhatsApp.
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
              <Select value={brand || "all"} onValueChange={v => setBrand(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="All brands" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={district || "all"} onValueChange={v => setDistrict(v === "all" ? "" : v)}>
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
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">How MyRideNepal works</h2>
            <p className="text-muted-foreground mt-2">Built for Nepal's two-wheeler market</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "1. Sellers list bikes", desc: "Create a free listing with photos and specs. MyRideNepal reviews every listing for quality.", color: "bg-orange-500/10 text-orange-500" },
              { icon: ShieldCheck, title: "2. Admin review", desc: "Our team reviews listings to filter spam and ensure quality standards.", color: "bg-blue-500/10 text-blue-500" },
              { icon: Users, title: "3. Direct contact", desc: "Buyers contact sellers directly via WhatsApp or phone. No middleman, no commission.", color: "bg-green-500/10 text-green-500" },
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

      {/* Buyer Safety & Seller Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Buyer Safety */}
          <div className="bg-card p-6 md:p-8 rounded-xl border">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Buyer Safety Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Inspect bike thoroughly before payment</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Check bluebook and ownership documents</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Meet in safe public location or dealer showroom</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Never pay 100% advance to unknown sellers</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Complete ownership transfer before finalizing</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-4 w-full" onClick={() => navigate({ to: "/safety-tips" })}>
              Read full safety guide
            </Button>
          </div>

          {/* Seller Benefits */}
          <div className="bg-card p-6 md:p-8 rounded-xl border">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Seller Benefits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>List your bike or scooter for free</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>No commission on sales — keep 100% profit</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Buyers contact you directly via phone/WhatsApp</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Reach thousands of buyers across Nepal</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Dealers get free beta access with analytics</span>
              </li>
            </ul>
            <Button className="mt-4 w-full" onClick={() => navigate({ to: "/sell" })}>
              Start selling now — Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
