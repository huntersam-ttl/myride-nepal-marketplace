import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

interface DeadStockAlertProps {
  dealerUserId: string;
}

export function DeadStockAlert({ dealerUserId }: DeadStockAlertProps) {
  const { data: deadStock = [] } = useQuery({
    queryKey: ["dead-stock", dealerUserId],
    queryFn: async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, views_count, created_at, images")
        .eq("user_id", dealerUserId)
        .eq("status", "active")
        .eq("views_count", 0)
        .lt("created_at", fourteenDaysAgo.toISOString())
        .order("created_at", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  if (deadStock.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-amber-200 bg-amber-50/50">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Dead Stock Alert</h3>
          <p className="text-sm text-amber-700">
            These listings may need better photos, price adjustment, or sharing.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {deadStock.map((listing: any) => (
          <div key={listing.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Eye className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{listing.title}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.views_count} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to="/dealer/dashboard/inventory">
          View All Listings
        </Link>
      </Button>
    </Card>
  );
}
