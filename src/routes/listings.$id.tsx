import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/listings/$id")({
  component: ListingLayout,
});

function ListingLayout() {
  return <Outlet />;
}
