/**
 * Calculate a comprehensive quality score for a listing
 * @param listing - The listing object to score
 * @returns Score object with score (0-100), grade (A-D), breakdown, and improvement tips
 */

interface ScoreBreakdownItem {
  label: string;
  points: number;
  maxPoints: number;
  completed: boolean;
}

interface ListingScore {
  score: number;
  grade: "A" | "B" | "C" | "D";
  breakdown: ScoreBreakdownItem[];
  tips: string[];
}

// Base market prices by brand (same as fake listing detection)
const BASE_MARKET_PRICES: Record<string, number> = {
  "Hero": 150000,
  "Honda": 250000,
  "Yamaha": 280000,
  "Bajaj": 180000,
  "TVS": 160000,
  "Suzuki": 200000,
  "KTM": 350000,
  "Royal Enfield": 280000,
  "Pulsar": 180000,
  "Apache": 160000,
};

export function calculateListingScore(listing: any): ListingScore {
  const breakdown: ScoreBreakdownItem[] = [];
  const tips: string[] = [];
  let totalScore = 0;

  // 1. Photos — maximum 25 points
  const photoCount = listing.images?.length || 0;
  let photoPoints = 0;
  if (photoCount === 0) {
    photoPoints = 0;
  } else if (photoCount <= 2) {
    photoPoints = 10;
  } else if (photoCount <= 5) {
    photoPoints = 18;
  } else {
    photoPoints = 25;
  }
  
  breakdown.push({
    label: "Photos",
    points: photoPoints,
    maxPoints: 25,
    completed: photoPoints === 25,
  });
  totalScore += photoPoints;

  if (photoCount < 6) {
    tips.push("Add more photos — listings with 6 or more photos get 3× more enquiries");
  }

  // 2. Description length — maximum 15 points
  const description = listing.description || "";
  const wordCount = description.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  let descriptionPoints = 0;
  if (wordCount < 20) {
    descriptionPoints = 0;
  } else if (wordCount <= 50) {
    descriptionPoints = 8;
  } else {
    descriptionPoints = 15;
  }

  breakdown.push({
    label: "Description",
    points: descriptionPoints,
    maxPoints: 15,
    completed: descriptionPoints === 15,
  });
  totalScore += descriptionPoints;

  if (wordCount < 50) {
    tips.push("Write a longer description — describe the bike condition, history, and reason for selling");
  }

  // 3. Price reasonableness — maximum 15 points
  const basePrice = BASE_MARKET_PRICES[listing.brand] || 200000;
  const priceDifference = Math.abs(listing.price - basePrice) / basePrice;
  let pricePoints = 0;
  if (priceDifference <= 0.20) {
    pricePoints = 15;
  } else if (priceDifference <= 0.40) {
    pricePoints = 8;
  } else {
    pricePoints = 0;
  }

  breakdown.push({
    label: "Price Reasonableness",
    points: pricePoints,
    maxPoints: 15,
    completed: pricePoints === 15,
  });
  totalScore += pricePoints;

  // 4. Bike history filled — maximum 15 points
  let historyPoints = 0;
  const historyFields = [
    listing.num_owners !== null && listing.num_owners !== undefined,
    listing.accident_history !== null && listing.accident_history !== undefined,
    listing.service_history !== null && listing.service_history !== undefined,
    listing.last_service_date !== null && listing.last_service_date !== undefined,
    listing.registration_expiry !== null && listing.registration_expiry !== undefined,
  ];
  historyPoints = historyFields.filter(Boolean).length * 3;

  breakdown.push({
    label: "Bike History",
    points: historyPoints,
    maxPoints: 15,
    completed: historyPoints === 15,
  });
  totalScore += historyPoints;

  if (historyPoints < 15) {
    tips.push("Fill in the bike history section to build buyer trust");
  }

  // 5. Documents filled — maximum 15 points
  let documentPoints = 0;
  if (listing.has_bluebook === true) documentPoints += 3;
  if (listing.has_insurance === true) documentPoints += 3;
  if (listing.has_tax_clearance === true) documentPoints += 3;
  if (listing.has_registration === true) documentPoints += 3;
  if (listing.bluebook_name_match === true) documentPoints += 3;

  breakdown.push({
    label: "Documents",
    points: documentPoints,
    maxPoints: 15,
    completed: documentPoints === 15,
  });
  totalScore += documentPoints;

  if (documentPoints < 15) {
    tips.push("Add document information — buyers want to know if bluebook and insurance are available");
  }

  // 6. Contact info — maximum 10 points
  let contactPoints = 0;
  if (listing.phone) contactPoints += 5;
  if (listing.whatsapp) contactPoints += 5;

  breakdown.push({
    label: "Contact Info",
    points: contactPoints,
    maxPoints: 10,
    completed: contactPoints === 10,
  });
  totalScore += contactPoints;

  if (!listing.whatsapp) {
    tips.push("Add your WhatsApp number so buyers can contact you easily");
  }

  // 7. Location — maximum 5 points
  const locationPoints = listing.district ? 5 : 0;

  breakdown.push({
    label: "Location",
    points: locationPoints,
    maxPoints: 5,
    completed: locationPoints === 5,
  });
  totalScore += locationPoints;

  // Assign grade
  let grade: "A" | "B" | "C" | "D";
  if (totalScore >= 85) {
    grade = "A";
  } else if (totalScore >= 70) {
    grade = "B";
  } else if (totalScore >= 50) {
    grade = "C";
  } else {
    grade = "D";
  }

  return {
    score: totalScore,
    grade,
    breakdown,
    tips,
  };
}
