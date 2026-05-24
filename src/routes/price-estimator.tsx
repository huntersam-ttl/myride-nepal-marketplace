import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatNPR, CONDITIONS } from "@/lib/nepal";
import { getBrandNames, getModelsForBrand, getBasePrice } from "@/data/vehicleBrands";
import { Calculator, ArrowRight, Info, ChevronRight, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/price-estimator")({
  component: PriceEstimatorPage,
  head: () => ({
    meta: [
      { title: "Bike Price Estimator — MyRideNepal" },
      { name: "description", content: "Estimate your bike or scooter resale value in Nepal with our free price calculator." },
    ],
  }),
});

const CONDITION_FACTOR: Record<string, number> = {
  new: 1.0, excellent: 0.92, good: 0.82, fair: 0.7, poor: 0.55,
};
const CONDITION_LABEL: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-green-500" },
  excellent: { label: "Excellent", color: "bg-emerald-500" },
  good: { label: "Good", color: "bg-blue-500" },
  fair: { label: "Fair", color: "bg-yellow-500" },
  poor: { label: "Poor", color: "bg-red-500" },
};
const MILEAGE_PENALTY = 0.6 / 100000;

function PriceEstimatorPage() {
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [model, setModel] = useState<string | undefined>(undefined);
  const [year, setYear] = useState(String(new Date().getFullYear() - 2));
  const [condition, setCondition] = useState("good");
  const [mileage, setMileage] = useState("20000");

  // Get brands and models from static data
  const brands = useMemo(() => getBrandNames(), []);
  const models = useMemo(() => {
    if (!brand) return [];
    return getModelsForBrand(brand);
  }, [brand]);
  
  const base = useMemo(() => {
    if (!brand || !model) return null;
    return getBasePrice(brand, model);
  }, [brand, model]);

  const calc = useMemo(() => {
    if (!base) return null;
    const yrs = Math.max(0, new Date().getFullYear() - Number(year));
    const ageFactor = Math.pow(0.88, yrs);
    const condFactor = CONDITION_FACTOR[condition] ?? 0.8;
    const mileagePenalty = Math.min(0.5, Number(mileage) * MILEAGE_PENALTY);
    const final = Math.round(Number(base) * ageFactor * condFactor * (1 - mileagePenalty));
    return {
      base: Number(base),
      afterAge: Math.round(Number(base) * ageFactor),
      afterCondition: Math.round(Number(base) * ageFactor * condFactor),
      final,
      lowRange: Math.round(final * 0.9),
      highRange: Math.round(final * 1.1),
      retentionPct: Math.round((final / Number(base)) * 100),
      yrs, ageFactor, condFactor, mileagePenalty,
    };
  }, [base, year, condition, mileage]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page header — premium navy band, white text, orange-on-white calculator badge */}
      <div className="relative overflow-hidden text-white" style={{ background: "var(--gradient-hero)" }}>
        {/* Soft radial accent — pure CSS, no image */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.18), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-12 md:py-14 max-w-5xl text-center relative mrn-fade-in-up">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Calculator className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Bike Price Estimator</h1>
          <p className="text-white/70 mt-2.5 max-w-md mx-auto leading-relaxed">
            Find out what your bike is worth in today's Nepal market.
          </p>
          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { icon: Sparkles, label: "Free estimate" },
              { icon: ShieldCheck, label: "Nepal market guide" },
              { icon: CheckCircle2, label: "No sign-up needed" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-3 py-1.5 text-xs text-white/80"
              >
                <chip.icon className="w-3.5 h-3.5 text-white/60" />
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

          {/* ── Form card ── */}
          <Card className="p-6 sm:p-7 rounded-2xl shadow-[var(--shadow-card)] border-border/60">
            <div className="mb-6">
              <h2 className="font-bold text-lg">Tell us about your bike</h2>
              <p className="text-sm text-muted-foreground mt-1">A few details — we'll estimate the resale value as you fill it in.</p>
            </div>

            <div className="space-y-5">
              {/* Brand */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Brand</Label>
                <Select
                  value={brand ?? "_none"}
                  onValueChange={(v) => {
                    if (v !== "_none") {
                      setBrand(v);
                      setModel(undefined);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="_none">Select brand</SelectItem>
                    {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Model</Label>
                <Select
                  value={model ?? "_none"}
                  onValueChange={(v) => { if (v !== "_none") setModel(v); }}
                  disabled={!brand}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60">
                    <SelectValue placeholder={brand ? "Select model" : "Pick a brand first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="_none">Select model</SelectItem>
                    {models.map(m => <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Year + Mileage row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Year of purchase</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    min="2000"
                    max={new Date().getFullYear()}
                    className="h-12 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Mileage (km)</Label>
                  <Input
                    type="number"
                    value={mileage}
                    onChange={e => setMileage(e.target.value)}
                    min="0"
                    className="h-12 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-12 rounded-xl border-border/70 focus-visible:ring-2 focus-visible:ring-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Condition guide — polished pills with active scale */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {Object.entries(CONDITION_LABEL).map(([key, { label, color }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCondition(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        condition === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                      aria-pressed={condition === key}
                    >
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-7 flex gap-2 p-3.5 rounded-xl bg-muted/60 text-xs text-muted-foreground leading-relaxed">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Estimates based on average Nepal market trends. Actual price may vary with documents, accessories, and demand.</span>
            </div>
          </Card>

          {/* ── Result card ── */}
          <div className="space-y-4 lg:sticky lg:top-6">
            {!calc ? (
              <Card className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] border-border/60">
                {/* Subtle navy band with orange accent — sets the premium tone */}
                <div className="relative h-20 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 50%, rgba(232,75,26,0.45), transparent 55%), radial-gradient(circle at 80% 50%, rgba(232,75,26,0.2), transparent 50%)",
                    }}
                  />
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 ring-4 ring-card">
                      <Calculator className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-10 text-center">
                  <p className="font-bold text-lg text-foreground">Ready to estimate</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    Pick your brand and model to start. The estimate updates as you fill in each field.
                  </p>

                  {/* Step checklist — polished, becomes filled-in as user progresses */}
                  <div className="mt-6 space-y-2.5 text-left">
                    {[
                      { label: "Brand", done: !!brand },
                      { label: "Model", done: !!model },
                      { label: "Year & mileage", done: !!year && !!mileage },
                      { label: "Condition", done: !!condition },
                    ].map((step, i) => (
                      <div
                        key={step.label}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                          step.done
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/60 bg-muted/40"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                        </span>
                        <span className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                  {/* Main estimate — premium navy panel with orange value */}
                  <Card className="overflow-hidden shadow-[var(--shadow-elegant)] border-0 mrn-fade-in-up">
                    {/* Dark hero band carrying the headline number */}
                    <div className="relative p-6 sm:p-7 text-white overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.18), transparent 50%)",
                        }}
                      />
                      <div className="relative flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wide mb-1.5">Estimated resale value</p>
                          <p className="text-4xl md:text-5xl font-bold text-primary leading-tight tabular-nums">{formatNPR(calc.final)}</p>
                          <p className="text-sm text-white/70 mt-1.5">
                            Range: {formatNPR(calc.lowRange)} – {formatNPR(calc.highRange)}
                          </p>
                        </div>
                        <Badge className="text-sm font-bold px-3 py-1.5 tabular-nums bg-white/15 text-white border-white/20 hover:bg-white/15">
                          {calc.retentionPct}% retained
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Retention bar */}
                      <div className="space-y-1.5 mb-5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Value retained</span>
                          <span>{calc.retentionPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${calc.retentionPct >= 60 ? "bg-green-500" : calc.retentionPct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${calc.retentionPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-0 border rounded-lg overflow-hidden">
                        <BreakdownRow
                          label="Showroom price"
                          badge={null}
                          value={formatNPR(calc.base)}
                          impact={null}
                          isFirst
                        />
                        <BreakdownRow
                          label={`Age depreciation`}
                          badge={`${calc.yrs} yr${calc.yrs !== 1 ? "s" : ""}`}
                          value={formatNPR(calc.afterAge)}
                          impact={-Math.round((1 - calc.ageFactor) * 100)}
                        />
                        <BreakdownRow
                          label="Condition factor"
                          badge={condition}
                          value={formatNPR(calc.afterCondition)}
                          impact={-Math.round((1 - calc.condFactor) * 100)}
                        />
                        <BreakdownRow
                          label="Mileage penalty"
                          badge={`${Number(mileage).toLocaleString()} km`}
                          value={formatNPR(calc.final)}
                          impact={-Math.round(calc.mileagePenalty * 100)}
                          isFinal
                        />
                      </div>
                    </div>
                  </Card>

                  {/* CTAs */}
                  <Card className="p-5 rounded-2xl shadow-[var(--shadow-card)] border-border/60">
                    <p className="text-sm font-semibold mb-3">Ready to sell?</p>
                    <div className="space-y-2.5">
                      <Button asChild className="w-full gap-2 h-11 transition-all duration-200 active:scale-[0.98]">
                        <Link to="/sell">
                          List your {brand} for free <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full gap-2 h-11 transition-all duration-200 active:scale-[0.98]">
                        <Link to="/browse" search={{ brand } as any}>
                          Browse {brand} listings <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>

                  {/* Disclaimer card */}
                  <Card className="p-4 rounded-2xl border-border/60 bg-muted/40 shadow-none">
                    <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary/70" />
                      <span>
                        This is a guide estimate. Final price depends on documents, condition, demand, and negotiation.
                      </span>
                    </div>
                  </Card>
                </div>
              )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 border-t pt-10">
          <h2 className="text-xl font-bold mb-6 text-center">How the estimate works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                step: "1",
                title: "Base price",
                desc: "We start with the official showroom price for the selected brand and model.",
                color: "bg-blue-500/10 text-blue-600",
              },
              {
                step: "2",
                title: "Age & condition",
                desc: "12% annual depreciation is applied, then adjusted for real-world condition and mileage.",
                color: "bg-orange-500/10 text-orange-600",
              },
              {
                step: "3",
                title: "Market range",
                desc: "A ±10% range reflects real buyer-seller negotiation typical in the Nepal market.",
                color: "bg-green-500/10 text-green-600",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-card rounded-2xl border border-border/60 p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mb-3 ${item.color}`}>
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  badge,
  value,
  impact,
  isFirst,
  isFinal,
}: {
  label: string;
  badge: string | null;
  value: string;
  impact: number | null;
  isFirst?: boolean;
  isFinal?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-3.5 py-3 text-sm ${!isFirst ? "border-t" : ""} ${isFinal ? "bg-primary/5 font-semibold" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`truncate ${isFinal ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
        {badge && (
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground capitalize">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {impact !== null && impact < 0 && (
          <span className={`text-xs font-medium tabular-nums ${Math.abs(impact) > 25 ? "text-red-500" : Math.abs(impact) > 10 ? "text-yellow-600" : "text-muted-foreground"}`}>
            -{Math.abs(impact)}%
          </span>
        )}
        <span className={`tabular-nums ${isFinal ? "text-primary" : ""}`}>{value}</span>
      </div>
    </div>
  );
}
