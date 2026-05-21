import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dealer/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <div>
      <h2>Lead Inbox</h2>
      <p>Coming soon after migration is applied...</p>
    </div>
  );
}
