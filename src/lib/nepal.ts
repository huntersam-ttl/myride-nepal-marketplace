export const NEPAL_DISTRICTS = [
  "Achham","Arghakhanchi","Baglung","Baitadi","Bajhang","Bajura","Banke","Bara","Bardiya","Bhaktapur",
  "Bhojpur","Chitwan","Dadeldhura","Dailekh","Dang","Darchula","Dhading","Dhankuta","Dhanusha","Dolakha",
  "Dolpa","Doti","Gorkha","Gulmi","Humla","Ilam","Jajarkot","Jhapa","Jumla","Kailali",
  "Kalikot","Kanchanpur","Kapilvastu","Kaski","Kathmandu","Kavrepalanchok","Khotang","Lalitpur","Lamjung","Mahottari",
  "Makwanpur","Manang","Morang","Mugu","Mustang","Myagdi","Nawalparasi East","Nawalparasi West","Nuwakot","Okhaldhunga",
  "Palpa","Panchthar","Parbat","Parsa","Pyuthan","Ramechhap","Rasuwa","Rautahat","Rolpa","Rukum East",
  "Rukum West","Rupandehi","Salyan","Sankhuwasabha","Saptari","Sarlahi","Sindhuli","Sindhupalchok","Siraha","Solukhumbu",
  "Sunsari","Surkhet","Syangja","Tanahun","Taplejung","Terhathum","Udayapur"
] as const;

export const POPULAR_BRANDS = [
  "Honda","Yamaha","Bajaj","TVS","KTM","Hero","Royal Enfield","Suzuki"
] as const;

export const BIKE_TYPES = ["sport","commuter","scooter","cruiser","off-road","touring"] as const;
export const CONDITIONS = ["new","excellent","good","fair","poor"] as const;
export const FUEL_TYPES = ["petrol","electric","hybrid"] as const;

export function formatNPR(amount: number): string {
  // Nepali/Indian numbering: 1,85,000
  const s = Math.round(amount).toString();
  if (s.length <= 3) return `NPR ${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `NPR ${withCommas},${last3}`;
}

/**
 * Normalise a Nepali phone number to international E.164-style digits
 * (no leading "+"), e.g. "9779812345678".
 *
 * Accepts inputs like:
 *   "+977 98-1234-5678", "977 9812345678", "9812345678",
 *   "09812345678", "0977-9812345678"
 *
 * Returns null if the input doesn't look like a valid Nepali mobile number
 * (a 10-digit local part starting with 9).
 */
export function normaliseNepalPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Strip a leading "00" international prefix
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Strip the country code if present so we can validate the local part
  if (digits.startsWith("977")) digits = digits.slice(3);
  // Strip a domestic trunk "0"
  digits = digits.replace(/^0+/, "");
  // Nepali mobile numbers are 10 digits and start with 9
  if (digits.length !== 10 || !digits.startsWith("9")) return null;
  return `977${digits}`;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const num = normaliseNepalPhone(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  const num = normaliseNepalPhone(phone);
  if (!num) return null;
  return `tel:+${num}`;
}
