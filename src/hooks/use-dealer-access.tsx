import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type DealerRole = "owner" | "sales_staff" | "listing_manager" | null;

export function useDealerAccess(dealerId?: string) {
  const { user } = useAuth();

  // Get dealer profile if dealerId not provided
  const { data: dealerProfile } = useQuery({
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
    enabled: !!user && !dealerId,
  });

  const targetDealerId = dealerId || dealerProfile?.id;

  // Get current user's role
  const { data: staffRole, isLoading } = useQuery({
    queryKey: ["dealer-staff-role", targetDealerId, user?.id],
    queryFn: async () => {
      if (!targetDealerId || !user) return null;
      const { data } = await (supabase as any)
        .from("dealer_staff")
        .select("role, status")
        .eq("dealer_id", targetDealerId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      return data;
    },
    enabled: !!targetDealerId && !!user,
  });

  const role: DealerRole = staffRole?.role || null;

  // Permission checks
  const isOwner = role === "owner";
  const isListingManager = role === "listing_manager";
  const isSalesStaff = role === "sales_staff";
  const hasAnyRole = !!role;

  return {
    role,
    isLoading,
    isOwner,
    isListingManager,
    isSalesStaff,
    hasAnyRole,
    dealerProfile: dealerProfile || null,
    dealerId: targetDealerId,

    // Specific permissions
    canManageTeam: isOwner,
    canManageProfile: isOwner,
    canManageListings: isOwner || isListingManager,
    canManageLeads: isOwner || isSalesStaff,
    canViewAnalytics: isOwner,
    canUseShareTools: isOwner || isListingManager,
    canAccessDashboard: hasAnyRole,
    canViewSettings: hasAnyRole,
  };
}
