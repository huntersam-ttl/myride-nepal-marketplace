import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS, FUEL_TYPES } from "@/lib/nepal";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  component: SellPage,
  head: () => ({ meta: [{ title: "Sell Your Bike — MyRideNepal" }] }),
});

interface FormData {
  title: string; brand: string; model: string; year: string;
  condition: string; fuel_type: string; bike_type: string;
  price: string; mileage: string; colour: string; district: string;
  description: string; phone: string; whatsapp: string;
}

function SellPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const currentYear = new Date().getFullYear();

  const [f, setF] = useState<FormData>({
    title: "", brand: "", model: "", year: String(currentYear),
    condition: "good", fuel_type: "petrol", bike_type: "commuter",
    price: "", mileage: "", colour: "", district: "Kathmandu",
    description: "", phone: "+977", whatsapp: "+977",
  });

  if (loading) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Login required</h1>
        <p className="text-muted-foreground mb-6">You need an account to post a listing on MyRideNepal.</p>
        <Button onClick={() => navigate({ to: "/auth", search: { redirect: "/sell" } as any })}>Login or sign up</Button>
      </div>
    );
  }

  const update = (k: keyof FormData, v: string) => setF(p => ({ ...p, [k]: v }));

  const onFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).slice(0, 8 - files.length);
    
    // Validate files
    for (const file of arr) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
    }
    
    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (files.length === 0) { toast.error("Please upload at least one photo"); return; }
    if (!f.phone.match(/^\+?977[-\s]?\d{10}$/)) { toast.error("Please enter a valid Nepali phone number"); return; }
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (!f.brand || !f.model) { toast.error("Brand and model are required"); return; }
    if (!f.price || Number(f.price) <= 0) { toast.error("Valid price is required"); return; }
    
    setSubmitting(true);
    try {
      // Validate and upload images
      const urls: string[] = [];
      for (const file of files) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Image ${file.name} is too large. Max 5MB per image.`);
        }
        
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("listings").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: f.title.trim(), brand: f.brand, model: f.model,
        year: Number(f.year), condition: f.condition as any,
        fuel_type: f.fuel_type as any, bike_type: f.bike_type as any,
        price: Number(f.price), mileage: Number(f.mileage),
        colour: f.colour, district: f.district, description: f.description.trim(),
        phone: f.phone, whatsapp: f.whatsapp || f.phone,
        images: urls, status: "pending",
      });
      if (error) throw error;
      toast.success("Listing submitted! Awaiting admin approval.");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Sell your bike</h1>
      <p className="text-muted-foreground mb-6">Free to list • Reach buyers across Nepal</p>

      {/* Stepper */}
      <div className="flex gap-2 mb-6">
        {[1,2,3,4].map(n => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Basic info</h2>
            <Field label="Listing title">
              <Input value={f.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Bajaj Pulsar NS200 - Excellent Condition" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <Select value={f.brand} onValueChange={v => update("brand", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Model"><Input value={f.model} onChange={e => update("model", e.target.value)} placeholder="e.g. Pulsar NS200" /></Field>
              <Field label="Year"><Input type="number" value={f.year} onChange={e => update("year", e.target.value)} min={1990} max={currentYear + 1} /></Field>
              <Field label="Condition">
                <Select value={f.condition} onValueChange={v => update("condition", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Fuel">
                <Select value={f.fuel_type} onValueChange={v => update("fuel_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Bike type">
                <Select value={f.bike_type} onValueChange={v => update("bike_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BIKE_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={next} disabled={!f.title || !f.brand || !f.model}>Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (NPR)"><Input type="number" value={f.price} onChange={e => update("price", e.target.value)} placeholder="350000" /></Field>
              <Field label="Mileage (km)"><Input type="number" value={f.mileage} onChange={e => update("mileage", e.target.value)} placeholder="12500" /></Field>
              <Field label="Colour"><Input value={f.colour} onChange={e => update("colour", e.target.value)} placeholder="e.g. Red" /></Field>
              <Field label="District">
                <Select value={f.district} onValueChange={v => update("district", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">{NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Textarea rows={5} value={f.description} onChange={e => update("description", e.target.value)} placeholder="Tell buyers about ownership, service history, accessories..." />
            </Field>
            <div className="flex justify-between">
              <Button variant="outline" onClick={back}>Back</Button>
              <Button onClick={next} disabled={!f.price || !f.mileage}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Photos</h2>
            <p className="text-sm text-muted-foreground">Upload up to 8 photos. The first is your cover.</p>

            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="font-medium">Tap to upload photos</span>
              <span className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB each</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => onFiles(e.target.files)} />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-md" />
                    {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Cover</span>}
                    <button onClick={() => removeImg(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={back}>Back</Button>
              <Button onClick={next} disabled={files.length === 0}>Continue</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Contact info</h2>
            <Field label="Phone"><Input value={f.phone} onChange={e => update("phone", e.target.value)} placeholder="+977 98XXXXXXXX" /></Field>
            <Field label="WhatsApp (optional)"><Input value={f.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="Same as phone if blank" /></Field>

            <Card className="p-4 bg-muted/50">
              <p className="text-sm font-semibold mb-2">Preview</p>
              <p className="font-bold">{f.title || "—"}</p>
              <p className="text-primary text-lg font-bold">NPR {Number(f.price || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{f.brand} {f.model} · {f.year} · {f.district}</p>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={back}>Back</Button>
              <Button onClick={submit} disabled={submitting || !f.phone}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit listing
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
