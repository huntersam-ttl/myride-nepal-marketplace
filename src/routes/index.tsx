import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, Users, Zap, ArrowRight, TrendingUp, BadgeCheck, Wallet, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POPULAR_BRANDS } from "@/lib/nepal";
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
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const q = searchQuery.trim();
    const params: Record<string, string> = {};
    if (q) params.q = q;
    navigate({ to: "/browse", search: params as any });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  // Trust chips shown under the hero CTAs (replaces the old stats row)
  const trustChips = [
    { icon: BadgeCheck, label: "Admin-reviewed" },
    { icon: Wallet, label: "No commission" },
    { icon: MessageCircle, label: "Direct WhatsApp contact" },
  ];

  // Listing count is still used elsewhere; keep the variable referenced so the query stays alive
  void listingCount;

  return (
    <div>
      {/* Hero — dark navy, left-aligned on mobile, centered from sm+ */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Soft radial glow — pure CSS, no images */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.25), transparent 50%)",
          }}
        />
        {/* Subtle decorative route path at bottom — much softer than mountain shape */}
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-20 opacity-[0.03] pointer-events-none"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,40 Q200,20 400,35 T800,40 Q1000,45 1200,35 L1200,80 L0,80 Z" 
            fill="#FFFFFF" 
          />
        </svg>
        {/* Pulled the hero up under the dark mobile navbar; the navbar background matches so it reads as one surface */}
        <div className="container mx-auto px-4 pt-10 pb-24 md:pt-20 md:pb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-left sm:text-center sm:mx-auto"
          >
            <span className="inline-block px-3 py-1.5 rounded-full bg-primary/15 text-primary text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-6">
              🇳🇵 Made for Nepal
            </span>
            <h1 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              Nepal's Trusted Bike &<br className="hidden sm:block" /> Scooter Marketplace
            </h1>
            <p className="mt-5 text-base sm:text-lg md:text-xl text-white/75 max-w-xl sm:mx-auto leading-relaxed">
              Buy and sell bikes across Nepal. List your ride for free, connect directly with verified sellers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
              {/* Primary CTA — orange, dominant */}
              <Button
                size="lg"
                onClick={() => navigate({ to: "/sell" })}
                className="text-base h-12 font-semibold shadow-lg w-full sm:w-auto"
              >
                Sell Your Bike — Free
              </Button>
              {/* Secondary CTA — outlined on the dark hero */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: "/browse" })}
                className="text-base h-12 gap-2 bg-white/5 border-white/25 text-white hover:bg-white/10 hover:text-white hover:border-white/40 w-full sm:w-auto"
              >
                Browse Bikes <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Trust chips — quieter, more premium look with softer backgrounds */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 grid grid-cols-3 gap-2 sm:flex sm:justify-center sm:gap-3 max-w-3xl mx-auto"
          >
            {trustChips.map((c) => (
              <div
                key={c.label}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-2.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm text-white/70 text-center backdrop-blur-sm"
              >
                <c.icon className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                <span className="leading-tight font-medium">{c.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* White search card — overlaps the hero bottom, sits as a clear product surface */}
      <section className="container mx-auto px-4 relative z-10 -mt-12 md:-mt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-card border rounded-2xl shadow-lg p-6 sm:p-7"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-5">Find Your Next Ride</h2>

          {/* Main search input + go button */}
          <form
            onSubmit={(e) => { e.preventDefault(); doSearch(); }}
            className="flex gap-2.5 mb-5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search brand, model, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-5" aria-label="Search">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick chip filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Link
              to="/browse"
              className="px-3.5 py-2 rounded-full border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all"
            >
              All Brands
            </Link>
            <Link
              to="/browse"
              className="px-3.5 py-2 rounded-full border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all"
            >
              All Districts
            </Link>
            <Link
              to="/browse"
              className="px-3.5 py-2 rounded-full border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all"
            >
              Scooters
            </Link>
            <Link
              to="/browse"
              className="px-3.5 py-2 rounded-full border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95 transition-all"
            >
              Motorbikes
            </Link>
          </div>

          {/* More Filters CTA — opens the full browse experience */}
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/browse" })}
            className="w-full h-12 gap-2 justify-center text-base"
          >
            More Filters <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
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
