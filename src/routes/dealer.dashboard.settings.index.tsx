import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Users, 
  Bell, 
  Shield, 
  Building2,
  ChevronRight,
  Loader2
} from "lucide-react";

export const Route = createFileRoute("/dealer/dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get dealer profile
  const { data: dealerProfile, isLoading: dealerLoading } = useQuery({
    queryKey: ["dealer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("dealer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Get user's staff role
  const { data: staffRole } = useQuery({
    queryKey: ["dealer-staff-role", dealerProfile?.id, user?.id],
    queryFn: async () => {
      if (!dealerProfile || !user) return null;
      const { data } = await (supabase as any)
        .from("dealer_staff")
        .select("role, status")
        .eq("dealer_id", dealerProfile.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!dealerProfile && !!user,
  });

  if (dealerLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dealerProfile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No dealer profile found</p>
        <Button onClick={() => navigate({ to: "/dealer-signup" })}>
          Create Dealer Profile
        </Button>
      </Card>
    );
  }

  const settingsSections = [
    {
      title: "Dealer Profile",
      description: "Edit your business name, description, location, and contact details",
      icon: Building2,
      href: "/dealer/dashboard/settings/profile",
      badge: staffRole?.role === "owner" ? null : "Owner Only",
      disabled: staffRole?.role !== "owner",
    },
    {
      title: "Team Access",
      description: "Manage staff members and their permissions",
      icon: Users,
      href: "/dealer/dashboard/settings/team",
      badge: staffRole?.role === "owner" ? null : "Owner Only",
      disabled: staffRole?.role !== "owner",
    },
    {
      title: "Notification Preferences",
      description: "Configure how you receive notifications",
      icon: Bell,
      href: "/dealer/dashboard/settings/notifications",
      badge: null,
      disabled: false,
    },
    {
      title: "Security",
      description: "Password, two-factor authentication, and account security",
      icon: Shield,
      href: "/dealer/dashboard/settings/security",
      badge: null,
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your dealer account settings and preferences
          </p>
        </div>
      </div>

      {/* Profile Summary */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {dealerProfile.logo_url && (
            <img
              src={dealerProfile.logo_url}
              alt={dealerProfile.business_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{dealerProfile.business_name}</h2>
            {dealerProfile.location && (
              <p className="text-sm text-muted-foreground mt-1">{dealerProfile.location}</p>
            )}
            {staffRole && (
              <Badge variant="secondary" className="mt-2 capitalize">
                {staffRole.role.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-4">
        {settingsSections.map((section) => (
          <Card
            key={section.title}
            className={`p-6 transition-colors ${
              section.disabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-accent cursor-pointer"
            }`}
            onClick={() => {
              if (!section.disabled) {
                navigate({ to: section.href as any });
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.badge && (
                    <Badge variant="outline" className="text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
              {!section.disabled && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
