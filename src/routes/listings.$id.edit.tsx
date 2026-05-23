import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS, FUEL_TYPES } from "@/lib/nepal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/listings/$id/edit")({
  component: EditListingPage,
  head: () => ({ meta: [{ title: "Edit Listing — MyRideNepal" }] }),
});

function EditListingPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: `/listings/${id}/edit` } as any });
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    supabase.from("listings").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { toast.error("Failed to load listing"); navigate({ to: "/dashboard" }); return; }
      if (!data) { toast.error("Not found"); navigate({ to: "/dashboard" }); return; }
      if (data.user_id !== user.id) { toast.error("Not allowed"); navigate({ to: "/dashboard" }); return; }
      // Only allow editing pending or rejected listings
      if (data.status !== "pending" && data.status !== "rejected") {
        toast.error("Cannot edit listings that are active or sold");
        navigate({ to: "/dashboard" });
        return;
      }
      setF(data);
    });
  }, [user, id]);

  if (!f) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const u = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (!f.brand || !f.model) { toast.error("Brand and model are required"); return; }
    if (!f.price || Number(f.price) <= 0) { toast.error("Valid price is required"); return; }
    if (!f.phone.match(/^(\+?977[-\s]?)?\d{10}$/)) { toast.error("Please enter a valid phone number"); return; }
    
    setSaving(true);
    
    const oldPrice = f.price; // Store original price before changes
    const newPrice = Number(f.price);
    
    const updates: any = {
      title: f.title.trim(), brand: f.brand, model: f.model, year: Number(f.year),
      condition: f.condition, fuel_type: f.fuel_type, bike_type: f.bike_type,
      price: newPrice, mileage: Number(f.mileage), colour: f.colour,
      district: f.district, description: f.description.trim(), phone: f.phone, whatsapp: f.whatsapp,
    };

    if (!f.dealer_id) {
      const { data: dealerProfile, error: dealerProfileError } = await supabase
        .from("dealer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dealerProfileError) {
        setSaving(false);
        return toast.error(dealerProfileError.message);
      }

      if (dealerProfile?.id) {
        updates.dealer_id = dealerProfile.id;
      }
    }
    
    // If listing was rejected, reset to pending for re-review
    if (f.status === "rejected") {
      updates.status = "pending";
      updates.rejection_reason = null;
    }
    
    const { error } = await supabase.from("listings").update(updates).eq("id", id);
    
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    
    // Check if price has dropped and notify saved users
    const priceChanged = oldPrice !== newPrice;
    if (priceChanged && newPrice < oldPrice) {
      // Get all users who have saved this listing with notify_price_drop enabled
      const { data: savedUsers } = await supabase
        .from("saved_listings")
        .select("user_id, price_at_save")
        .eq("listing_id", id)
        .eq("notify_price_drop", true);
      
      if (savedUsers && savedUsers.length > 0) {
        // TODO(security-s3): restore trusted price-drop notifications via trigger/server function.
      }
    }
    
    setSaving(false);
    toast.success(f.status === "rejected" ? "Listing resubmitted for review" : "Listing updated");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/dashboard" className="text-sm text-muted-foreground">← Dashboard</Link>
      <h1 className="text-3xl font-bold mt-2">Edit listing</h1>
      {f.status === "rejected" && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">This listing was rejected</p>
          {f.rejection_reason && (
            <p className="text-xs text-muted-foreground mt-1">Reason: {f.rejection_reason}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Please review and update your listing before resubmitting</p>
        </div>
      )}
      <Card className="p-6 mt-6 space-y-4">
        <div><Label>Title</Label><Input value={f.title} onChange={e => u("title", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Brand</Label>
            <Select value={f.brand} onValueChange={v => u("brand", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Model</Label><Input value={f.model} onChange={e => u("model", e.target.value)} /></div>
          <div><Label>Year</Label><Input type="number" value={f.year} onChange={e => u("year", e.target.value)} /></div>
          <div><Label>Mileage (km)</Label><Input type="number" value={f.mileage} onChange={e => u("mileage", e.target.value)} /></div>
          <div><Label>Price (NPR)</Label><Input type="number" value={f.price} onChange={e => u("price", e.target.value)} /></div>
          <div><Label>Colour</Label><Input value={f.colour ?? ""} onChange={e => u("colour", e.target.value)} /></div>
          <div><Label>Condition</Label>
            <Select value={f.condition} onValueChange={v => u("condition", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Fuel</Label>
            <Select value={f.fuel_type} onValueChange={v => u("fuel_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FUEL_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Type</Label>
            <Select value={f.bike_type} onValueChange={v => u("bike_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BIKE_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>District</Label>
            <Select value={f.district} onValueChange={v => u("district", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">{NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Description</Label><Textarea rows={5} value={f.description ?? ""} onChange={e => u("description", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Phone</Label><Input value={f.phone} onChange={e => u("phone", e.target.value)} /></div>
          <div><Label>WhatsApp</Label><Input value={f.whatsapp ?? ""} onChange={e => u("whatsapp", e.target.value)} /></div>
        </div>
        <Button onClick={save} disabled={saving} size="lg" className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
        </Button>
      </Card>
    </div>
  );
}
