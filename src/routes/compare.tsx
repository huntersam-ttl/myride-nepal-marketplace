import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/nepal";
import { X, Plus, GitCompare } from "lucide-react";

interface Search { ids?: string }
export const Route = createFileRoute("/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ids: typeof s.ids === "string" ? s.ids : undefined }),
  component: ComparePage,
  head: () => ({ meta: [{ title: "Compare Bikes — MyRideNepal" }] }),
});

function ComparePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const initial = (search.ids ?? "").split(",").filter(Boolean);
  const [ids, setIds] = useState<string[]>(initial);

  useEffect(() => { navigate({ to: "/compare", search: { ids: ids.join(",") || undefined } as any, replace: true }); }, [ids]);

  const { data: listings } = useQuery({
    queryKey: ["compare", ids],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("listings").select("*").in("id", ids)).data ?? [],
  });

  const remove = (id: string) => setIds(p => p.filter(x => x !== id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-2"><GitCompare className="w-6 h-6" /></div>
        <h1 className="text-3xl font-bold">Compare bikes</h1>
        <p className="text-muted-foreground mt-1">Add up to 3 listings side by side.</p>
      </div>

      {ids.length < 3 && <AddListingSearch onAdd={(id) => !ids.includes(id) && setIds(p => [...p, id])} />}

      {ids.length === 0 ? (
        <Card className="p-12 text-center mt-8">
          <p className="text-muted-foreground mb-4">No bikes selected yet.</p>
          <Button asChild><Link to="/browse">Browse listings</Link></Button>
        </Card>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="w-full min-w-[600px] text-sm">
            <tbody>
              <tr>
                <th className="w-32 text-left p-3"></th>
                {listings?.map(l => (
                  <td key={l.id} className="p-3 align-top">
                    <Card className="p-3 relative">
                      <Button size="icon" variant="ghost" className="absolute top-1 right-1 w-6 h-6" onClick={() => remove(l.id)}><X className="w-3 h-3" /></Button>
                      <Link to="/listings/$id" params={{ id: l.id }}>
                        <img src={l.images?.[0]} alt="" className="aspect-[4/3] w-full object-cover rounded-md mb-2" />
                        <p className="font-semibold line-clamp-1 hover:text-primary">{l.title}</p>
                        <p className="text-primary font-bold">{formatNPR(l.price)}</p>
                      </Link>
                    </Card>
                  </td>
                ))}
              </tr>
              {[
                ["Brand", "brand"], ["Model", "model"], ["Year", "year"],
                ["Mileage (km)", "mileage"], ["Condition", "condition"],
                ["Fuel", "fuel_type"], ["Type", "bike_type"],
                ["Colour", "colour"], ["District", "district"],
              ].map(([label, key]) => (
                <tr key={key} className="border-t">
                  <th className="text-left p-3 text-muted-foreground font-medium">{label}</th>
                  {listings?.map(l => (
                    <td key={l.id} className="p-3 capitalize">{(l as any)[key] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddListingSearch({ onAdd }: { onAdd: (id: string) => void }) {
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["compare-search", q],
    enabled: q.length > 1,
    queryFn: async () => (await supabase.from("listings").select("id,title,price,images").eq("status", "active").ilike("title", `%${q}%`).limit(6)).data ?? [],
  });
  return (
    <Card className="p-4 max-w-xl mx-auto">
      <Input placeholder="Search listings to add (e.g. Pulsar, Activa)…" value={q} onChange={e => setQ(e.target.value)} />
      {data && data.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.map(l => (
            <button key={l.id} onClick={() => { onAdd(l.id); setQ(""); }} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left">
              <img src={l.images?.[0]} alt="" className="w-10 h-10 rounded object-cover" />
              <span className="flex-1 truncate">{l.title}</span>
              <Plus className="w-4 h-4 text-primary" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
