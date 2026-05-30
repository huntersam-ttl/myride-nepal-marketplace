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
        .from("public_listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured")
        .eq("status", "active")
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
        .from("public_listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
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
      {/* Hero — premium dark navy with subtle Himalaya atmosphere */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1D3A] via-[#0d2242] to-[#0B1D3A]">
        {/* Subtle Himalaya peaks silhouette — CSS only */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full h-[40%]" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path d="M0,300 L0,180 Q150,120 300,140 T600,100 Q750,80 900,120 T1200,140 L1200,300 Z" fill="white" />
            <path d="M0,300 L0,200 Q200,160 400,180 T800,150 Q950,130 1200,170 L1200,300 Z" fill="white" opacity="0.5" />
          </svg>
        </div>
        
        {/* Soft radial glow with orange accent */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 20%, rgba(255,106,0,0.3), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,106,0,0.15), transparent 50%)",
          }}
        />
        
        {/* Subtle grid pattern for depth */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
        
        {/* Subtle route path decoration at bottom */}
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-16 opacity-[0.04] pointer-events-none"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,40 Q200,25 400,35 T800,38 Q1000,42 1200,35 L1200,80 L0,80 Z" 
            fill="#FFFFFF" 
          />
        </svg>
        
        <div className="container mx-auto px-4 pt-12 pb-28 md:pt-24 md:pb-36 lg:pt-28 lg:pb-40 relative">
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

      {/* Premium search card — better integration and polish */}
      <section className="container mx-auto px-4 relative z-10 -mt-16 md:-mt-20 lg:-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-card border border-border/60 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-sm p-6 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#0B1D3A]">Find Your Next Ride</h2>

          {/* Main search input + go button */}
          <form
            onSubmit={(e) => { e.preventDefault(); doSearch(); }}
            className="flex gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search brand, model, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-14 text-base border-border/60 focus:border-[#FF6A00] focus:ring-[#FF6A00]/20"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-7 bg-[#FF6A00] hover:bg-[#FF6A00]/90 shadow-lg" aria-label="Search">
              <Search className="w-5 h-5" />
            </Button>
          </form>

          {/* Quick chip filters — better mobile scroll */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-full border border-border/60 bg-card text-sm font-medium hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 hover:text-[#FF6A00] active:scale-95 transition-all whitespace-nowrap"
            >
              All Brands
            </Link>
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-full border border-border/60 bg-card text-sm font-medium hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 hover:text-[#FF6A00] active:scale-95 transition-all whitespace-nowrap"
            >
              All Districts
            </Link>
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-full border border-border/60 bg-card text-sm font-medium hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 hover:text-[#FF6A00] active:scale-95 transition-all whitespace-nowrap"
            >
              Scooters
            </Link>
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-full border border-border/60 bg-card text-sm font-medium hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 hover:text-[#FF6A00] active:scale-95 transition-all whitespace-nowrap"
            >
              Motorbikes
            </Link>
          </div>

          {/* More Filters CTA */}
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/browse" })}
            className="w-full h-12 gap-2 justify-center text-base border-border/60 hover:border-[#FF6A00] hover:text-[#FF6A00]"
          >
            More Filters <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Browse by brand — polished pills with better spacing */}
      <section className="container mx-auto px-4 py-14 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-7 text-[#0B1D3A]">Browse by brand</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
          {POPULAR_BRANDS.map(b => (
            <Link
              key={b}
              to="/browse"
              search={{ brand: b } as any}
              className="px-5 py-3 rounded-full border border-border/60 bg-card text-sm font-medium hover:border-[#FF6A00] hover:bg-[#FF6A00]/5 hover:text-[#FF6A00] active:scale-95 transition-all duration-200 whitespace-nowrap shadow-sm"
            >
              {b}
            </Link>
          ))}
          <Link
            to="/browse"
            className="px-5 py-3 rounded-full border border-border/60 bg-muted/50 text-sm font-medium text-muted-foreground hover:border-[#FF6A00] hover:text-[#FF6A00] active:scale-95 transition-all duration-200 whitespace-nowrap"
          >
            All bikes →
          </Link>
        </div>
      </section>

      {/* Latest listings — better spacing and premium feel */}
      <section className="bg-muted/30 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B1D3A]">Latest listings</h2>
              <p className="text-sm text-muted-foreground mt-1.5">Fresh bikes added daily across Nepal</p>
            </div>
            <Link to="/browse" className="text-sm text-[#FF6A00] font-medium hover:underline flex items-center gap-1.5">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-card border border-border/60 overflow-hidden shadow-sm">
                  <div className="aspect-[16/10] bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {featured.map(l => <ListingCard key={l.id} listing={l as any} />)}
            </div>
          ) : (
            <div className="text-center py-12 border border-border/60 rounded-2xl bg-card shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-5">No listings yet. Be the first to sell!</p>
              <Button onClick={() => navigate({ to: "/sell" })} className="bg-[#FF6A00] hover:bg-[#FF6A00]/90">Post your bike for free</Button>
            </div>
          )}
        </div>
      </section>

      {/* How it works — polished cards with better visual hierarchy */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1D3A]">How MyRideNepal works</h2>
            <p className="text-muted-foreground mt-2">Built for Nepal's two-wheeler market</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "1. Sellers list bikes", desc: "Create a free listing with photos and specs. MyRideNepal reviews every listing for quality.", color: "bg-[#FF6A00]/10 text-[#FF6A00]" },
              { icon: ShieldCheck, title: "2. Admin review", desc: "Our team reviews listings to filter spam and ensure quality standards.", color: "bg-blue-500/10 text-blue-500" },
              { icon: Users, title: "3. Direct contact", desc: "Buyers contact sellers directly via WhatsApp or phone. No middleman, no commission.", color: "bg-green-500/10 text-green-500" },
            ].map((step, i) => (
              <div key={i} className="bg-card p-7 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2.5 text-[#0B1D3A]">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate({ to: "/sell" })} className="gap-2 bg-[#FF6A00] hover:bg-[#FF6A00]/90 px-8 h-12 shadow-lg">
              Post your bike for free <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Buyer Safety & Seller Benefits — better integrated section */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1D3A]">Why choose MyRideNepal?</h2>
            <p className="text-muted-foreground mt-2">Safe for buyers, profitable for sellers</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Buyer Safety */}
            <div className="bg-card p-7 md:p-8 rounded-2xl border border-border/50 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#0B1D3A]">Buyer Safety Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Inspect bike thoroughly before payment</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Check bluebook and ownership documents</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Meet in safe public location or dealer showroom</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Never pay 100% advance to unknown sellers</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Complete ownership transfer before finalizing</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full h-11 border-border/60 hover:border-[#FF6A00] hover:text-[#FF6A00]" onClick={() => navigate({ to: "/safety-tips" })}>
                Read full safety guide
              </Button>
            </div>

            {/* Seller Benefits */}
            <div className="bg-card p-7 md:p-8 rounded-2xl border border-border/50 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-5">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#0B1D3A]">Seller Benefits</h3>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>List your bike or scooter for free</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>No commission on sales — keep 100% profit</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Buyers contact you directly via phone/WhatsApp</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Reach thousands of buyers across Nepal</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#FF6A00] mt-0.5 font-bold">•</span>
                  <span>Dealers get free beta access with analytics</span>
                </li>
              </ul>
              <Button className="w-full h-11 bg-[#FF6A00] hover:bg-[#FF6A00]/90 shadow-md" onClick={() => navigate({ to: "/sell" })}>
                Start selling now — Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
