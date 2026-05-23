import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, MapPin, Store, ArrowRight, UserPlus, ListChecks, Phone, CheckCircle, Search, Package } from "lucide-react";
import { NEPAL_DISTRICTS, POPULAR_BRANDS } from "@/lib/nepal";
import { useState } from "react";

const PUBLIC_DEALER_CARD_COLUMNS = [
  "id",
  "slug",
  "business_name",
  "description",
  "district",
  "location",
  "brands",
  "logo_url",
  "banner_url",
  "verified",
  "active_listings_count",
].join(",");

export const Route = createFileRoute("/dealers")({
  component: DealersPage,
  head: () => ({
    meta: [
      { title: "Verified Bike & Scooter Dealers in Nepal — MyRideNepal" },
      { name: "description", content: "Browse trusted verified dealers across Nepal. View showrooms, inventory, ratings. Free dealer beta program available." },
    ],
  }),
});

function DealersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_dealer_profiles")
        .select(PUBLIC_DEALER_CARD_COLUMNS)
        .order("verified", { ascending: false })
        .order("business_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Filter dealers based on search and filters
  const filteredData = (data ?? []).filter(d => {
    // Type assertion for Phase 1 fields
    const dealer = d as any;
    
    // Verified filter
    if (verifiedOnly && !dealer.verified) return false;
    
    // District filter
    if (districtFilter !== "all" && dealer.district !== districtFilter) return false;
    
    // Search query - search in business name, brands, district
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = dealer.business_name?.toLowerCase().includes(query);
      const matchesBrands = dealer.brands?.some((b: string) => b.toLowerCase().includes(query));
      const matchesDistrict = dealer.district?.toLowerCase().includes(query);
      if (!matchesName && !matchesBrands && !matchesDistrict) return false;
    }
    
    return true;
  });

  const verified = filteredData.filter(d => d.verified);
  const unverified = filteredData.filter(d => !d.verified);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Verified dealers</h1>
              <p className="text-muted-foreground mt-1">Established showrooms and trusted sellers across Nepal.</p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/dealer-signup">
                Become a dealer <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          {!isLoading && data && data.length > 0 && (
            <div className="flex gap-6 mt-6 text-sm">
              <div>
                <span className="font-bold text-xl">{verified.length}</span>
                <span className="text-muted-foreground ml-2">Verified dealers</span>
              </div>
              <div>
                <span className="font-bold text-xl">{data.length}</span>
                <span className="text-muted-foreground ml-2">Total dealers</span>
              </div>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            <div className="sm:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search dealers, brands..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {NEPAL_DISTRICTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant={verifiedOnly ? "default" : "outline"}
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className="gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {verifiedOnly ? "Verified only" : "All dealers"}
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works for Dealers</h2>
            <p className="text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-sm">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Dealer Profile</h3>
              <p className="text-muted-foreground">
                Sign up and create your dealer profile with your business details and branding
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ListChecks className="w-8 h-8 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-sm">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">List All Your Inventory</h3>
              <p className="text-muted-foreground">
                Add unlimited bike listings completely free with no commission fees
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-sm">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Contacted by Buyers</h3>
              <p className="text-muted-foreground">
                Buyers reach you directly via phone and WhatsApp for instant connections
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Benefits for Dealers</h2>
            <p className="text-muted-foreground">Everything you need to grow your business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <CheckCircle className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Unlimited Listings</h3>
              <p className="text-sm text-muted-foreground">
                Verified dealers can list unlimited bikes with no commission fees
              </p>
            </Card>
            
            <Card className="p-6">
              <Store className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Dedicated Profile Page</h3>
              <p className="text-sm text-muted-foreground">
                Get your own dealer profile page with your branding and all your listings
              </p>
            </Card>
            
            <Card className="p-6">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Verified Badge</h3>
              <p className="text-sm text-muted-foreground">
                Stand out with a verified dealer badge on all your listings
              </p>
            </Card>
            
            <Card className="p-6">
              <Phone className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Direct Contact</h3>
              <p className="text-sm text-muted-foreground">
                Buyers contact you directly via WhatsApp and phone for faster sales
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Districts We Cover Section */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Districts We Cover</h2>
            <p className="text-muted-foreground">Serving dealers across Nepal's major cities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Chitwan", "Butwal", "Biratnagar", "Dharan", "Hetauda", "Birgunj"].map((city) => (
              <Card key={city} className="p-4 text-center hover:shadow-md transition-shadow">
                <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{city}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">...and all 77 districts of Nepal</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border overflow-hidden animate-pulse">
                <div className="h-28 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredData && filteredData.length > 0 ? (
          <div className="space-y-8">
            {verified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">Verified dealers</h2>
                  <Badge variant="outline" className="text-xs">{verified.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {verified.map(d => <DealerCard key={d.id} dealer={d} />)}
                </div>
              </div>
            )}
            {unverified.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-muted-foreground">Other dealers</h2>
                  <Badge variant="secondary" className="text-xs">{unverified.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {unverified.map(d => <DealerCard key={d.id} dealer={d} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-16 text-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h2 className="font-semibold text-lg mb-1">
              {searchQuery || districtFilter !== "all" || verifiedOnly 
                ? "No dealers found" 
                : "No dealers yet"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery || districtFilter !== "all" || verifiedOnly
                ? "Try adjusting your search or filters."
                : "Be the first verified dealer on MyRideNepal."}
            </p>
            {!searchQuery && districtFilter === "all" && !verifiedOnly && (
              <Button asChild>
                <Link to="/dealer-signup">Register as a dealer</Link>
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function DealerCard({ dealer: d }: { dealer: any }) {
  return (
    <Link to="/dealers/$slug" params={{ slug: d.slug }}>
      <Card className="overflow-hidden h-full group hover:shadow-[var(--shadow-elegant)] transition-shadow shadow-[var(--shadow-card)]">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-primary/15 to-secondary/20 relative overflow-hidden">
          {d.banner_url && (
            <img src={d.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          {d.verified && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className="gap-1 bg-white/90 text-primary border-0 shadow-sm text-xs">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 -mt-8 mb-3">
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl bg-card border-2 border-card shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
              {d.logo_url
                ? <img src={d.logo_url} alt="" className="w-full h-full object-cover" />
                : <Store className="w-6 h-6 text-muted-foreground" />
              }
            </div>
            <div className="min-w-0 pt-8">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{d.business_name}</h3>
              {(d.district || d.location) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{d.district || d.location}
                </p>
              )}
            </div>
          </div>

          {d.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">{d.description}</p>
          )}

          {d.brands && d.brands.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {d.brands.slice(0, 4).map((b: string) => (
                <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
              ))}
              {d.brands.length > 4 && (
                <Badge variant="secondary" className="text-xs">+{d.brands.length - 4}</Badge>
              )}
            </div>
          )}
          
          {d.active_listings_count > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
              <Package className="w-3.5 h-3.5" />
              <span>{d.active_listings_count} active listing{d.active_listings_count !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
