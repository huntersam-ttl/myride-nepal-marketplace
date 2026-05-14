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

function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function BrandLogo({ brand }: { brand: string }) {
  const logos: Record<string, React.ReactElement> = {
    "Honda": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="35" width="8" height="30" fill="currentColor" className="text-red-600" />
        <rect x="82" y="35" width="8" height="30" fill="currentColor" className="text-red-600" />
        <rect x="18" y="42" width="64" height="3" fill="currentColor" className="text-red-600" />
        <rect x="18" y="55" width="64" height="3" fill="currentColor" className="text-red-600" />
        <rect x="42" y="35" width="16" height="30" fill="currentColor" className="text-red-600" />
      </svg>
    ),
    "Yamaha": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M20,70 L35,30 L42,30 L42,70 L35,70 L35,45 L25,70 L20,70 Z" fill="currentColor" className="text-blue-700" />
        <path d="M50,30 L60,30 L70,55 L80,30 L90,30 L75,70 L65,70 L50,30 Z" fill="currentColor" className="text-blue-700" />
        <circle cx="15" cy="50" r="8" fill="currentColor" className="text-blue-700" />
      </svg>
    ),
    "Bajaj": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M20,30 L35,30 C45,30 48,35 48,42 C48,49 45,54 35,54 L28,54 L28,70 L20,70 Z M28,38 L28,46 L33,46 C37,46 39,45 39,42 C39,39 37,38 33,38 Z" fill="currentColor" className="text-blue-900" />
        <rect x="52" y="30" width="8" height="40" fill="currentColor" className="text-blue-900" />
        <path d="M65,30 L80,30 L85,45 L90,30 L95,30 L88,50 L82,50 Z" fill="currentColor" className="text-blue-900" />
        <rect x="15" y="55" width="70" height="4" fill="currentColor" className="text-orange-500" />
      </svg>
    ),
    "TVS": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="15" y="30" width="70" height="8" fill="currentColor" className="text-red-600" />
        <rect x="46" y="30" width="8" height="40" fill="currentColor" className="text-red-600" />
        <path d="M25,50 L30,70 L70,70 L75,50" fill="none" stroke="currentColor" strokeWidth="6" className="text-blue-800" />
        <circle cx="35" cy="65" r="4" fill="currentColor" className="text-blue-800" />
        <circle cx="65" cy="65" r="4" fill="currentColor" className="text-blue-800" />
      </svg>
    ),
    "KTM": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M20,30 L28,30 L28,48 L40,30 L50,30 L38,48 L52,70 L42,70 L32,52 L28,56 L28,70 L20,70 Z" fill="currentColor" className="text-orange-600" />
        <path d="M55,30 L75,30 L75,38 L67,38 L67,70 L59,70 L59,38 L55,38 Z" fill="currentColor" className="text-orange-600" />
        <path d="M78,30 L86,30 L86,48 L92,30 L98,30 L98,70 L90,70 L90,52 L84,70 L78,70 Z" fill="currentColor" className="text-orange-600" />
      </svg>
    ),
    "Hero": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="15" y="30" width="8" height="40" fill="currentColor" className="text-red-700" />
        <rect x="15" y="48" width="22" height="6" fill="currentColor" className="text-red-700" />
        <rect x="29" y="30" width="8" height="40" fill="currentColor" className="text-red-700" />
        <path d="M45,30 L53,30 L53,48 L65,48 L65,30 L73,30 L73,70 L65,70 L65,56 L53,56 L53,70 L45,70 Z" fill="currentColor" className="text-red-700" />
        <circle cx="83" cy="50" r="10" fill="currentColor" className="text-red-700" />
      </svg>
    ),
    "Royal Enfield": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-amber-700" />
        <path d="M35,35 L50,50 L65,35" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-700" />
        <rect x="48" y="20" width="4" height="15" fill="currentColor" className="text-amber-700" />
        <text x="50" y="72" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" className="text-amber-700">RE</text>
      </svg>
    ),
    "Suzuki": (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M20,35 L45,35 C50,35 52,37 52,42 C52,45 51,47 47,48 C51,49 53,51 53,55 C53,60 50,62 45,62 L20,62 Z M28,41 L28,46 L42,46 C44,46 45,45 45,43.5 C45,42 44,41 42,41 Z M28,50 L28,56 L42,56 C45,56 46,55 46,53 C46,51 45,50 42,50 Z" fill="currentColor" className="text-blue-600" />
        <path d="M58,38 L82,38 L82,44 L66,44 L66,46 L80,46 L80,52 L66,52 L66,56 L82,56 L82,62 L58,62 Z" fill="currentColor" className="text-blue-600" />
        <rect x="15" y="65" width="70" height="3" fill="currentColor" className="text-red-600" />
      </svg>
    ),
  };

  return logos[brand] || (
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
      <span className="font-bold text-primary text-lg">{brand[0]}</span>
    </div>
  );
}

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
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 rounded-full"
            style={{ 
              background: "radial-gradient(circle, rgba(232,75,26,0.4), transparent 70%)",
              filter: "blur(40px)"
            }}
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
            style={{ 
              background: "radial-gradient(circle, rgba(232,75,26,0.25), transparent 70%)",
              filter: "blur(40px)"
            }}
            animate={{ 
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl text-center mx-auto"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-6 cursor-default"
            >
              🇳🇵 Made for Nepal
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Nepal's Trusted <span className="text-primary">Bike & Scooter</span> Marketplace
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Browse thousands of verified bikes and scooters across all 77 districts. Buy and sell with confidence.
            </p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" onClick={() => navigate({ to: "/browse" })} className="text-base relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-primary-glow opacity-0 group-hover:opacity-30"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative">Browse Bikes <ArrowRight className="w-4 h-4 ml-1 inline" /></span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="secondary" onClick={() => navigate({ to: "/sell" })} className="text-base bg-white text-secondary hover:bg-white/90">
                  Sell Your Bike
                </Button>
              </motion.div>
            </motion.div>
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
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-6"
        >
          Popular brands
        </motion.h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {POPULAR_BRANDS.map((b, index) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
            >
              <Link
                to="/browse"
                search={{ brand: b } as any}
                className="aspect-square flex flex-col items-center justify-center bg-card border rounded-xl hover:border-primary hover:shadow-md transition-all group p-3 hover:scale-105"
              >
                <motion.div 
                  className="w-14 h-14 flex items-center justify-center mb-2"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <BrandLogo brand={b} />
                </motion.div>
                <span className="text-xs font-medium text-center px-1">{b}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold">Latest listings</h2>
          <Link to="/browse" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </motion.div>
        {featured?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((l, index) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 80
                }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <ListingCard listing={l as any} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-muted-foreground py-12"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Loading listings...
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-center mb-10"
          >
            How MyRideNepal works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "1. List your bike", desc: "Create a free listing in under 3 minutes with photos, specs, and price." },
              { icon: Users, title: "2. Get contacted", desc: "Buyers reach out directly via call or WhatsApp. No middlemen." },
              { icon: ShieldCheck, title: "3. Sell safely", desc: "Meet in safe public locations. Verified dealers available across Nepal." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 80
                }}
                whileHover={{ 
                  y: -12,
                  boxShadow: "0 20px 40px -12px rgba(232, 75, 26, 0.25)",
                  transition: { duration: 0.3 }
                }}
                className="bg-card p-6 rounded-xl border shadow-[var(--shadow-card)]"
              >
                <motion.div 
                  className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4"
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -10, 10, -10, 0],
                    backgroundColor: "rgba(232, 75, 26, 0.2)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
