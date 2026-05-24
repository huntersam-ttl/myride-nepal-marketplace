import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ArrowRight, Calendar, User, Newspaper } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/blog/")({
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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      console.log('[Blog] Fetching posts from Supabase...');
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("[Blog] Failed to fetch posts:", error);
        throw error;
      }
      console.log('[Blog] Fetched from Supabase:', data?.length, 'posts');
      return data ?? [];
    },
    staleTime: 0, // Always refetch on mount
  });
  
  // Debug logging
  console.log('[Blog] Raw data from query:', data?.length, 'posts');
  console.log('[Blog] First post:', data?.[0]?.title, 'slug:', data?.[0]?.slug);
  
  // Filter out posts with invalid slugs (URLs, special characters)
  const validPosts = (data ?? []).filter(p => {
    if (!p.slug) return false;
    // Slug should not contain :// (URLs) or special URL characters
    if (p.slug.includes('://') || p.slug.includes('?') || p.slug.includes('&')) {
      console.warn(`[Blog] Skipping post "${p.title}" - invalid slug: ${p.slug}`);
      return false;
    }
    return true;
  });
  
  console.log('[Blog] Valid posts after filtering:', validPosts.length);
  console.log('[Blog] Valid posts:', validPosts.map(p => ({ title: p.title, slug: p.slug })));
  
  const posts = validPosts.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt ?? "").toLowerCase().includes(q.toLowerCase()));
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-10 max-w-5xl text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">MyRideNepal Journal</h1>
          <p className="text-muted-foreground mt-2">Reviews, tips, and stories from Nepal's bike community.</p>
          <div className="relative mt-5 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-11 bg-background"
              placeholder="Search articles…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isLoading ? (
          <div className="space-y-6">
            {/* Featured skeleton */}
            <div className="rounded-2xl bg-card border overflow-hidden animate-pulse">
              <div className="aspect-[16/7] bg-muted" />
              <div className="p-6 space-y-3">
                <div className="h-3 bg-muted rounded w-20" />
                <div className="h-7 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
            {/* Grid skeletons */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-card border overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-muted rounded w-16" />
                    <div className="h-5 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <Card className="p-16 text-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-destructive opacity-60" />
            </div>
            <h2 className="font-semibold text-lg mb-1 text-destructive">Failed to load articles</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              {error instanceof Error ? error.message : "An error occurred while fetching blog posts."}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-primary hover:underline"
            >
              Reload page
            </button>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-16 text-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-muted-foreground opacity-40" />
            </div>
            <h2 className="font-semibold text-lg mb-1">
              {q ? "No articles found" : data && data.length > 0 ? "No valid articles" : "Coming Soon"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {q 
                ? "Try a different search term." 
                : data && data.length > 0
                ? "Articles exist but have invalid slugs. Please contact admin to fix article slugs."
                : "We are working on articles about bikes, buying guides, and Nepal's two-wheeler market. Check back soon."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Featured post — full-width hero */}
            {featured && !q && featured.slug && (
              <Link
                to="/blog/$slug"
                params={{ slug: featured.slug }}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <Card className="overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-200">
                  <div className="grid md:grid-cols-2">
                    <div className="relative overflow-hidden aspect-[16/9] md:aspect-auto">
                      {featured.cover_image ? (
                        <img
                          src={featured.cover_image}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{featured.category}</Badge>
                        <span className="text-xs text-muted-foreground">Featured</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{featured.author}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(featured.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Read article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Rest of posts grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(q ? posts : rest).filter(p => p.slug).map(p => (
                  <Link
                    key={p.id}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  >
                    <Card className="overflow-hidden h-full group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-200">
                      <div className="relative overflow-hidden aspect-[16/9] bg-muted">
                        {p.cover_image ? (
                          <img
                            src={p.cover_image}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-secondary/20 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{p.category}</Badge>
                        <h2 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {p.title}
                        </h2>
                        {p.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
