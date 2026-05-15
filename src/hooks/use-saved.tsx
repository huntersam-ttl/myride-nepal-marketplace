import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function useSavedIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("saved_listings").select("listing_id").eq("user_id", user!.id);
      return new Set((data ?? []).map((r) => r.listing_id));
    },
  });
}

export function useToggleSave() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async (listingId: string, listingPrice?: number) => {
    if (!user) {
      toast.info("Login to save listings");
      navigate({ to: "/auth" });
      return;
    }
    const { data: existing } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();
    if (existing) {
      await supabase.from("saved_listings").delete().eq("id", existing.id);
      toast.success("Removed from saved");
    } else {
      const insertData: any = { 
        user_id: user.id, 
        listing_id: listingId,
        notify_price_drop: true // Default to true
      };
      
      // If price is provided, save it
      if (listingPrice !== undefined) {
        insertData.price_at_save = listingPrice;
      }
      
      await supabase.from("saved_listings").insert(insertData);
      toast.success("Saved");
    }
    qc.invalidateQueries({ queryKey: ["saved", user.id] });
  };
}

export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return (data ?? []).some((r) => r.role === "admin");
    },
  });
}
