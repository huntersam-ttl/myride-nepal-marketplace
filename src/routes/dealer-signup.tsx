import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, MapPin, Phone, Globe2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { POPULAR_BRANDS, NEPAL_DISTRICTS } from "@/lib/nepal";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/dealer-signup")({
  component: DealerSignupPage,
  head: () => ({ meta: [{ title: "Become a Dealer — MyRideNepal" }] }),
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function DealerSignupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [f, setF] = useState({
    business_name: "", description: "", location: "Kathmandu", district: "Kathmandu", full_address: "",
    phone: "", whatsapp: "", years_in_business: "",
    facebook_url: "", tiktok_url: "", youtube_url: "", instagram_url: "",
    brands: [] as string[], service_area: [] as string[],
    logo_url: "", banner_url: "",
    exchange_accepted: false, financing_available: false, service_centre: false,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("dealer_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      if (error) { toast.error("Failed to load your profile"); return; }
      if (data) {
        setExisting(data);
        // Type assertion for Phase 1 fields not yet in generated types
        const profile = data as any;
        setF({
          business_name: profile.business_name, description: profile.description ?? "",
          location: profile.location ?? "Kathmandu", district: profile.district ?? "Kathmandu",
          full_address: profile.full_address ?? "", phone: profile.phone ?? "", whatsapp: profile.whatsapp ?? "",
          years_in_business: profile.years_in_business?.toString() ?? "",
          facebook_url: profile.facebook_url ?? "", tiktok_url: profile.tiktok_url ?? "",
          youtube_url: profile.youtube_url ?? "", instagram_url: profile.instagram_url ?? "",
          brands: profile.brands ?? [], service_area: profile.service_area ?? [],
          logo_url: profile.logo_url ?? "", banner_url: profile.banner_url ?? "",
          exchange_accepted: profile.exchange_accepted ?? false,
          financing_available: profile.financing_available ?? false,
          service_centre: profile.service_centre ?? false,
        });
      }
    });
  }, [user]);

  if (loading) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Login required</h1>
        <Button onClick={() => navigate({ to: "/auth", search: { redirect: "/dealer-signup" } as any })}>Login</Button>
      </div>
    );
  }

  const submit = async () => {
    if (!f.business_name) return toast.error("Business name required");
    if (!f.district) return toast.error("District required");
    setSubmitting(true);
    
    const slug = existing?.slug ?? `${slugify(f.business_name)}-${Date.now().toString(36).slice(-4)}`;
    const years = f.years_in_business ? parseInt(f.years_in_business, 10) : null;
    
    const payload: any = {
      business_name: f.business_name,
      description: f.description || null,
      location: f.location, // Keep for backwards compat
      district: f.district,
      full_address: f.full_address || null,
      phone: f.phone || null,
      whatsapp: f.whatsapp || null,
      years_in_business: years,
      facebook_url: f.facebook_url || null,
      tiktok_url: f.tiktok_url || null,
      youtube_url: f.youtube_url || null,
      instagram_url: f.instagram_url || null,
      brands: f.brands,
      service_area: f.service_area,
      logo_url: f.logo_url || null,
      banner_url: f.banner_url || null,
      exchange_accepted: f.exchange_accepted,
      financing_available: f.financing_available,
      service_centre: f.service_centre,
      slug,
      user_id: user.id,
    };
    
    const { error } = existing
      ? await supabase.from("dealer_profiles").update(payload).eq("id", existing.id)
      : await supabase.from("dealer_profiles").insert(payload);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(existing ? "Profile updated! Changes will be reviewed by admin." : "Dealer profile created! Your profile will be reviewed by admin for verification.");
    navigate({ to: "/dealers/$slug", params: { slug } });
  };

  const toggleBrand = (b: string) => setF(p => ({
    ...p, brands: p.brands.includes(b) ? p.brands.filter(x => x !== b) : [...p.brands, b]
  }));

  const toggleServiceArea = (d: string) => setF(p => ({
    ...p, service_area: p.service_area.includes(d) ? p.service_area.filter(x => x !== d) : [...p.service_area, d]
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold">{existing ? "Edit dealer profile" : "Become a dealer"}</h1>
      <p className="text-muted-foreground mt-2">Showcase your showroom and reach buyers across Nepal. Verification badge granted after admin review.</p>

      <Card className="p-6 mt-6 space-y-6">
        {/* Business Information */}
        <div className="space-y-4 pb-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Business Information
          </h2>
          <div>
            <Label>Business name *</Label>
            <Input value={f.business_name} onChange={e => setF(p => ({ ...p, business_name: e.target.value }))} placeholder="e.g. Kathmandu Bike House" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="What makes your dealership stand out?" />
          </div>
          <div>
            <Label>Years in business</Label>
            <Input type="number" value={f.years_in_business} onChange={e => setF(p => ({ ...p, years_in_business: e.target.value }))} placeholder="e.g. 5" />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 pb-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Location
          </h2>
          <div>
            <Label>District *</Label>
            <select className="w-full border rounded-md h-10 px-3 bg-background mt-2" value={f.district} onChange={e => setF(p => ({ ...p, district: e.target.value, location: e.target.value }))}>
              {NEPAL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label>Full address</Label>
            <Textarea rows={3} value={f.full_address} onChange={e => setF(p => ({ ...p, full_address: e.target.value }))} placeholder="Street address, landmarks, etc." />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4 pb-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5" /> Contact
          </h2>
          <div>
            <Label>Phone</Label>
            <Input type="tel" value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +9779801234567" />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input type="tel" value={f.whatsapp} onChange={e => setF(p => ({ ...p, whatsapp: e.target.value }))} placeholder="e.g. +9779801234567" />
          </div>
        </div>

        {/* Branding & Social */}
        <div className="space-y-4 pb-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe2 className="w-5 h-5" /> Branding & Social
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Logo URL</Label>
              <Input value={f.logo_url} onChange={e => setF(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Banner URL</Label>
              <Input value={f.banner_url} onChange={e => setF(p => ({ ...p, banner_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Facebook URL</Label>
              <Input value={f.facebook_url} onChange={e => setF(p => ({ ...p, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label>Instagram URL</Label>
              <Input value={f.instagram_url} onChange={e => setF(p => ({ ...p, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>YouTube URL</Label>
              <Input value={f.youtube_url} onChange={e => setF(p => ({ ...p, youtube_url: e.target.value }))} placeholder="https://youtube.com/..." />
            </div>
            <div>
              <Label>TikTok URL</Label>
              <Input value={f.tiktok_url} onChange={e => setF(p => ({ ...p, tiktok_url: e.target.value }))} placeholder="https://tiktok.com/@..." />
            </div>
          </div>
        </div>

        {/* Brands */}
        <div className="space-y-4 pb-6 border-b">
          <Label className="text-lg font-semibold">Brands carried</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_BRANDS.map(b => (
              <label key={b} className="flex items-center gap-2 text-sm border rounded-md p-2 cursor-pointer hover:bg-accent">
                <Checkbox checked={f.brands.includes(b)} onCheckedChange={() => toggleBrand(b)} />
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-4 pb-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5" /> Services
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label className="font-medium">Exchange accepted</Label>
                <p className="text-xs text-muted-foreground">Accept bikes in exchange</p>
              </div>
              <Switch checked={f.exchange_accepted} onCheckedChange={v => setF(p => ({ ...p, exchange_accepted: v }))} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label className="font-medium">Financing available</Label>
                <p className="text-xs text-muted-foreground">Offer loan/EMI options</p>
              </div>
              <Switch checked={f.financing_available} onCheckedChange={v => setF(p => ({ ...p, financing_available: v }))} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label className="font-medium">Service centre</Label>
                <p className="text-xs text-muted-foreground">Have repair & maintenance</p>
              </div>
              <Switch checked={f.service_centre} onCheckedChange={v => setF(p => ({ ...p, service_centre: v }))} />
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Service areas ({f.service_area.length} selected)</Label>
          <p className="text-xs text-muted-foreground -mt-2">Which districts do you serve?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {NEPAL_DISTRICTS.map(d => (
              <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={f.service_area.includes(d)} onCheckedChange={() => toggleServiceArea(d)} />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* Slug (only for existing profiles) */}
        {existing && (
          <div className="pt-6 border-t">
            <Label>Profile URL slug (cannot be changed)</Label>
            <Input value={existing.slug} disabled className="opacity-50 cursor-not-allowed" />
          </div>
        )}

        <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : existing ? "Save changes" : "Create dealer profile"}
        </Button>
      </Card>
    </div>
  );
}
