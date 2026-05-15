const STORAGE_KEY = "myridenepal_recently_viewed";
const MAX_ITEMS = 10;

export interface RecentlyViewedListing {
  id: string;
  title: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  images: string[];
  district: string;
  condition: string;
  status?: string;
  created_at?: string;
  user_id?: string;
}

/**
 * Add a listing to recently viewed history
 * @param listing - The listing object to add
 */
export function addRecentlyViewed(listing: RecentlyViewedListing): void {
  try {
    const existing = getRecentlyViewed();
    
    // Remove any existing entry with the same id to avoid duplicates
    const filtered = existing.filter((item) => item.id !== listing.id);
    
    // Add new listing to the front
    const updated = [listing, ...filtered];
    
    // Keep maximum 10 items
    const trimmed = updated.slice(0, MAX_ITEMS);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error adding to recently viewed:", error);
  }
}

/**
 * Get all recently viewed listings
 * @returns Array of recently viewed listings
 */
export function getRecentlyViewed(): RecentlyViewedListing[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing recently viewed:", error);
    return [];
  }
}

/**
 * Clear all recently viewed listings
 */
export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed:", error);
  }
}
