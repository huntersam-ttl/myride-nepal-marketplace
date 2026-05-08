import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="text-muted-foreground mt-3">Bike guides, reviews, and news. Coming in Phase 2.</p>
    </div>
  ),
  head: () => ({ meta: [{ title: "Blog — MyRideNepal" }] }),
});
