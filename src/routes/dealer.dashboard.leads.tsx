import { createFileRoute } from "@tanstack/react-router";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { AccessDenied } from "@/components/AccessDenied";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dealer/dashboard/leads")({
  component: LeadsPage,
});

function LeadsPage() {
  const { canManageLeads, isLoading: accessLoading } = useDealerAccess();

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManageLeads) {
    return (
      <AccessDenied message="Only owners and sales staff can manage leads. Contact your manager if you need access." />
    );
  }

  return (
    <div>
      <h2>Lead Inbox</h2>
      <p>Coming soon after migration is applied...</p>
    </div>
  );
}
