import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Phone,
  MessageCircle,
  Eye,
  Loader2,
  Store,
} from "lucide-react";
import { formatNPR } from "@/lib/nepal";

export const Route = createFileRoute("/dealer/dashboard")({
  component: DealerDashboardLayout,
});

function DealerDashboardLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { redirect: "/dealer/dashboard" } as any });
    }
  }, [user, authLoading]);

  // Fetch dealer profile
  const { data: dealerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["dealer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Redirect to signup if no dealer profile
  useEffect(() => {
    if (!profileLoading && user && !dealerProfile) {
      navigate({ to: "/dealer-signup" });
    }
  }, [dealerProfile, profileLoading, user, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dealerProfile) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dealer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your listings, leads, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dealers/$slug" params={{ slug: dealerProfile.slug }}>
              <Store className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </Button>
          <Button asChild>
            <Link to="/sell">Create Listing</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" asChild>
            <Link to="/dealer/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Link>
          </TabsTrigger>
          <TabsTrigger value="inventory" asChild>
            <Link to="/dealer/dashboard/inventory">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Link>
          </TabsTrigger>
          <TabsTrigger value="leads" asChild>
            <Link to="/dealer/dashboard/leads">
              <Users className="mr-2 h-4 w-4" />
              Leads
            </Link>
          </TabsTrigger>
        </TabsList>

        <DashboardOverview dealerProfile={dealerProfile} />
      </Tabs>
    </div>
  );
}

function DashboardOverview({ dealerProfile }: { dealerProfile: any }) {
  // ... stats queries will go here after migration applied
  return (
    <div className="space-y-6">
      <p>Dashboard overview coming after migration is applied...</p>
    </div>
  );
}
