import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback with PKCE
        // We just need to wait for the session to be established
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          toast.success("Successfully signed in with Google!");
          // Small delay to ensure everything is synced
          setTimeout(() => {
            navigate({ to: "/" });
          }, 500);
        } else {
          // If no session yet, wait a moment and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
          
          if (retryError || !retrySession) {
            throw new Error("Failed to establish session");
          }
          
          toast.success("Successfully signed in with Google!");
          navigate({ to: "/" });
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        const message = error instanceof Error ? error.message : "Authentication failed";
        toast.error(message);
        setStatus("error");
        // Redirect to auth page after a short delay
        setTimeout(() => {
          navigate({ to: "/auth" });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === "loading" ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-muted-foreground">Please wait while we complete your authentication</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-600">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground">Redirecting you back to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
