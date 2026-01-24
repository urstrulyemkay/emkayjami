// Hardcoded 2-wheeler models for Indian market
// Covers ~100 popular models across major OEMs

export interface VehicleModel {
  make: string;
  model: string;
  variants: string[];
  engineCC: number;
  fuelType: "Petrol" | "Electric";
  category: "Scooter" | "Motorcycle" | "Sports" | "Cruiser" | "Commuter";
}

export const VEHICLE_MAKES = [
  "Honda",
  "TVS",
  "Bajaj",
  "Hero",
  "Royal Enfield",
  "Yamaha",
  "Suzuki",
  "KTM",
  "Ather",
  "Ola Electric",
] as const;

export type VehicleMake = typeof VEHICLE_MAKES[number];

export const VEHICLE_MODELS: VehicleModel[] = [
  // Honda
  { make: "Honda", model: "Activa 6G", variants: ["STD", "DLX", "Smart"], engineCC: 110, fuelType: "Petrol", category: "Scooter" },
  { make: "Honda", model: "Activa 125", variants: ["STD", "DLX", "H-Smart"], engineCC: 124, fuelType: "Petrol", category: "Scooter" },
  { make: "Honda", model: "Dio", variants: ["STD", "DLX", "Sports"], engineCC: 110, fuelType: "Petrol", category: "Scooter" },
  { make: "Honda", model: "Shine", variants: ["Drum", "Disc", "Disc CBS"], engineCC: 124, fuelType: "Petrol", category: "Commuter" },
  { make: "Honda", model: "Unicorn", variants: ["STD", "BS6"], engineCC: 160, fuelType: "Petrol", category: "Commuter" },
  { make: "Honda", model: "SP 125", variants: ["Drum", "Disc"], engineCC: 124, fuelType: "Petrol", category: "Commuter" },
  { make: "Honda", model: "CB350", variants: ["DLX", "DLX Pro", "RS"], engineCC: 348, fuelType: "Petrol", category: "Cruiser" },
  { make: "Honda", model: "Hornet 2.0", variants: ["STD", "Repsol"], engineCC: 184, fuelType: "Petrol", category: "Sports" },

  // TVS
  { make: "TVS", model: "Jupiter", variants: ["STD", "ZX", "Classic"], engineCC: 110, fuelType: "Petrol", category: "Scooter" },
  { make: "TVS", model: "Jupiter 125", variants: ["Drum", "Disc", "SmartXonnect"], engineCC: 124, fuelType: "Petrol", category: "Scooter" },
  { make: "TVS", model: "Ntorq 125", variants: ["Race XP", "Super Squad", "XT"], engineCC: 124, fuelType: "Petrol", category: "Scooter" },
  { make: "TVS", model: "Apache RTR 160", variants: ["2V", "4V", "4V Special"], engineCC: 160, fuelType: "Petrol", category: "Sports" },
  { make: "TVS", model: "Apache RTR 200", variants: ["4V", "4V Race Edition"], engineCC: 198, fuelType: "Petrol", category: "Sports" },
  { make: "TVS", model: "Apache RR 310", variants: ["STD", "BTO"], engineCC: 312, fuelType: "Petrol", category: "Sports" },
  { make: "TVS", model: "Raider 125", variants: ["Drum", "Disc", "Super Squad"], engineCC: 124, fuelType: "Petrol", category: "Commuter" },
  { make: "TVS", model: "Ronin", variants: ["SS", "DS", "TD"], engineCC: 225, fuelType: "Petrol", category: "Cruiser" },
  { make: "TVS", model: "Star City Plus", variants: ["STD", "ES"], engineCC: 110, fuelType: "Petrol", category: "Commuter" },
  { make: "TVS", model: "iQube", variants: ["S", "ST", "STX"], engineCC: 0, fuelType: "Electric", category: "Scooter" },

  // Bajaj
  { make: "Bajaj", model: "Pulsar 125", variants: ["Neon", "Split Seat"], engineCC: 125, fuelType: "Petrol", category: "Commuter" },
  { make: "Bajaj", model: "Pulsar 150", variants: ["Twin Disc", "Single Disc"], engineCC: 150, fuelType: "Petrol", category: "Sports" },
  { make: "Bajaj", model: "Pulsar NS160", variants: ["FI ABS"], engineCC: 160, fuelType: "Petrol", category: "Sports" },
  { make: "Bajaj", model: "Pulsar NS200", variants: ["FI ABS"], engineCC: 200, fuelType: "Petrol", category: "Sports" },
  { make: "Bajaj", model: "Pulsar RS200", variants: ["ABS"], engineCC: 200, fuelType: "Petrol", category: "Sports" },
  { make: "Bajaj", model: "Pulsar N250", variants: ["STD", "Dual Channel ABS"], engineCC: 250, fuelType: "Petrol", category: "Sports" },
  { make: "Bajaj", model: "Dominar 250", variants: ["STD"], engineCC: 250, fuelType: "Petrol", category: "Cruiser" },
  { make: "Bajaj", model: "Dominar 400", variants: ["STD", "Touring"], engineCC: 373, fuelType: "Petrol", category: "Cruiser" },
  { make: "Bajaj", model: "Platina 110", variants: ["Drum", "Disc", "H Gear"], engineCC: 110, fuelType: "Petrol", category: "Commuter" },
  { make: "Bajaj", model: "CT 110", variants: ["KS", "ES"], engineCC: 110, fuelType: "Petrol", category: "Commuter" },
  { make: "Bajaj", model: "Avenger 160", variants: ["Street", "Cruise"], engineCC: 160, fuelType: "Petrol", category: "Cruiser" },
  { make: "Bajaj", model: "Chetak", variants: ["Urbane", "Premium"], engineCC: 0, fuelType: "Electric", category: "Scooter" },

  // Hero
  { make: "Hero", model: "Splendor Plus", variants: ["Kick", "Self Start", "i3S"], engineCC: 100, fuelType: "Petrol", category: "Commuter" },
  { make: "Hero", model: "HF Deluxe", variants: ["Kick", "Self Start", "i3S"], engineCC: 100, fuelType: "Petrol", category: "Commuter" },
  { make: "Hero", model: "Passion Plus", variants: ["Drum", "Disc"], engineCC: 110, fuelType: "Petrol", category: "Commuter" },
  { make: "Hero", model: "Glamour", variants: ["Drum", "Disc", "Blaze"], engineCC: 125, fuelType: "Petrol", category: "Commuter" },
  { make: "Hero", model: "Xtreme 160R", variants: ["STD", "Stealth"], engineCC: 163, fuelType: "Petrol", category: "Sports" },
  { make: "Hero", model: "Xpulse 200", variants: ["2V", "4V", "Rally"], engineCC: 200, fuelType: "Petrol", category: "Sports" },
  { make: "Hero", model: "Destini 125", variants: ["LX", "VX", "Prime"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Hero", model: "Pleasure Plus", variants: ["VX", "Platinum", "Sport"], engineCC: 110, fuelType: "Petrol", category: "Scooter" },
  { make: "Hero", model: "Maestro Edge 125", variants: ["VX", "ZX", "Connected"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },

  // Royal Enfield
  { make: "Royal Enfield", model: "Classic 350", variants: ["Redditch", "Signals", "Chrome"], engineCC: 349, fuelType: "Petrol", category: "Cruiser" },
  { make: "Royal Enfield", model: "Bullet 350", variants: ["STD", "ES"], engineCC: 349, fuelType: "Petrol", category: "Cruiser" },
  { make: "Royal Enfield", model: "Meteor 350", variants: ["Fireball", "Stellar", "Supernova"], engineCC: 349, fuelType: "Petrol", category: "Cruiser" },
  { make: "Royal Enfield", model: "Hunter 350", variants: ["Retro", "Metro", "Rebel"], engineCC: 349, fuelType: "Petrol", category: "Cruiser" },
  { make: "Royal Enfield", model: "Himalayan 450", variants: ["STD"], engineCC: 452, fuelType: "Petrol", category: "Sports" },
  { make: "Royal Enfield", model: "Continental GT 650", variants: ["STD", "Mr Clean"], engineCC: 648, fuelType: "Petrol", category: "Sports" },
  { make: "Royal Enfield", model: "Interceptor 650", variants: ["STD", "Chrome"], engineCC: 648, fuelType: "Petrol", category: "Cruiser" },
  { make: "Royal Enfield", model: "Super Meteor 650", variants: ["Astral", "Celestial", "Interstellar"], engineCC: 648, fuelType: "Petrol", category: "Cruiser" },

  // Yamaha
  { make: "Yamaha", model: "FZ-S", variants: ["V3", "FI"], engineCC: 149, fuelType: "Petrol", category: "Sports" },
  { make: "Yamaha", model: "FZS-FI", variants: ["V4", "DLX"], engineCC: 149, fuelType: "Petrol", category: "Sports" },
  { make: "Yamaha", model: "MT-15", variants: ["V2", "V2.0"], engineCC: 155, fuelType: "Petrol", category: "Sports" },
  { make: "Yamaha", model: "R15", variants: ["V4", "V4 M", "V4 Connected"], engineCC: 155, fuelType: "Petrol", category: "Sports" },
  { make: "Yamaha", model: "Fascino 125", variants: ["Drum", "Disc", "Hybrid"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Yamaha", model: "RayZR 125", variants: ["Drum", "Disc", "Street Rally"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Yamaha", model: "Aerox 155", variants: ["STD", "Monster Energy MotoGP"], engineCC: 155, fuelType: "Petrol", category: "Scooter" },

  // Suzuki
  { make: "Suzuki", model: "Access 125", variants: ["Drum", "Disc", "Special"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Suzuki", model: "Burgman Street", variants: ["STD", "EX"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Suzuki", model: "Avenis 125", variants: ["STD", "Race Edition"], engineCC: 125, fuelType: "Petrol", category: "Scooter" },
  { make: "Suzuki", model: "Gixxer 150", variants: ["STD", "ABS"], engineCC: 155, fuelType: "Petrol", category: "Sports" },
  { make: "Suzuki", model: "Gixxer 250", variants: ["STD", "ABS"], engineCC: 249, fuelType: "Petrol", category: "Sports" },
  { make: "Suzuki", model: "V-Strom SX", variants: ["STD"], engineCC: 249, fuelType: "Petrol", category: "Sports" },

  // KTM
  { make: "KTM", model: "Duke 125", variants: ["STD"], engineCC: 125, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "Duke 200", variants: ["STD"], engineCC: 200, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "Duke 250", variants: ["STD"], engineCC: 250, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "Duke 390", variants: ["STD"], engineCC: 373, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "RC 125", variants: ["STD"], engineCC: 125, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "RC 200", variants: ["STD"], engineCC: 200, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "RC 390", variants: ["STD"], engineCC: 373, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "Adventure 250", variants: ["STD"], engineCC: 250, fuelType: "Petrol", category: "Sports" },
  { make: "KTM", model: "Adventure 390", variants: ["STD", "X"], engineCC: 373, fuelType: "Petrol", category: "Sports" },

  // Ather (Electric)
  { make: "Ather", model: "450X", variants: ["Gen 3"], engineCC: 0, fuelType: "Electric", category: "Scooter" },
  { make: "Ather", model: "450S", variants: ["STD"], engineCC: 0, fuelType: "Electric", category: "Scooter" },
  { make: "Ather", model: "Rizta", variants: ["S", "Z"], engineCC: 0, fuelType: "Electric", category: "Scooter" },

  // Ola Electric
  { make: "Ola Electric", model: "S1 Pro", variants: ["STD"], engineCC: 0, fuelType: "Electric", category: "Scooter" },
  { make: "Ola Electric", model: "S1 Air", variants: ["STD"], engineCC: 0, fuelType: "Electric", category: "Scooter" },
  { make: "Ola Electric", model: "S1 X", variants: ["2kWh", "3kWh", "4kWh"], engineCC: 0, fuelType: "Electric", category: "Scooter" },
];

// Search function for vehicle models
export function searchVehicleModels(query: string): VehicleModel[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  return VEHICLE_MODELS.filter(
    (v) =>
      v.make.toLowerCase().includes(lowerQuery) ||
      v.model.toLowerCase().includes(lowerQuery) ||
      `${v.make} ${v.model}`.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

// Get all models for a specific make
export function getModelsByMake(make: string): VehicleModel[] {
  return VEHICLE_MODELS.filter((v) => v.make === make);
}

// Generate years from 2010 to current year
export function getVehicleYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 2010; year--) {
    years.push(year);
  }
  return years;
}

// Common colors for 2-wheelers
export const VEHICLE_COLORS = [
  "Glossy Black",
  "Pearl White",
  "Metallic Red",
  "Metallic Blue",
  "Silver",
  "Matte Black",
  "Racing Green",
  "Orange",
  "Yellow",
  "Grey",
  "Bronze",
  "Brown",
] as const;
