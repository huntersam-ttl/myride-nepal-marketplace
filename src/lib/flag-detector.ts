import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export interface Flag {
  level: "critical" | "warning" | "info";
  message: string;
}

// Base prices in NPR for various bike models
const BASE_PRICES: Record<string, number> = {
  "Honda CB Shine": 185000,
  "Honda Activa": 160000,
  "Yamaha FZ": 245000,
  "Yamaha R15": 380000,
  "Bajaj Pulsar 150": 210000,
  "Bajaj Pulsar 220": 280000,
  "Bajaj Avenger": 300000,
  "TVS Apache 160": 230000,
  "TVS Jupiter": 155000,
  "KTM Duke 200": 420000,
  "KTM Duke 390": 650000,
  "Royal Enfield Classic 350": 520000,
  "Royal Enfield Meteor": 580000,
  "Hero Splendor": 145000,
  "Hero Glamour": 165000,
  "Suzuki Gixxer": 280000,
  "Suzuki Access": 160000,
  "Bajaj CT100": 120000,
  "Honda XBlade": 235000,
  "Yamaha Saluto": 150000,
};

/**
 * Format a number as NPR with commas
 */
function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-IN")}`;
}

/**
 * Count words in a string
 */
function countWords(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Detect potential issues with a listing
 * @param listing - The listing to check
 * @param allListings - All listings (used for cross-referencing)
 * @param dealerUserIds - Set of user IDs that are dealers (optional, for check 4)
 * @returns Array of flags
 */
export function detectFlags(
  listing: Listing,
  allListings: Listing[],
  dealerUserIds?: Set<string>
): Flag[] {
  const flags: Flag[] = [];

  // Check 1: No photos
  if (!listing.images || listing.images.length === 0) {
    flags.push({
      level: "critical",
      message: "No photos uploaded",
    });
  }

  // Check 2: Description too short
  const wordCount = countWords(listing.description);
  if (wordCount < 20) {
    flags.push({
      level: "warning",
      message: `Description is too short (under 20 words)`,
    });
  }

  // Check 3: Price suspiciously low
  const bikeKey = `${listing.brand} ${listing.model}`;
  const basePrice = BASE_PRICES[bikeKey];
  
  if (basePrice) {
    const priceRatio = listing.price / basePrice;
    
    if (priceRatio < 0.4) {
      // Below 40% (over 60% discount)
      flags.push({
        level: "critical",
        message: `Price is suspiciously low — over 60% below estimated market value (${formatNPR(listing.price)})`,
      });
    } else if (priceRatio < 0.6) {
      // Below 60% (40-60% discount)
      flags.push({
        level: "warning",
        message: "Price is unusually low and worth verifying",
      });
    }
  }

  // Check 4: Same phone number on multiple listings (skip for dealers)
  const isDealer = dealerUserIds?.has(listing.user_id);
  
  if (!isDealer) {
    // Count other listings with same phone number
    const samePhoneListings = allListings.filter(
      (l) => l.id !== listing.id && l.phone === listing.phone
    );
    const samePhoneCount = samePhoneListings.length;

    if (samePhoneCount >= 3) {
      flags.push({
        level: "critical",
        message: `Phone number is used on multiple listings (${samePhoneCount} other listings) — may be a spam account`,
      });
    } else if (samePhoneCount >= 1) {
      flags.push({
        level: "warning",
        message: `Phone number also appears on ${samePhoneCount} other listing${samePhoneCount > 1 ? "s" : ""}`,
      });
    }
  }

  // Check 5: Too many pending listings from same user
  const pendingFromUser = allListings.filter(
    (l) => 
      l.id !== listing.id && 
      l.user_id === listing.user_id && 
      l.status === "pending"
  );
  const pendingCount = pendingFromUser.length;

  if (pendingCount >= 4) {
    flags.push({
      level: "warning",
      message: `This user has multiple pending listings at once (${pendingCount} other pending listings)`,
    });
  }

  return flags;
}
