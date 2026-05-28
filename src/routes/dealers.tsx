import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dealers")({
  component: DealersLayout,
});

function DealersLayout() {
  return <Outlet />;
}
