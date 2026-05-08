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

export function whatsappLink(phone: string, message: string): string {
  const clean = phone.replace(/[^\d]/g, "");
  const num = clean.startsWith("977") ? clean : `977${clean.replace(/^0+/, "")}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
