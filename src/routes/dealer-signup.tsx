import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
    business_name: "", description: "", location: "Kathmandu",
    brands: [] as string[], service_area: [] as string[],
    logo_url: "", banner_url: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("dealer_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setExisting(data);
        setF({
          business_name: data.business_name, description: data.description ?? "",
          location: data.location ?? "Kathmandu", brands: data.brands ?? [],
          service_area: data.service_area ?? [], logo_url: data.logo_url ?? "",
          banner_url: data.banner_url ?? "",
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
    setSubmitting(true);
    const slug = existing?.slug ?? `${slugify(f.business_name)}-${Date.now().toString(36).slice(-4)}`;
    const payload = { ...f, slug, user_id: user.id };
    const { error } = existing
      ? await supabase.from("dealer_profiles").update(payload).eq("id", existing.id)
      : await supabase.from("dealer_profiles").insert(payload);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(existing ? "Profile updated" : "Dealer profile created!");
    navigate({ to: "/dealers/$slug", params: { slug } });
  };

  const toggleBrand = (b: string) => setF(p => ({
    ...p, brands: p.brands.includes(b) ? p.brands.filter(x => x !== b) : [...p.brands, b]
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold">{existing ? "Edit dealer profile" : "Become a dealer"}</h1>
      <p className="text-muted-foreground mt-2">Showcase your showroom and reach buyers across Nepal. Verification badge granted after admin review.</p>

      <Card className="p-6 mt-6 space-y-5">
        <div>
          <Label>Business name *</Label>
          <Input value={f.business_name} onChange={e => setF(p => ({ ...p, business_name: e.target.value }))} placeholder="e.g. Kathmandu Bike House" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} placeholder="What makes your dealership stand out?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Location</Label>
            <select className="w-full border rounded-md h-10 px-3 bg-background mt-2" value={f.location} onChange={e => setF(p => ({ ...p, location: e.target.value }))}>
              {NEPAL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input value={f.logo_url} onChange={e => setF(p => ({ ...p, logo_url: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
        <div>
          <Label>Banner URL</Label>
          <Input value={f.banner_url} onChange={e => setF(p => ({ ...p, banner_url: e.target.value }))} placeholder="https://..." />
        </div>
        <div>
          <Label className="mb-2 block">Brands carried</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_BRANDS.map(b => (
              <label key={b} className="flex items-center gap-2 text-sm border rounded-md p-2 cursor-pointer hover:bg-accent">
                <Checkbox checked={f.brands.includes(b)} onCheckedChange={() => toggleBrand(b)} />
                {b}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : existing ? "Save changes" : "Create dealer profile"}
        </Button>
      </Card>
    </div>
  );
}
