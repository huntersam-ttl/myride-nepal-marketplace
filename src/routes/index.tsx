import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, Users, Zap, ArrowRight } from "lucide-react";
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

  const { data: featured } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,brand,price,year,mileage,district,condition,images,featured")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const search = () => {
    const params: Record<string, string> = {};
    if (brand) params.brand = brand;
    if (district) params.district = district;
    navigate({ to: "/browse", search: params as any });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.25), transparent 50%)"
        }} />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-center mx-auto"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              🇳🇵 Made for Nepal
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Nepal's Trusted <span className="text-primary">Bike & Scooter</span> Marketplace
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Browse thousands of verified bikes and scooters across all 77 districts. Buy and sell with confidence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate({ to: "/browse" })} className="text-base">
                Browse Bikes <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate({ to: "/sell" })} className="text-base bg-white text-secondary hover:bg-white/90">
                Sell Your Bike
              </Button>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-4xl mx-auto p-4 rounded-2xl bg-card shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
                <SelectContent>{POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent className="max-h-72">{NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Max price (NPR)" type="number" />
              <Button onClick={search} size="lg" className="gap-2">
                <Search className="w-4 h-4" /> Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular brands */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Popular brands</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {POPULAR_BRANDS.map(b => (
            <Link
              key={b}
              to="/browse"
              search={{ brand: b } as any}
              className="aspect-square flex flex-col items-center justify-center bg-card border rounded-xl hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-1">
                <span className="font-bold text-primary text-sm">{b[0]}</span>
              </div>
              <span className="text-xs font-medium text-center px-1">{b}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Latest listings</h2>
          <Link to="/browse" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>
        {featured?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(l => <ListingCard key={l.id} listing={l as any} />)}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">Loading listings...</div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How MyRideNepal works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "1. List your bike", desc: "Create a free listing in under 3 minutes with photos, specs, and price." },
              { icon: Users, title: "2. Get contacted", desc: "Buyers reach out directly via call or WhatsApp. No middlemen." },
              { icon: ShieldCheck, title: "3. Sell safely", desc: "Meet in safe public locations. Verified dealers available across Nepal." },
            ].map((step, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border shadow-[var(--shadow-card)]">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
