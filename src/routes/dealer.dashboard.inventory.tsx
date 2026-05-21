import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dealer/dashboard/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <div>
      <h2>Inventory Management</h2>
      <p>Coming soon after migration is applied...</p>
    </div>
  );
}
