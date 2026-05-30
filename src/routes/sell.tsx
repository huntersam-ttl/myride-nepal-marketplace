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
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS, FUEL_TYPES, formatNPR } from "@/lib/nepal";
import { Upload, X, Loader2, CheckCircle2, ChevronRight, Camera, Tag, Wrench, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  component: SellPage,
  head: () => ({
    meta: [
      { title: "Sell Your Bike or Scooter for Free — MyRideNepal" },
      { name: "description", content: "List your bike or scooter for free on MyRideNepal. No commission, direct buyer contact, reach thousands across Nepal. Get started in minutes." },
    ],
  }),
});

interface FormData {
  title: string; brand: string; model: string; year: string;
  condition: string; fuel_type: string; bike_type: string;
  price: string; mileage: string; colour: string; district: string;
  description: string; phone: string; whatsapp: string;
}

const STEPS = [
  { label: "Bike info", icon: Tag },
  { label: "Details", icon: Wrench },
  { label: "Photos", icon: Camera },
  { label: "Contact", icon: Phone },
];

const MAX_LISTING_IMAGES = 8;
const MAX_LISTING_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_LISTING_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_LISTING_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function getFileExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? null;
}

function getListingImageValidationError(file: File) {
  const extension = getFileExtension(file.name);

  if (!extension || !ALLOWED_LISTING_IMAGE_EXTENSIONS.has(extension)) {
    return "Only JPG, PNG, or WebP photos are allowed.";
  }

  if (!ALLOWED_LISTING_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, or WebP photos are allowed.";
  }

  if (file.size > MAX_LISTING_IMAGE_SIZE) {
    return "Each photo must be 5MB or smaller.";
  }

  return null;
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
    description: "", phone: "+977", whatsapp: "",
  });

  if (loading) return (
    <div className="container mx-auto py-20 text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Login to list your bike</h1>
        <p className="text-muted-foreground mb-6">Create a free account to reach buyers across all 77 districts of Nepal.</p>
        <Button size="lg" onClick={() => navigate({ to: "/auth", search: { redirect: "/sell" } as any })}>
          Login or sign up — it's free
        </Button>
      </div>
    );
  }

  const update = (k: keyof FormData, v: string) => setF(p => ({ ...p, [k]: v }));

  const onFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const remainingSlots = MAX_LISTING_IMAGES - files.length;
    if (remainingSlots <= 0) {
      toast.error(`You can upload up to ${MAX_LISTING_IMAGES} photos.`);
      return;
    }

    const validFiles = Array.from(fileList).filter(file => {
      const validationError = getListingImageValidationError(file);
      if (validationError) toast.error(`${file.name}: ${validationError}`);
      return !validationError;
    });

    if (validFiles.length > remainingSlots) {
      toast.error(`You can upload up to ${MAX_LISTING_IMAGES} photos.`);
    }

    const arr = validFiles.slice(0, remainingSlots);
    if (arr.length === 0) return;

    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (files.length === 0) { toast.error("Please upload at least one photo"); return; }
    if (files.length > MAX_LISTING_IMAGES) { toast.error(`You can upload up to ${MAX_LISTING_IMAGES} photos.`); return; }
    if (!f.phone || f.phone === "+977") { toast.error("Please enter your phone number"); return; }
    setSubmitting(true);
    const uploadedPaths: string[] = [];
    try {
      const { data: dealerProfile, error: dealerProfileError } = await supabase
        .from("dealer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dealerProfileError) throw dealerProfileError;

      const urls: string[] = [];
      for (const file of files) {
        const validationError = getListingImageValidationError(file);
        if (validationError) throw new Error(`${file.name}: ${validationError}`);

        const ext = getFileExtension(file.name);
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("listings").upload(path, file);
        if (error) throw error;
        uploadedPaths.push(path);
        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        dealer_id: dealerProfile?.id ?? null,
        title: f.title, brand: f.brand, model: f.model,
        year: Number(f.year), condition: f.condition as any,
        fuel_type: f.fuel_type as any, bike_type: f.bike_type as any,
        price: Number(f.price), mileage: Number(f.mileage),
        colour: f.colour, district: f.district, description: f.description,
        phone: f.phone, whatsapp: f.whatsapp || f.phone,
        images: urls, status: "pending",
      });
      if (error) throw error;
      toast.success("Listing submitted! It'll go live after admin review.");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage.from("listings").remove(uploadedPaths);
        if (cleanupError) console.error("Failed to clean up listing images:", cleanupError);
      }
      toast.error(e.message || "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold">Sell your bike</h1>
          <p className="text-muted-foreground mt-1">Free to list · Reach buyers across Nepal · No commission</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              const Icon = s.icon;
              return (
                <div key={n} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    done ? "bg-primary text-primary-foreground" :
                    active ? "bg-primary/15 text-primary ring-2 ring-primary ring-offset-2" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Basic information</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Tell us the essentials about your bike.</p>
              </div>

              <Field label="Listing title" hint="Be specific — good titles get more views">
                <Input
                  value={f.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="e.g. Bajaj Pulsar NS200 — Excellent Condition"
                  className="h-11"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand">
                  <Select value={f.brand} onValueChange={v => update("brand", v)}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{POPULAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Model">
                  <Input value={f.model} onChange={e => update("model", e.target.value)} placeholder="e.g. NS200" className="h-11" />
                </Field>
                <Field label="Year">
                  <Input type="number" value={f.year} onChange={e => update("year", e.target.value)} min={1990} max={currentYear + 1} className="h-11" />
                </Field>
                <Field label="Condition">
                  <Select value={f.condition} onValueChange={v => update("condition", v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Fuel type">
                  <Select value={f.fuel_type} onValueChange={v => update("fuel_type", v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{FUEL_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Bike type">
                  <Select value={f.bike_type} onValueChange={v => update("bike_type", v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{BIKE_TYPES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={next} disabled={!f.title || !f.brand || !f.model} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Bike details</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Pricing, mileage, and location help buyers decide faster.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Asking price (NPR)" hint="Set a fair price to attract more inquiries">
                  <Input type="number" value={f.price} onChange={e => update("price", e.target.value)} placeholder="350,000" className="h-11" />
                </Field>
                <Field label="Mileage (km)">
                  <Input type="number" value={f.mileage} onChange={e => update("mileage", e.target.value)} placeholder="12,500" className="h-11" />
                </Field>
                <Field label="Colour">
                  <Input value={f.colour} onChange={e => update("colour", e.target.value)} placeholder="e.g. Red" className="h-11" />
                </Field>
                <Field label="District">
                  <Select value={f.district} onValueChange={v => update("district", v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-72">{NEPAL_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Description" hint="Service history, modifications, reason for selling">
                <Textarea
                  rows={5}
                  value={f.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Tell buyers about ownership history, recent service, any extras included..."
                />
              </Field>

              {f.price && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <span className="text-muted-foreground">Listed price: </span>
                  <span className="font-bold text-primary">{formatNPR(Number(f.price))}</span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next} disabled={!f.price || !f.mileage} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Upload photos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Listings with 4+ photos get 3× more views. First photo is the cover.</p>
              </div>

              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
                files.length >= MAX_LISTING_IMAGES ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"
              }`}>
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="font-semibold text-base">Tap to upload photos</span>
                <span className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP · up to 5MB each · max 8 photos</span>
                <span className="text-xs text-muted-foreground mt-2">{files.length}/{MAX_LISTING_IMAGES} uploaded</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  disabled={files.length >= MAX_LISTING_IMAGES}
                  onChange={e => onFiles(e.target.files)}
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square group">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded pointer-events-none">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removeImg(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next} disabled={files.length === 0} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Contact information</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Buyers will reach you directly — no middlemen.</p>
              </div>

              <Field label="Phone number" hint="Buyers will call or text this number">
                <Input value={f.phone} onChange={e => update("phone", e.target.value)} placeholder="+977 98XXXXXXXX" className="h-11" />
              </Field>
              <Field label="WhatsApp number" hint="Leave blank to use phone number">
                <Input value={f.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="Same as phone" className="h-11" />
              </Field>

              {/* Listing preview */}
              <div className="rounded-xl border overflow-hidden bg-muted/30">
                <div className="px-4 py-3 border-b bg-card">
                  <p className="text-sm font-semibold">Listing preview</p>
                </div>
                <div className="p-4 flex gap-4">
                  {previews[0] && (
                    <img src={previews[0]} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold line-clamp-1">{f.title || "—"}</p>
                    <p className="text-primary text-lg font-bold">{f.price ? formatNPR(Number(f.price)) : "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[f.brand, f.model, f.year, f.district].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Your listing will be reviewed by our team and go live within a few hours.
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={submit} disabled={submitting || !f.phone || f.phone === "+977"} size="lg" className="gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit listing"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
