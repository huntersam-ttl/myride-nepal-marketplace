import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dealer/dashboard/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return <Outlet />;
}
