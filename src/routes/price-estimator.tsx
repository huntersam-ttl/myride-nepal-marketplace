import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNPR, CONDITIONS } from "@/lib/nepal";
import { TrendingDown, Calculator } from "lucide-react";

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
const MILEAGE_PENALTY = 0.6 / 100000; // up to 60% off at 100k km

function PriceEstimatorPage() {
  const { data: estimates } = useQuery({
    queryKey: ["price-estimates"],
    queryFn: async () => (await supabase.from("price_estimates").select("*").order("brand")).data ?? [],
  });

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear() - 2));
  const [condition, setCondition] = useState("good");
  const [mileage, setMileage] = useState("20000");

  const brands = useMemo(() => Array.from(new Set((estimates ?? []).map(e => e.brand))).sort(), [estimates]);
  const models = useMemo(() => (estimates ?? []).filter(e => e.brand === brand), [estimates, brand]);
  const base = useMemo(() => models.find(m => m.model === model)?.base_price, [models, model]);

  const calc = useMemo(() => {
    if (!base) return null;
    const yrs = Math.max(0, new Date().getFullYear() - Number(year));
    const ageFactor = Math.pow(0.88, yrs); // 12% depreciation/yr
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
      yrs, ageFactor, condFactor, mileagePenalty,
    };
  }, [base, year, condition, mileage]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-3"><Calculator className="w-7 h-7" /></div>
        <h1 className="text-3xl md:text-4xl font-bold">Price estimator</h1>
        <p className="text-muted-foreground mt-2">Find out what your bike is worth in today's Nepal market.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div>
            <Label>Brand</Label>
            <Select value={brand} onValueChange={(v) => { setBrand(v); setModel(""); }}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel} disabled={!brand}>
              <SelectTrigger><SelectValue placeholder={brand ? "Select model" : "Pick a brand first"} /></SelectTrigger>
              <SelectContent>{models.map(m => <SelectItem key={m.id} value={m.model}>{m.model}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Year of purchase</Label>
              <Input type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" max={new Date().getFullYear()} />
            </div>
            <div>
              <Label>Mileage (km)</Label>
              <Input type="number" value={mileage} onChange={e => setMileage(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6">
          {!calc ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-10">
              <TrendingDown className="w-10 h-10 mb-3 opacity-50" />
              <p>Select your bike's brand and model to see the estimate.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Estimated resale value</p>
              <p className="text-4xl font-bold text-primary mt-1">{formatNPR(calc.final)}</p>
              <p className="text-sm text-muted-foreground mt-1">Range: {formatNPR(calc.lowRange)} – {formatNPR(calc.highRange)}</p>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Base showroom price" value={formatNPR(calc.base)} />
                <Row label={`Age depreciation (${calc.yrs} yrs)`} value={`-${Math.round((1 - calc.ageFactor) * 100)}%`} sub={formatNPR(calc.afterAge)} />
                <Row label={`Condition (${condition})`} value={`×${calc.condFactor.toFixed(2)}`} sub={formatNPR(calc.afterCondition)} />
                <Row label={`Mileage penalty`} value={`-${Math.round(calc.mileagePenalty * 100)}%`} sub={formatNPR(calc.final)} />
              </div>
              <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
                Estimates are based on average Nepal market trends. Actual selling price may vary based on documentation, accessories, and demand.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <div className="font-medium">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}
