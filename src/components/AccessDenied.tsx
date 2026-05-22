import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AccessDeniedProps {
  message?: string;
  backTo?: string;
  backLabel?: string;
}

export function AccessDenied({
  message = "You don't have permission to access this page.",
  backTo = "/dealer/dashboard",
  backLabel = "Back to Dashboard",
}: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-12 text-center max-w-md mx-auto mt-12">
      <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
      <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button onClick={() => navigate({ to: backTo as any })}>
        {backLabel}
      </Button>
    </Card>
  );
}
