import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/nepal";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — MyRideNepal" }] }),
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/dashboard" } as any });
  }, [user, loading]);

  const { data: listings, refetch } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings").select("*").eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading || !user) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <Button onClick={() => navigate({ to: "/sell" })} className="gap-2">
          <Plus className="w-4 h-4" /> New listing
        </Button>
      </div>

      {listings?.length ? (
        <div className="grid gap-3">
          {listings.map(l => (
            <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start">
              <Link to="/listings/$id" params={{ id: l.id }} className="w-full sm:w-32 aspect-[4/3] rounded-md overflow-hidden bg-muted flex-shrink-0">
                {l.images?.[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-primary">{l.title}</Link>
                  <Badge variant={l.status === "active" ? "default" : l.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                    {l.status}
                  </Badge>
                </div>
                <p className="text-primary font-bold mt-1">{formatNPR(l.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">{l.views} views · {new Date(l.created_at).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(l.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground mb-4">You haven't posted any listings yet.</p>
          <Button onClick={() => navigate({ to: "/sell" })}>Post your first listing</Button>
        </Card>
      )}
    </div>
  );
}
