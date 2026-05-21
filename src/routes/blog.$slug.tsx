import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Extended type to support optional video_url (frontend-only, not in DB yet)
type BlogPostWithVideo = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string;
  author: string | null;
  author_id: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  read_time: number | null;
  video_url?: string | null; // Optional YouTube/video URL
};

// Type for related articles (subset of fields)
type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  cover_image: string | null;
  created_at: string;
};

// Extract YouTube video ID from various URL formats
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    
    if (error || !data) throw notFound();
    
    // Fetch related articles from same category
    const { data: relatedData } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, category, cover_image, created_at")
      .eq("published", true)
      .eq("category", data.category)
      .neq("id", data.id)
      .order("created_at", { ascending: false })
      .limit(3);
    
    return { 
      post: data as BlogPostWithVideo, 
      relatedPosts: (relatedData ?? []) as RelatedArticle[]
    };
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground opacity-40" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <p className="text-muted-foreground mb-6">This article doesn't exist or has been removed.</p>
        <Link to="/blog">
          <Button variant="default">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Button>
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-destructive mb-2">Error loading article</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Link to="/blog">
          <Button variant="outline">Back to blog</Button>
        </Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title ?? "Article"} — MyRideNepal Journal` },
      { name: "description", content: loaderData?.post?.excerpt ?? "" },
      { property: "og:image", content: loaderData?.post?.cover_image ?? "" },
    ],
  }),
});

function BlogPostPage() {
  const { post, relatedPosts } = Route.useLoaderData();
  const embedUrl = post.video_url ? getYouTubeEmbedUrl(post.video_url) : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Article Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all articles
            </Button>
          </Link>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
              {post.published_at && (
                <Badge variant="outline" className="text-xs">Featured</Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {post.read_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{post.read_time} min read</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Featured Image */}
        {post.cover_image && (
          <div className="mb-10">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full aspect-[21/9] object-cover rounded-2xl shadow-lg"
              loading="eager"
            />
          </div>
        )}

        {/* YouTube Video Embed (if video_url exists) */}
        {embedUrl && (
          <div className="mb-10">
            <Card className="overflow-hidden shadow-lg">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={embedUrl}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Card>
          </div>
        )}

        {/* Article Body */}
        <div 
          className="prose prose-lg prose-neutral dark:prose-invert max-w-none
                     prose-headings:font-bold prose-headings:tracking-tight
                     prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                     prose-p:leading-relaxed prose-p:text-base prose-p:mb-4
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-md
                     prose-strong:font-semibold prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="bg-card border-t">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related: RelatedArticle) => (
                <Link 
                  key={related.id} 
                  to="/blog/$slug" 
                  params={{ slug: related.slug }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                    {related.cover_image ? (
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        <img 
                          src={related.cover_image} 
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-primary/15 to-secondary/20 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                    <div className="p-4">
                      <Badge variant="secondary" className="text-xs mb-2">
                        {related.category}
                      </Badge>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back to Blog Footer */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center">
          <Link to="/blog">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View all articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
