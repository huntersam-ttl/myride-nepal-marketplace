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
import { Loader2, Check, X, ShieldCheck, Trash2, Plus } from "lucide-react";
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
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-6"><AdminListings /></TabsContent>
        <TabsContent value="dealers" className="mt-6"><AdminDealers /></TabsContent>
        <TabsContent value="blog" className="mt-6"><AdminBlog /></TabsContent>
      </Tabs>
    </div>
  );
}

function AdminListings() {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "active" | "rejected", reason?: string) => {
    const updates: any = { status };
    if (status === "rejected" && reason) {
      updates.rejection_reason = reason;
    } else if (status === "active") {
      updates.rejection_reason = null; // Clear rejection reason when approving
    }
    const { error } = await supabase.from("listings").update(updates).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Listing ${status}`);
    setRejectingId(null);
    setRejectReason("");
    refetch();
  };
  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from("listings").update({ featured: !featured }).eq("id", id);
    refetch();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete listing?")) return;
    await supabase.from("listings").delete().eq("id", id);
    toast.success("Deleted");
    refetch();
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin mx-auto" />;
  return (
    <>
      <div className="space-y-3">
        {data?.map((l) => (
          <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4">
            {l.images?.[0] && <img src={l.images[0]} className="w-full sm:w-28 aspect-[4/3] object-cover rounded-md" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-primary">{l.title}</Link>
                <Badge variant={l.status === "active" ? "default" : l.status === "pending" ? "secondary" : "destructive"} className="capitalize">{l.status}</Badge>
                {l.featured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              <p className="text-sm text-primary font-bold">{formatNPR(l.price)}</p>
              <p className="text-xs text-muted-foreground">{l.district} · {new Date(l.created_at).toLocaleDateString()}</p>
              {l.rejection_reason && (
                <p className="text-xs text-destructive mt-1">Reject reason: {l.rejection_reason}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {l.status !== "active" && <Button size="sm" onClick={() => setStatus(l.id, "active")} className="gap-1"><Check className="w-3 h-3" />Approve</Button>}
              {l.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setRejectingId(l.id)} className="gap-1"><X className="w-3 h-3" />Reject</Button>}
              <Button size="sm" variant="ghost" onClick={() => toggleFeatured(l.id, l.featured)}>{l.featured ? "Unfeature" : "Feature"}</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Rejection Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => { if (!open) { setRejectingId(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for rejection (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Images are unclear, missing information..."
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setRejectingId(null); setRejectReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => rejectingId && setStatus(rejectingId, "rejected", rejectReason)}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
