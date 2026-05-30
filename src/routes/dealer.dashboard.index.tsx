import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dealer/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  // ... stats queries will go here after migration applied
  return (
    <div className="space-y-6">
      <p>Dashboard overview coming after migration is applied...</p>
    </div>
  );
}
