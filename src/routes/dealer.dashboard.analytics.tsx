import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { AccessDenied } from "@/components/AccessDenied";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Eye, Phone, MessageCircle, Users, ShoppingCart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const Route = createFileRoute("/dealer/dashboard/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { canViewAnalytics, isLoading: accessLoading } = useDealerAccess();
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canViewAnalytics) {
    return (
      <AccessDenied message="Only dealer owners can view analytics. Contact your manager if you need access." />
    );
  }

  // Fetch dealer profile
  const { data: dealerProfile } = useQuery({
    queryKey: ["dealer-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_profiles")
        .select("id, user_id")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["dealer-analytics", dealerProfile?.id, timeRange],
    enabled: !!dealerProfile,
    queryFn: async () => {
      const dealerId = dealerProfile!.id;
      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);

      // Profile views
      const { count: profileViews } = await supabase
        .from("dealer_analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .eq("event_type", "profile_view")
        .gte("created_at", daysAgo.toISOString());

      // Listing views
      const { count: listingViews } = await supabase
        .from("dealer_analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .eq("event_type", "listing_view")
        .gte("created_at", daysAgo.toISOString());

      // WhatsApp clicks
      const { count: whatsappClicks } = await supabase
        .from("dealer_analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .eq("event_type", "whatsapp_click")
        .gte("created_at", daysAgo.toISOString());

      // Phone clicks
      const { count: phoneClicks } = await supabase
        .from("dealer_analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .eq("event_type", "phone_click")
        .gte("created_at", daysAgo.toISOString());

      // Total leads
      const { count: totalLeads } = await supabase
        .from("dealer_leads")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .gte("created_at", daysAgo.toISOString());

      // Sold leads
      const { count: soldLeads } = await supabase
        .from("dealer_leads")
        .select("*", { count: "exact", head: true })
        .eq("dealer_id", dealerId)
        .eq("stage", "sold")
        .gte("created_at", daysAgo.toISOString());

      // Top listings by views
      const { data: topViewedListings } = await supabase
        .from("listings")
        .select("id, title, views_count, leads_count, price, images")
        .eq("user_id", dealerProfile!.user_id)
        .eq("status", "active")
        .order("views_count", { ascending: false })
        .limit(5);

      // Top listings by leads
      const { data: topLeadListings } = await supabase
        .from("listings")
        .select("id, title, views_count, leads_count, price, images")
        .eq("user_id", dealerProfile!.user_id)
        .eq("status", "active")
        .order("leads_count", { ascending: false })
        .limit(5);

      // Lead source breakdown
      const { data: leadSources } = await supabase
        .from("dealer_leads")
        .select("source")
        .eq("dealer_id", dealerId)
        .gte("created_at", daysAgo.toISOString());

      const sourceBreakdown = leadSources?.reduce((acc: Record<string, number>, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {}) || {};

      const safeTotal = totalLeads || 0;
      const safeSold = soldLeads || 0;
      
      return {
        profileViews: profileViews || 0,
        listingViews: listingViews || 0,
        whatsappClicks: whatsappClicks || 0,
        phoneClicks: phoneClicks || 0,
        totalLeads: safeTotal,
        soldLeads: safeSold,
        conversionRate: safeTotal > 0 ? ((safeSold / safeTotal) * 100).toFixed(1) : "0.0",
        topViewedListings: topViewedListings || [],
        topLeadListings: topLeadListings || [],
        sourceBreakdown,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = analytics && (
    analytics.profileViews > 0 ||
    analytics.listingViews > 0 ||
    analytics.whatsappClicks > 0 ||
    analytics.phoneClicks > 0 ||
    analytics.totalLeads > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Track your dealer performance</p>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <Card className="p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
          <p className="text-muted-foreground">
            Analytics will appear once people start viewing your profile and listings.
          </p>
        </Card>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Profile Views"
              value={analytics.profileViews}
              icon={<Eye className="h-4 w-4" />}
            />
            <StatCard
              title="Listing Views"
              value={analytics.listingViews}
              icon={<Eye className="h-4 w-4" />}
            />
            <StatCard
              title="WhatsApp Clicks"
              value={analytics.whatsappClicks}
              icon={<MessageCircle className="h-4 w-4" />}
            />
            <StatCard
              title="Phone Clicks"
              value={analytics.phoneClicks}
              icon={<Phone className="h-4 w-4" />}
            />
            <StatCard
              title="Total Leads"
              value={analytics.totalLeads}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              title="Sold"
              value={analytics.soldLeads}
              icon={<ShoppingCart className="h-4 w-4" />}
            />
            <StatCard
              title="Conversion Rate"
              value={`${analytics.conversionRate}%`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Top Listings by Views */}
          {analytics.topViewedListings.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Listings by Views</h3>
              <div className="space-y-3">
                {analytics.topViewedListings.map((listing: any) => (
                  <div key={listing.id} className="flex items-center gap-4">
                    {listing.images?.[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.views_count} views • {listing.leads_count} leads
                      </p>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min((listing.views_count / (analytics.topViewedListings[0]?.views_count || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Listings by Leads */}
          {analytics.topLeadListings.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Listings by Leads</h3>
              <div className="space-y-3">
                {analytics.topLeadListings.map((listing: any) => (
                  <div key={listing.id} className="flex items-center gap-4">
                    {listing.images?.[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.leads_count} leads • {listing.views_count} views
                      </p>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((listing.leads_count / (analytics.topLeadListings[0]?.leads_count || 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Lead Sources */}
          {Object.keys(analytics.sourceBreakdown).length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Lead Sources</h3>
              <div className="space-y-3">
                {Object.entries(analytics.sourceBreakdown).map(([source, count]: [string, any]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="capitalize">{source.replace(/_/g, ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}
