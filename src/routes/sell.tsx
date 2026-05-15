import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { POPULAR_BRANDS, NEPAL_DISTRICTS, BIKE_TYPES, CONDITIONS, FUEL_TYPES, formatNPR } from "@/lib/nepal";
import { Upload, X, Loader2, CheckCircle2, ChevronRight, Camera, Tag, Wrench, Phone, FileText, Calendar, Info, Lightbulb, Circle } from "lucide-react";
import { toast } from "sonner";
import { calculateListingScore } from "@/utils/listingScore";

export const Route = createFileRoute("/sell")({
  component: SellPage,
  head: () => ({ meta: [{ title: "Sell Your Bike — MyRideNepal" }] }),
});

interface FormData {
  title: string; brand: string; model: string; year: string;
  condition: string; fuel_type: string; bike_type: string;
  price: string; mileage: string; colour: string; district: string;
  description: string; phone: string; whatsapp: string;
  // Bike History fields
  num_owners: number;
  accident_history: boolean;
  accident_details: string;
  service_history: boolean;
  last_service_date: string;
  registration_expiry: string;
  insurance_valid: boolean;
  original_parts: boolean;
  modifications: string;
  // Documents and Paperwork fields
  has_bluebook: boolean;
  bluebook_name_match: boolean;
  has_insurance: boolean;
  has_tax_clearance: boolean;
  has_registration: boolean;
  document_notes: string;
}

const STEPS = [
  { label: "Bike info", icon: Tag },
  { label: "Details", icon: Wrench },
  { label: "History", icon: FileText },
  { label: "Photos", icon: Camera },
  { label: "Contact", icon: Phone },
];

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
    // Bike History defaults
    num_owners: 1,
    accident_history: false,
    accident_details: "",
    service_history: false,
    last_service_date: "",
    registration_expiry: "",
    insurance_valid: false,
    original_parts: true,
    modifications: "",
    // Documents and Paperwork defaults
    has_bluebook: false,
    bluebook_name_match: false,
    has_insurance: false,
    has_tax_clearance: false,
    has_registration: false,
    document_notes: "",
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
    const arr = Array.from(fileList).slice(0, 8 - files.length);
    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (files.length === 0) { toast.error("Please upload at least one photo"); return; }
    if (!f.phone || f.phone === "+977") { toast.error("Please enter your phone number"); return; }
    setSubmitting(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("listings").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: f.title, brand: f.brand, model: f.model,
        year: Number(f.year), condition: f.condition as any,
        fuel_type: f.fuel_type as any, bike_type: f.bike_type as any,
        price: Number(f.price), mileage: Number(f.mileage),
        colour: f.colour, district: f.district, description: f.description,
        phone: f.phone, whatsapp: f.whatsapp || f.phone,
        images: urls, status: "pending",
        // Bike History fields
        num_owners: f.num_owners,
        accident_history: f.accident_history,
        accident_details: f.accident_history ? f.accident_details : null,
        service_history: f.service_history,
        last_service_date: f.service_history && f.last_service_date ? f.last_service_date : null,
        registration_expiry: f.registration_expiry || null,
        insurance_valid: f.insurance_valid,
        original_parts: f.original_parts,
        modifications: !f.original_parts ? f.modifications : null,
        // Documents and Paperwork fields
        has_bluebook: f.has_bluebook,
        bluebook_name_match: f.has_bluebook ? f.bluebook_name_match : false,
        has_insurance: f.has_insurance,
        has_tax_clearance: f.has_tax_clearance,
        has_registration: f.has_registration,
        document_notes: f.document_notes || null,
      });
      if (error) throw error;
      toast.success("Listing submitted! It'll go live after admin review.");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message || "Failed to submit listing");
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  // Calculate quality score based on current form data
  const qualityScore = useMemo(() => {
    const mockListing = {
      images: previews,
      description: f.description,
      price: Number(f.price) || 0,
      brand: f.brand,
      num_owners: f.num_owners,
      accident_history: f.accident_history,
      service_history: f.service_history,
      last_service_date: f.last_service_date,
      registration_expiry: f.registration_expiry,
      has_bluebook: f.has_bluebook,
      has_insurance: f.has_insurance,
      has_tax_clearance: f.has_tax_clearance,
      has_registration: f.has_registration,
      bluebook_name_match: f.bluebook_name_match,
      phone: f.phone,
      whatsapp: f.whatsapp,
      district: f.district,
    };
    return calculateListingScore(mockListing);
  }, [f, previews]);

  const gradeColor = {
    A: "text-green-600 border-green-600 bg-green-50",
    B: "text-blue-600 border-blue-600 bg-blue-50",
    C: "text-orange-600 border-orange-600 bg-orange-50",
    D: "text-red-600 border-red-600 bg-red-50",
  }[qualityScore.grade];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold">Sell your bike</h1>
          <p className="text-muted-foreground mt-1">Free to list · Reach buyers across Nepal · No commission</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main form */}
          <div className="flex-1 max-w-2xl">
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
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
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
                <h2 className="font-semibold text-lg">Bike History</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Transparency builds trust with buyers.</p>
              </div>

              <Field label="Number of Owners">
                <Select 
                  value={String(f.num_owners)} 
                  onValueChange={v => setF(p => ({ ...p, num_owners: Number(v) }))}
                >
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (First owner)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5 or more</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Has this bike been in an accident?</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Being honest helps build buyer trust</p>
                  </div>
                  <Switch
                    checked={f.accident_history}
                    onCheckedChange={v => setF(p => ({ ...p, accident_history: v, accident_details: v ? p.accident_details : "" }))}
                  />
                </div>
                {f.accident_history && (
                  <div>
                    <Label className="text-sm font-medium">Please describe the accident and any repairs done</Label>
                    <Textarea
                      value={f.accident_details}
                      onChange={e => setF(p => ({ ...p, accident_details: e.target.value.slice(0, 300) }))}
                      placeholder="Describe what happened and what was repaired"
                      rows={3}
                      maxLength={300}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{f.accident_details.length}/300 characters</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Does this bike have a service history?</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Regular servicing increases resale value</p>
                  </div>
                  <Switch
                    checked={f.service_history}
                    onCheckedChange={v => setF(p => ({ ...p, service_history: v, last_service_date: v ? p.last_service_date : "" }))}
                  />
                </div>
                {f.service_history && (
                  <Field label="Date of last service">
                    <Input
                      type="date"
                      value={f.last_service_date}
                      onChange={e => setF(p => ({ ...p, last_service_date: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                      className="h-11"
                    />
                  </Field>
                )}
              </div>

              <Field label="Registration expiry date">
                <Input
                  type="date"
                  value={f.registration_expiry}
                  onChange={e => setF(p => ({ ...p, registration_expiry: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-11"
                />
              </Field>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Is the bike currently insured?</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Active insurance can be transferred to new owner</p>
                </div>
                <Switch
                  checked={f.insurance_valid}
                  onCheckedChange={v => setF(p => ({ ...p, insurance_valid: v }))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">All parts are original</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Stock parts or aftermarket modifications</p>
                  </div>
                  <Switch
                    checked={f.original_parts}
                    onCheckedChange={v => setF(p => ({ ...p, original_parts: v, modifications: v ? "" : p.modifications }))}
                  />
                </div>
                {!f.original_parts && (
                  <div>
                    <Label className="text-sm font-medium">Please describe any modifications or non-original parts</Label>
                    <Textarea
                      value={f.modifications}
                      onChange={e => setF(p => ({ ...p, modifications: e.target.value.slice(0, 300) }))}
                      placeholder="e.g. Aftermarket exhaust, custom seat, LED lights..."
                      rows={3}
                      maxLength={300}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{f.modifications.length}/300 characters</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={back}>Back</Button>
                <Button onClick={next} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Documents and Paperwork Section */}
              <div className="pt-6 mt-6 border-t">
                <div className="mb-5">
                  <h3 className="font-semibold text-base">Documents and Paperwork</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Help buyers understand the paperwork status</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">I have the bluebook for this bike</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Original vehicle ownership document</p>
                      </div>
                      <Switch
                        checked={f.has_bluebook}
                        onCheckedChange={v => setF(p => ({ ...p, has_bluebook: v, bluebook_name_match: v ? p.bluebook_name_match : false }))}
                      />
                    </div>
                    {f.has_bluebook && (
                      <div className="ml-4 pl-4 border-l-2 border-muted">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Bluebook is in my name</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">Ownership transfer will be straightforward</p>
                          </div>
                          <Switch
                            checked={f.bluebook_name_match}
                            onCheckedChange={v => setF(p => ({ ...p, bluebook_name_match: v }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Current insurance document available</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Valid insurance certificate</p>
                    </div>
                    <Switch
                      checked={f.has_insurance}
                      onCheckedChange={v => setF(p => ({ ...p, has_insurance: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Tax clearance certificate available</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Up-to-date vehicle tax clearance</p>
                    </div>
                    <Switch
                      checked={f.has_tax_clearance}
                      onCheckedChange={v => setF(p => ({ ...p, has_tax_clearance: v }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Vehicle registration certificate available</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Official registration document</p>
                    </div>
                    <Switch
                      checked={f.has_registration}
                      onCheckedChange={v => setF(p => ({ ...p, has_registration: v }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Additional notes about documents</Label>
                    <Textarea
                      value={f.document_notes}
                      onChange={e => setF(p => ({ ...p, document_notes: e.target.value.slice(0, 200) }))}
                      placeholder="Any additional information about the paperwork, for example bluebook is in previous owner name but transfer is arranged"
                      rows={3}
                      maxLength={200}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{f.document_notes.length}/200 characters</p>
                  </div>
                </div>

                {/* Non-blocking reminder if no document fields filled */}
                {!f.has_bluebook && !f.has_insurance && !f.has_tax_clearance && !f.has_registration && !f.document_notes && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">
                          Listings with complete document information get 3× more enquiries
                        </p>
                        <p className="text-sm text-yellow-800 mt-1">
                          Consider filling in the Documents section above to increase buyer confidence.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-lg">Upload photos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Listings with 4+ photos get 3× more views. First photo is the cover.</p>
              </div>

              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
                files.length >= 8 ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"
              }`}>
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="font-semibold text-base">Tap to upload photos</span>
                <span className="text-sm text-muted-foreground mt-1">JPG, PNG · up to 5MB each · max 8 photos</span>
                <span className="text-xs text-muted-foreground mt-2">{files.length}/8 uploaded</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={files.length >= 8}
                  onChange={e => onFiles(e.target.files)}
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square group">
                      <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
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

          {step === 5 && (
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
      {/* End of Main form div */}

      {/* Quality Score Sidebar - Desktop */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6">
          <Card className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Listing Quality Score</h3>
              <div className={`w-32 h-32 rounded-full border-8 ${gradeColor} mx-auto flex flex-col items-center justify-center`}>
                <div className="text-4xl font-bold">{qualityScore.score}</div>
                <div className="text-lg font-semibold">Grade {qualityScore.grade}</div>
              </div>
            </div>

            {/* Breakdown Checklist */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold">Score Breakdown</h4>
              {qualityScore.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.points}/{item.maxPoints} points
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {qualityScore.tips.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <h4 className="text-sm font-semibold">Improvement Tips</h4>
                </div>
                {qualityScore.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </aside>
    </div>
    {/* End of flex container div */}
  </div>
  {/* End of container div */}

  {/* Quality Score Banner - Mobile */}
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-50">
    <div className="flex items-center gap-4">
      <div className={`w-16 h-16 rounded-full border-4 ${gradeColor} flex flex-col items-center justify-center flex-shrink-0`}>
        <div className="text-xl font-bold">{qualityScore.score}</div>
        <div className="text-xs font-semibold">Grade {qualityScore.grade}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Quality Score</p>
        <p className="text-xs text-muted-foreground truncate">
          {qualityScore.tips.length > 0 ? qualityScore.tips[0] : "Great! All criteria met."}
        </p>
      </div>
      </div>
    </div>
  </div>
  );
}function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
