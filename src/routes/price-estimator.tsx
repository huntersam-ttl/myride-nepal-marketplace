import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/price-estimator")({
  component: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Price Estimator</h1>
      <p className="text-muted-foreground mt-3">Coming in Phase 2 — calculate your bike's resale value.</p>
    </div>
  ),
  head: () => ({ meta: [{ title: "Price Estimator — MyRideNepal" }] }),
});
