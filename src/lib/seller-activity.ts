import { supabase } from "@/integrations/supabase/client";

/**
 * Calculate seller response time category based on their activity
 * @param userId - The seller's user ID
 * @returns Response time category: "fast" | "moderate" | "slow" | null
 */
export async function getSellerResponseTime(
  userId: string
): Promise<"fast" | "moderate" | "slow" | null> {
  try {
    // Fetch seller's listings to estimate activity (last_active column doesn't exist yet)
    const { data: listings, error } = await supabase
      .from("listings")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !listings || !listings.created_at) {
      return null;
    }

    const lastActive = new Date(listings.created_at);
    const now = new Date();
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    // Categorize response time based on last activity
    if (hoursSinceActive < 48) {
      // Active within last 48 hours
      return "fast";
    } else if (hoursSinceActive < 168) {
      // Active within last week
      return "moderate";
    } else if (hoursSinceActive < 720) {
      // Active within last month
      return "slow";
    } else {
      // Not active for over a month
      return null;
    }
  } catch (error) {
    console.error("Error fetching seller response time:", error);
    return null;
  }
}

/**
 * Calculate average response time based on seller's listing activity
 * @param userId - The seller's user ID
 * @returns Response time category: "fast" | "moderate" | "slow" | null
 */
export async function calculateSellerResponseTime(
  userId: string
): Promise<"fast" | "moderate" | "slow" | null> {
  try {
    // Check if seller is a dealer (dealers typically respond faster)
    const { data: dealerProfile } = await supabase
      .from("dealer_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (dealerProfile) {
      // Verified dealers get "fast" by default
      return "fast";
    }

    // For regular sellers, calculate based on last_active
    return await getSellerResponseTime(userId);
  } catch (error) {
    console.error("Error calculating seller response time:", error);
    return null;
  }
}
