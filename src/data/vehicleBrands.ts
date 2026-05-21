/**
 * Vehicle Brands and Models for Nepal Market
 * Used in price estimator and other components
 */

export interface VehicleModel {
  name: string;
  basePrice?: number; // Optional base price in NPR
}

export interface VehicleBrand {
  name: string;
  models: VehicleModel[];
}

export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    name: "Bajaj",
    models: [
      { name: "Pulsar 150", basePrice: 320000 },
      { name: "Pulsar 160 NS", basePrice: 360000 },
      { name: "Pulsar NS200", basePrice: 450000 },
      { name: "Pulsar 220F", basePrice: 420000 },
      { name: "Pulsar RS200", basePrice: 480000 },
      { name: "Dominar 250", basePrice: 520000 },
      { name: "Dominar 400", basePrice: 650000 },
      { name: "Avenger 160", basePrice: 290000 },
      { name: "Avenger 220", basePrice: 350000 },
      { name: "Platina 100", basePrice: 170000 },
      { name: "Platina 110", basePrice: 180000 },
      { name: "CT 100", basePrice: 150000 },
    ],
  },
  {
    name: "TVS",
    models: [
      { name: "Apache RTR 160", basePrice: 340000 },
      { name: "Apache RTR 160 4V", basePrice: 360000 },
      { name: "Apache RTR 180", basePrice: 380000 },
      { name: "Apache RTR 200 4V", basePrice: 450000 },
      { name: "Apache RR 310", basePrice: 720000 },
      { name: "Raider 125", basePrice: 280000 },
      { name: "Ntorq 125", basePrice: 260000 },
      { name: "Jupiter", basePrice: 230000 },
      { name: "Jupiter 125", basePrice: 250000 },
      { name: "XL 100", basePrice: 160000 },
    ],
  },
  {
    name: "Yamaha",
    models: [
      { name: "FZ FI", basePrice: 380000 },
      { name: "FZS FI", basePrice: 400000 },
      { name: "FZ-X", basePrice: 360000 },
      { name: "MT-15", basePrice: 530000 },
      { name: "MT-15 V2", basePrice: 550000 },
      { name: "R15 V4", basePrice: 580000 },
      { name: "R15M", basePrice: 620000 },
      { name: "RayZR 125", basePrice: 270000 },
      { name: "Fascino 125", basePrice: 250000 },
      { name: "YZF R3", basePrice: 950000 },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "Shine", basePrice: 230000 },
      { name: "Shine 125", basePrice: 250000 },
      { name: "Unicorn", basePrice: 280000 },
      { name: "Hornet 2.0", basePrice: 320000 },
      { name: "CB350", basePrice: 520000 },
      { name: "CB350RS", basePrice: 560000 },
      { name: "XR", basePrice: 310000 },
      { name: "Dio", basePrice: 220000 },
      { name: "Activa 6G", basePrice: 240000 },
      { name: "Activa 125", basePrice: 260000 },
      { name: "Grazia", basePrice: 250000 },
      { name: "SP 125", basePrice: 240000 },
    ],
  },
  {
    name: "Hero",
    models: [
      { name: "Splendor Plus", basePrice: 200000 },
      { name: "Splendor iSmart", basePrice: 220000 },
      { name: "Xpulse 200", basePrice: 380000 },
      { name: "Xpulse 200 4V", basePrice: 420000 },
      { name: "Xtreme 160R", basePrice: 310000 },
      { name: "Xtreme 160R 4V", basePrice: 330000 },
      { name: "Passion Pro", basePrice: 210000 },
      { name: "Glamour", basePrice: 230000 },
      { name: "HF Deluxe", basePrice: 180000 },
      { name: "Maestro Edge", basePrice: 240000 },
      { name: "Pleasure Plus", basePrice: 220000 },
    ],
  },
  {
    name: "Royal Enfield",
    models: [
      { name: "Classic 350", basePrice: 550000 },
      { name: "Bullet 350", basePrice: 480000 },
      { name: "Hunter 350", basePrice: 520000 },
      { name: "Meteor 350", basePrice: 540000 },
      { name: "Himalayan", basePrice: 580000 },
      { name: "Scram 411", basePrice: 550000 },
      { name: "Continental GT 650", basePrice: 850000 },
      { name: "Interceptor 650", basePrice: 820000 },
      { name: "Super Meteor 650", basePrice: 900000 },
    ],
  },
  {
    name: "Suzuki",
    models: [
      { name: "Gixxer", basePrice: 330000 },
      { name: "Gixxer SF", basePrice: 360000 },
      { name: "Gixxer 250", basePrice: 480000 },
      { name: "Gixxer SF 250", basePrice: 510000 },
      { name: "Access 125", basePrice: 240000 },
      { name: "Avenis", basePrice: 260000 },
      { name: "Burgman Street", basePrice: 280000 },
      { name: "V-Strom SX", basePrice: 520000 },
    ],
  },
  {
    name: "KTM",
    models: [
      { name: "Duke 125", basePrice: 380000 },
      { name: "Duke 200", basePrice: 480000 },
      { name: "Duke 250", basePrice: 580000 },
      { name: "Duke 390", basePrice: 750000 },
      { name: "RC 125", basePrice: 390000 },
      { name: "RC 200", basePrice: 500000 },
      { name: "RC 390", basePrice: 780000 },
      { name: "Adventure 250", basePrice: 680000 },
      { name: "Adventure 390", basePrice: 850000 },
    ],
  },
  {
    name: "Crossfire",
    models: [
      { name: "HJ 250", basePrice: 420000 },
      { name: "RM 250", basePrice: 450000 },
      { name: "Tracker 250", basePrice: 480000 },
      { name: "XCF 250", basePrice: 460000 },
      { name: "ODES 150", basePrice: 280000 },
    ],
  },
  {
    name: "Benelli",
    models: [
      { name: "TNT 150i", basePrice: 380000 },
      { name: "TNT 25", basePrice: 550000 },
      { name: "TNT 300", basePrice: 720000 },
      { name: "302R", basePrice: 750000 },
      { name: "302S", basePrice: 780000 },
      { name: "Leoncino 500", basePrice: 950000 },
      { name: "TRK 502", basePrice: 1100000 },
    ],
  },
  {
    name: "CF Moto",
    models: [
      { name: "300NK", basePrice: 680000 },
      { name: "300SR", basePrice: 720000 },
      { name: "650NK", basePrice: 1050000 },
      { name: "650MT", basePrice: 1150000 },
      { name: "650GT", basePrice: 1180000 },
    ],
  },
  {
    name: "Aprilia",
    models: [
      { name: "SR 125", basePrice: 320000 },
      { name: "SR 160", basePrice: 360000 },
      { name: "Storm 125", basePrice: 290000 },
      { name: "RS 457", basePrice: 950000 },
      { name: "Tuono 457", basePrice: 920000 },
    ],
  },
  {
    name: "Vespa",
    models: [
      { name: "VXL 125", basePrice: 380000 },
      { name: "SXL 125", basePrice: 390000 },
      { name: "VXL 150", basePrice: 420000 },
      { name: "SXL 150", basePrice: 430000 },
      { name: "ZX 125", basePrice: 360000 },
    ],
  },
  {
    name: "NIU",
    models: [
      { name: "NQi GTS", basePrice: 280000 },
      { name: "MQi GT", basePrice: 320000 },
      { name: "UQi+", basePrice: 250000 },
      { name: "MQi+", basePrice: 290000 },
    ],
  },
  {
    name: "Yadea",
    models: [
      { name: "G5", basePrice: 220000 },
      { name: "C1S Pro", basePrice: 180000 },
      { name: "Z3", basePrice: 250000 },
      { name: "Z8", basePrice: 280000 },
    ],
  },
  {
    name: "Ather",
    models: [
      { name: "450X", basePrice: 320000 },
      { name: "450S", basePrice: 280000 },
      { name: "450 Apex", basePrice: 350000 },
    ],
  },
  {
    name: "Ola Electric",
    models: [
      { name: "S1 Pro", basePrice: 280000 },
      { name: "S1 Air", basePrice: 220000 },
      { name: "S1 X", basePrice: 180000 },
    ],
  },
  {
    name: "Revolt",
    models: [
      { name: "RV400", basePrice: 320000 },
      { name: "RV400 BRZ", basePrice: 340000 },
    ],
  },
  {
    name: "Jawa",
    models: [
      { name: "Jawa 42", basePrice: 480000 },
      { name: "Jawa Perak", basePrice: 550000 },
      { name: "Jawa 350", basePrice: 520000 },
    ],
  },
  {
    name: "Ducati",
    models: [
      { name: "Scrambler Icon", basePrice: 2200000 },
      { name: "Scrambler Nightshift", basePrice: 2350000 },
      { name: "Monster", basePrice: 2800000 },
      { name: "Panigale V2", basePrice: 4500000 },
      { name: "Multistrada V2", basePrice: 3800000 },
    ],
  },
  {
    name: "BMW Motorrad",
    models: [
      { name: "G 310 R", basePrice: 850000 },
      { name: "G 310 GS", basePrice: 920000 },
      { name: "F 900 R", basePrice: 2500000 },
      { name: "S 1000 RR", basePrice: 5200000 },
      { name: "R 1250 GS", basePrice: 4800000 },
    ],
  },
];

/**
 * Get all brand names
 */
export function getBrandNames(): string[] {
  return VEHICLE_BRANDS.map(brand => brand.name).sort();
}

/**
 * Get models for a specific brand
 */
export function getModelsForBrand(brandName: string): VehicleModel[] {
  const brand = VEHICLE_BRANDS.find(b => b.name === brandName);
  return brand?.models ?? [];
}

/**
 * Get base price for a specific brand and model
 */
export function getBasePrice(brandName: string, modelName: string): number | null {
  const brand = VEHICLE_BRANDS.find(b => b.name === brandName);
  if (!brand) return null;
  
  const model = brand.models.find(m => m.name === modelName);
  return model?.basePrice ?? null;
}
