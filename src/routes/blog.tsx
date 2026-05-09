import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/blog")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Bike News, Reviews & Guides — MyRideNepal" },
      { name: "description", content: "Latest bike reviews, riding tips, and motorcycle news from Nepal." },
    ],
  }),
});

function BlogIndex() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false })).data ?? [],
  });
  const posts = (data ?? []).filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">MyRideNepal Journal</h1>
        <p className="text-muted-foreground mt-2">Reviews, tips, and stories from Nepal's bike community.</p>
        <Input className="mt-4 max-w-md mx-auto" placeholder="Search articles…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading…</div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No articles published yet.</Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(p => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }}>
              <Card className="overflow-hidden h-full hover:shadow-[var(--shadow-elegant)] transition-shadow">
                {p.cover_image && <img src={p.cover_image} alt="" className="w-full aspect-[16/9] object-cover" loading="lazy" />}
                <div className="p-5">
                  <Badge variant="secondary" className="mb-2">{p.category}</Badge>
                  <h2 className="font-semibold text-lg line-clamp-2 hover:text-primary">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-3">{p.author} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
