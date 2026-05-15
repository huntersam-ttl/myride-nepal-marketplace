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
    // Fetch seller's last active time from profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("last_active")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile || !profile.last_active) {
      return null;
    }

    const lastActive = new Date(profile.last_active);
    const now = new Date();
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    // Categorize response time based on last activity
    if (hoursSinceActive < 2) {
      // Active within last 2 hours
      return "fast";
    } else if (hoursSinceActive < 24) {
      // Active within last 24 hours
      return "moderate";
    } else if (hoursSinceActive < 168) {
      // Active within last week
      return "slow";
    } else {
      // Not active for over a week
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
