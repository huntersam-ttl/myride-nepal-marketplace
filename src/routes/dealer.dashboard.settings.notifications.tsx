import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dealer/dashboard/settings/notifications")({
  component: NotificationPreferencesPage,
});

function NotificationPreferencesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dealerProfile, isLoading: accessLoading } = useDealerAccess();

  const [preferences, setPreferences] = useState({
    new_leads: true,
    new_followers: true,
    performance_alerts: true,
    dead_stock_alerts: true,
    weekly_summary: false,
  });

  // Fetch preferences
  const { data: existingPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["dealer-notification-prefs", dealerProfile?.id, user?.id],
    queryFn: async () => {
      if (!dealerProfile || !user) return null;
      const { data } = await (supabase as any)
        .from("dealer_notification_preferences")
        .select("*")
        .eq("dealer_id", dealerProfile.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!dealerProfile && !!user,
  });

  // Load existing preferences
  useEffect(() => {
    if (existingPrefs) {
      setPreferences({
        new_leads: existingPrefs.new_leads,
        new_followers: existingPrefs.new_followers,
        performance_alerts: existingPrefs.performance_alerts,
        dead_stock_alerts: existingPrefs.dead_stock_alerts,
        weekly_summary: existingPrefs.weekly_summary,
      });
    }
  }, [existingPrefs]);

  // Save preferences
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!dealerProfile || !user) throw new Error("Not authenticated");

      if (existingPrefs) {
        // Update existing
        const { error } = await (supabase as any)
          .from("dealer_notification_preferences")
          .update(preferences)
          .eq("id", existingPrefs.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await (supabase as any)
          .from("dealer_notification_preferences")
          .insert({
            dealer_id: dealerProfile.id,
            user_id: user.id,
            ...preferences,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Notification preferences saved!");
      queryClient.invalidateQueries({ queryKey: ["dealer-notification-prefs"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save preferences");
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (accessLoading || prefsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dealerProfile) {
    return (
      <Card className="p-12 text-center">
        <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold mb-2">No Dealer Profile</h2>
        <p className="text-muted-foreground mb-4">
          You need to create a dealer profile first.
        </p>
        <Button onClick={() => navigate({ to: "/dealer-signup" })}>
          Create Dealer Profile
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8" />
          Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Control which notifications you receive
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which updates you want to receive via email
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new_leads" className="text-base">
                    New Leads
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone inquires about your listings
                  </p>
                </div>
                <Switch
                  id="new_leads"
                  checked={preferences.new_leads}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, new_leads: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new_followers" className="text-base">
                    New Followers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone follows your dealership
                  </p>
                </div>
                <Switch
                  id="new_followers"
                  checked={preferences.new_followers}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, new_followers: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="performance_alerts" className="text-base">
                    Performance Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts about listing views, engagement, and trends
                  </p>
                </div>
                <Switch
                  id="performance_alerts"
                  checked={preferences.performance_alerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, performance_alerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dead_stock_alerts" className="text-base">
                    Dead Stock Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts when listings haven't received views in 30+ days
                  </p>
                </div>
                <Switch
                  id="dead_stock_alerts"
                  checked={preferences.dead_stock_alerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, dead_stock_alerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly_summary" className="text-base">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your dealership's performance
                  </p>
                </div>
                <Switch
                  id="weekly_summary"
                  checked={preferences.weekly_summary}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, weekly_summary: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Note: Email delivery for notifications will be available after Phase 4 implementation.
              For now, these preferences will be saved for future use.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/dealer/dashboard/settings" })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
