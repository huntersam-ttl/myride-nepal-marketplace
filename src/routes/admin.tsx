import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-saved";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, ShieldCheck, Trash2, Plus, Flag, AlertTriangle } from "lucide-react";
import { formatNPR } from "@/lib/nepal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — MyRideNepal" }] }),
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/admin" } as any });
  }, [user, loading]);

  if (loading || roleLoading) return <div className="container mx-auto py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <h1 className="text-2xl font-bold">Admin only</h1>
        <p className="text-muted-foreground mt-2">You don't have admin access.</p>
        <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin panel</h1>
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-6"><AdminListings /></TabsContent>
        <TabsContent value="reports" className="mt-6"><AdminReports /></TabsContent>
        <TabsContent value="dealers" className="mt-6"><AdminDealers /></TabsContent>
        <TabsContent value="blog" className="mt-6"><AdminBlog /></TabsContent>
      </Tabs>
    </div>
  );
}

function AdminListings() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "rejected" | "sold">("all");
  
  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const filteredData = data?.filter(l => statusFilter === "all" || l.status === statusFilter);

  const setStatus = async (id: string, status: "active" | "rejected") => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Listing ${status === "active" ? "approved" : "rejected"}`);
    refetch();
  };
  const toggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase.from("listings").update({ featured: !featured }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(featured ? "Removed from featured" : "Marked as featured");
    refetch();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    refetch();
  };

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
      <p className="font-semibold text-destructive mb-1">Failed to load listings</p>
      <p className="text-sm text-muted-foreground mb-3">{(error as Error).message}</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
    </div>
  );

  if (!data?.length) return (
    <div className="rounded-xl border p-12 text-center text-muted-foreground">
      No listings found.
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Status filter buttons */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(["all", "pending", "active", "rejected", "sold"] as const).map(status => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
            {status !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {data.filter(l => l.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Status summary */}
      <div className="flex gap-3 flex-wrap mb-4">
        {(["pending", "active", "rejected", "sold"] as const).map(s => {
          const count = data.filter(l => l.status === s).length;
          return count > 0 ? (
            <Badge 
              key={s} 
              variant={s === "active" ? "default" : s === "pending" ? "secondary" : s === "sold" ? "outline" : "destructive"} 
              className="capitalize gap-1"
            >
              {s}: {count}
            </Badge>
          ) : null;
        })}
      </div>

      {filteredData && filteredData.length > 0 ? (
        filteredData.map((l) => (
        <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4">
          {l.images?.[0]
            ? <img src={l.images[0]} alt="" className="w-full sm:w-28 aspect-[4/3] object-cover rounded-md flex-shrink-0" />
            : <div className="w-full sm:w-28 aspect-[4/3] rounded-md bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">No photo</div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-primary">{l.title}</Link>
              <Badge 
                variant={
                  l.status === "active" ? "default" : 
                  l.status === "pending" ? "secondary" : 
                  l.status === "sold" ? "outline" :
                  "destructive"
                } 
                className="capitalize"
              >
                {l.status}
              </Badge>
              {l.featured && <Badge variant="outline" className="text-primary border-primary">Featured</Badge>}
              {(l as any).report_count >= 3 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Multiple Reports ({(l as any).report_count})
                </Badge>
              )}
            </div>
            <p className="text-sm text-primary font-bold mt-0.5">{formatNPR(l.price)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{l.district} · {l.brand} {l.model} · {new Date(l.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-start">
            {l.status !== "active" && l.status !== "sold" && (
              <Button size="sm" onClick={() => setStatus(l.id, "active")} className="gap-1">
                <Check className="w-3 h-3" /> Approve
              </Button>
            )}
            {l.status !== "rejected" && l.status !== "sold" && (
              <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "rejected")} className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                <X className="w-3 h-3" /> Reject
              </Button>
            )}
            {l.status !== "sold" && (
              <Button size="sm" variant="ghost" onClick={() => toggleFeatured(l.id, l.featured)} className="text-xs">
                {l.featured ? "Unfeature" : "Feature"}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => remove(l.id)} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
        ))
      ) : (
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          No listings found with status: {statusFilter}
        </div>
      )}
    </div>
  );
}

function AdminDealers() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-dealers"],
    queryFn: async () => (await supabase.from("dealer_profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const toggleVerified = async (id: string, v: boolean) => {
    await supabase.from("dealer_profiles").update({ verified: !v }).eq("id", id);
    toast.success(!v ? "Verified" : "Unverified");
    refetch();
  };
  return (
    <div className="space-y-3">
      {data?.map((d) => (
        <Card key={d.id} className="p-4 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/dealers/$slug" params={{ slug: d.slug }} className="font-semibold hover:text-primary">{d.business_name}</Link>
              {d.verified && <Badge className="gap-1" variant="outline"><ShieldCheck className="w-3 h-3" /> Verified</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{d.location}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toggleVerified(d.id, d.verified)}>
            {d.verified ? "Unverify" : "Verify"}
          </Button>
        </Card>
      ))}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function AdminBlog() {
  const { user } = useAuth();
  const { data, refetch } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const blank = { title: "", slug: "", excerpt: "", content: "", category: "News", cover_image: "", author: user?.email ?? "Admin", published: true };
  const [f, setF] = useState<any>(blank);

  const openNew = () => { setEditing(null); setF(blank); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setF(p); setOpen(true); };

  const save = async () => {
    const slug = f.slug || slugify(f.title);
    if (!f.title || !f.content) return toast.error("Title and content required");
    const payload = { ...f, slug };
    const { error } = editing
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    refetch();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    refetch();
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New post</Button>
      </div>
      <div className="space-y-3">
        {data?.map((p) => (
          <Card key={p.id} className="p-4 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{p.title}</span>
                <Badge variant="secondary">{p.category}</Badge>
                {!p.published && <Badge variant="outline">Draft</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">/blog/{p.slug} · {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug (auto if blank)</Label>
                <Input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} placeholder={slugify(f.title)} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Cover image URL</Label>
              <Input value={f.cover_image ?? ""} onChange={e => setF({ ...f, cover_image: e.target.value })} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea rows={2} value={f.excerpt ?? ""} onChange={e => setF({ ...f, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Content (markdown supported)</Label>
              <Textarea rows={10} value={f.content} onChange={e => setF({ ...f, content: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.published} onChange={e => setF({ ...f, published: e.target.checked })} /> Published
            </label>
            <Button onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AdminReports() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "reviewed" | "dismissed">("pending");
  
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-reports", statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listing_reports")
        .select(`
          *,
          listing:listings(id, title, status),
          reporter:profiles!listing_reports_reporter_id_fkey(name)
        `)
        .eq("status", statusFilter)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Get counts for all statuses
  const { data: counts } = useQuery({
    queryKey: ["admin-reports-counts"],
    queryFn: async () => {
      const [pending, reviewed, dismissed] = await Promise.all([
        supabase.from("listing_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("listing_reports").select("id", { count: "exact", head: true }).eq("status", "reviewed"),
        supabase.from("listing_reports").select("id", { count: "exact", head: true }).eq("status", "dismissed"),
      ]);
      return {
        pending: pending.count ?? 0,
        reviewed: reviewed.count ?? 0,
        dismissed: dismissed.count ?? 0,
      };
    },
  });

  const updateStatus = async (reportId: string, newStatus: "reviewed" | "dismissed") => {
    const { error } = await supabase
      .from("listing_reports")
      .update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq("id", reportId);
    
    if (error) {
      toast.error("Failed to update report");
      return;
    }
    
    toast.success(`Report marked as ${newStatus}`);
    refetch();
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatReason = (reason: string) => {
    return reason.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Count badges */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="destructive" className="text-sm py-1.5 px-3">
          Pending: {counts?.pending ?? 0}
        </Badge>
        <Badge variant="default" className="text-sm py-1.5 px-3 bg-green-600">
          Reviewed: {counts?.reviewed ?? 0}
        </Badge>
        <Badge variant="secondary" className="text-sm py-1.5 px-3">
          Dismissed: {counts?.dismissed ?? 0}
        </Badge>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "reviewed", "dismissed"] as const).map(status => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Reports list */}
      {data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((report: any) => (
            <Card key={report.id} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {report.listing ? (
                      <Link 
                        to="/listings/$id" 
                        params={{ id: report.listing.id }} 
                        className="font-semibold hover:text-primary"
                      >
                        {report.listing.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic">Listing deleted</span>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="destructive" className="capitalize">
                        {formatReason(report.reason)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(report.created_at)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {report.reporter?.name || "Anonymous"}
                      </span>
                    </div>
                  </div>
                  {statusFilter === "pending" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(report.id, "reviewed")}
                        className="gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark Reviewed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => updateStatus(report.id, "dismissed")}
                        className="gap-1 text-muted-foreground"
                      >
                        <X className="w-3 h-3" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
                {report.details && (
                  <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                    {report.details}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          No {statusFilter} reports found.
        </div>
      )}
    </div>
  );
}
