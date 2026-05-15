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
 * Normalise a raw phone string to E.164 digits without the leading "+".
 * Works for both Nepali (+977) and UK (+44) numbers in any common format.
 */
export function cleanPhoneNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip spaces, dashes, brackets, dots
  const s = raw.replace(/[\s\-\(\)\.]/g, "");
  if (!s) return null;

  if (s.startsWith("+44"))   return "44"  + s.slice(3);
  if (s.startsWith("0044"))  return "44"  + s.slice(4);
  if (s.startsWith("+977"))  return "977" + s.slice(4);
  if (s.startsWith("00977")) return "977" + s.slice(5);
  if (s.startsWith("977"))   return s;
  if (s.startsWith("44"))    return s;
  // Nepali mobile without country code: 98xx/97xx, 10 digits
  if ((s.startsWith("98") || s.startsWith("97")) && s.length === 10) return "977" + s;
  // UK mobile without country code: 07xxx, 11 digits
  if (s.startsWith("07") && s.length === 11) return "44" + s.slice(1);

  const digits = s.replace(/\D/g, "");
  return digits || null;
}

export function whatsappLink(phone: string | null | undefined, message: string): string | null {
  const num = cleanPhoneNumber(phone);
  if (!num) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  const num = cleanPhoneNumber(phone);
  if (!num) return null;
  return `tel:+${num}`;
}

export function smsLink(phone: string | null | undefined): string | null {
  const num = cleanPhoneNumber(phone);
  if (!num) return null;
  return `sms:+${num}`;
}
