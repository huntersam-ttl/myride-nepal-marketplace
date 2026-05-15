import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", params.slug).eq("published", true).maybeSingle();
    if (error || !data) throw notFound();
    return { post: data };
  },
  component: BlogPostPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Article not found</h1>
      <Link to="/blog" className="text-primary mt-3 inline-block">Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="container mx-auto py-20 text-center text-destructive">{error.message}</div>,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title ?? "Article"} — MyRideNepal Journal` },
      { name: "description", content: loaderData?.post?.excerpt ?? "" },
      { property: "og:image", content: loaderData?.post?.cover_image ?? "" },
    ],
  }),
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← All articles</Link>
      <div className="mt-4">
        <Badge variant="secondary">{post.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
          <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          {post.read_time && <span>· {post.read_time} min read</span>}
        </div>
      </div>
      {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-xl mt-6" />}
      <div 
        className="prose prose-lg prose-neutral max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
