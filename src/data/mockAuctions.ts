// Centralized mock auction data with 100 vehicles
// Images are deterministically assigned based on vehicle ID for consistency

export const VEHICLE_IMAGES: Record<string, string[]> = {
  "Honda": ["/vehicles/activa1.jpg", "/vehicles/activa2.jpg", "/vehicles/activa3.jpg", "/vehicles/activa4.jpg", "/vehicles/activa6.jpg", "/vehicles/activa7.jpg"],
  "KTM": ["/vehicles/duke390.jpg", "/vehicles/duke390_1.jpg", "/vehicles/duke390_2.jpg", "/vehicles/duke390_3.jpg", "/vehicles/duke390_4.jpg", "/vehicles/duke390_5.jpg"],
  "Bajaj": ["/vehicles/pulsar2.jpg", "/vehicles/pulsar4.jpg", "/vehicles/pulsar5.jpg"],
  "Royal Enfield": ["/vehicles/royalenfield1.jpg", "/vehicles/royalenfield2.jpg", "/vehicles/royalenfield3.jpg", "/vehicles/royalenfield4.jpg", "/vehicles/royalenfield5.jpg"],
};

// Helper to get consistent image based on ID
export const getVehicleImage = (make: string, id: string): string => {
  const images = VEHICLE_IMAGES[make] || VEHICLE_IMAGES["Honda"];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return images[hash % images.length];
};

// Get all images for a make (for galleries)
export const getVehicleGallery = (make: string, id: string): { id: string; uri: string; angle: string; captured_at: string }[] => {
  const images = VEHICLE_IMAGES[make] || VEHICLE_IMAGES["Honda"];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  // Rotate array based on hash for variety
  const rotated = [...images.slice(hash % images.length), ...images.slice(0, hash % images.length)];
  
  return rotated.map((uri, idx) => ({
    id: `img-${id}-${idx}`,
    uri,
    angle: ["front", "right", "rear", "left", "dashboard", "engine"][idx % 6],
    captured_at: new Date(Date.now() - idx * 60000).toISOString(),
  }));
};

// Vehicle configurations
const VEHICLE_CONFIGS = [
  // Honda Activa variants (25 vehicles)
  { make: "Honda", model: "Activa 6G", variants: ["DLX", "STD", "Smart"], ccRange: [110], yearRange: [2021, 2022, 2023, 2024, 2025] },
  { make: "Honda", model: "Activa 125", variants: ["Disc", "Drum", "DLX"], ccRange: [125], yearRange: [2020, 2021, 2022, 2023, 2024] },
  { make: "Honda", model: "Dio", variants: ["STD", "Sports", "DLX"], ccRange: [110], yearRange: [2021, 2022, 2023, 2024] },
  
  // KTM Duke variants (25 vehicles)
  { make: "KTM", model: "Duke 390", variants: ["STD", "GP Edition"], ccRange: [373], yearRange: [2020, 2021, 2022, 2023, 2024] },
  { make: "KTM", model: "Duke 250", variants: ["STD", "Dark Edition"], ccRange: [249], yearRange: [2021, 2022, 2023, 2024] },
  { make: "KTM", model: "Duke 200", variants: ["STD"], ccRange: [199], yearRange: [2020, 2021, 2022, 2023] },
  { make: "KTM", model: "RC 390", variants: ["STD", "GP Edition"], ccRange: [373], yearRange: [2021, 2022, 2023, 2024] },
  { make: "KTM", model: "RC 200", variants: ["STD"], ccRange: [199], yearRange: [2020, 2021, 2022, 2023] },
  
  // Bajaj Pulsar variants (25 vehicles)
  { make: "Bajaj", model: "Pulsar NS200", variants: ["ABS", "Non-ABS"], ccRange: [199], yearRange: [2020, 2021, 2022, 2023, 2024] },
  { make: "Bajaj", model: "Pulsar 150", variants: ["Twin Disc", "Neon", "Classic"], ccRange: [150], yearRange: [2019, 2020, 2021, 2022, 2023] },
  { make: "Bajaj", model: "Pulsar RS200", variants: ["ABS"], ccRange: [199], yearRange: [2020, 2021, 2022, 2023] },
  { make: "Bajaj", model: "Pulsar N250", variants: ["STD"], ccRange: [250], yearRange: [2022, 2023, 2024] },
  { make: "Bajaj", model: "Dominar 400", variants: ["STD", "Touring"], ccRange: [373], yearRange: [2020, 2021, 2022, 2023] },
  
  // Royal Enfield variants (25 vehicles)
  { make: "Royal Enfield", model: "Classic 350", variants: ["Halcyon", "Signals", "Dark", "Chrome"], ccRange: [349], yearRange: [2021, 2022, 2023, 2024] },
  { make: "Royal Enfield", model: "Bullet 350", variants: ["STD", "ES"], ccRange: [349], yearRange: [2020, 2021, 2022, 2023] },
  { make: "Royal Enfield", model: "Meteor 350", variants: ["Fireball", "Stellar", "Supernova"], ccRange: [349], yearRange: [2021, 2022, 2023, 2024] },
  { make: "Royal Enfield", model: "Hunter 350", variants: ["Retro", "Metro"], ccRange: [349], yearRange: [2022, 2023, 2024] },
  { make: "Royal Enfield", model: "Himalayan", variants: ["STD", "Sleet"], ccRange: [411], yearRange: [2020, 2021, 2022, 2023] },
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"];
const COLORS = ["Black", "White", "Red", "Blue", "Grey", "Orange", "Green", "Matte Black", "Silver"];
const GRADES = ["A", "A", "B", "B", "B", "C", "C", "D"];
const AUCTION_TYPES = ["quick", "quick", "flexible", "extended", "one_click"];

// Generate 100 mock auctions
export const generateMockAuctions = (): MockAuction[] => {
  const auctions: MockAuction[] = [];
  let auctionIndex = 0;
  
  while (auctions.length < 100) {
    for (const config of VEHICLE_CONFIGS) {
      if (auctions.length >= 100) break;
      
      for (const variant of config.variants) {
        if (auctions.length >= 100) break;
        
        const year = config.yearRange[auctionIndex % config.yearRange.length];
        const id = `auction-${String(auctionIndex + 1).padStart(3, '0')}`;
        const city = CITIES[auctionIndex % CITIES.length];
        const color = COLORS[auctionIndex % COLORS.length];
        const grade = GRADES[auctionIndex % GRADES.length];
        const auctionType = AUCTION_TYPES[auctionIndex % AUCTION_TYPES.length];
        
        // Generate realistic KM based on age
        const age = 2025 - year;
        const baseKms = age * 8000;
        const kms = baseKms + (auctionIndex * 500) % 15000;
        
        // Generate prices based on vehicle type
        const basePrice = config.make === "Royal Enfield" ? 120000 :
                         config.make === "KTM" ? 180000 :
                         config.make === "Bajaj" ? 80000 : 50000;
        const priceVariation = (auctionIndex * 1234) % 50000;
        const highestBid = basePrice + priceVariation - (age * 10000);
        
        // Time remaining varies
        const hoursRemaining = (auctionIndex % 48) + 1;
        const endTime = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);
        
        // Registration format: XX 00 XX 0000
        const regPrefix = city.substring(0, 2).toUpperCase();
        const regYear = String(year).substring(2);
        const regSuffix = String(1000 + auctionIndex).substring(1);
        const registration = `${regPrefix} ${regYear} AB ${regSuffix}`;
        
        auctions.push({
          id,
          vehicle: {
            make: config.make,
            model: config.model,
            variant,
            year,
            kms,
            city,
            grade,
            color,
            registration,
            engineCC: config.ccRange[0],
            vin: `VIN${config.make.substring(0, 3).toUpperCase()}${year}${String(auctionIndex).padStart(6, '0')}`,
          },
          auctionType,
          timeRemaining: hoursRemaining * 60 * 60 * 1000,
          endTime,
          startTime: new Date(endTime.getTime() - 24 * 60 * 60 * 1000),
          currentHighestBid: Math.max(highestBid, 25000),
          currentHighestCommission: Math.floor(highestBid * 0.02) + 500,
          bidCount: 3 + (auctionIndex % 15),
          minimumBidIncrement: 500,
          matchScore: 70 + (auctionIndex % 30),
          conditionScore: 40 + (auctionIndex % 55),
          documents: {
            rc: auctionIndex % 3 !== 0,
            insurance: auctionIndex % 4 !== 0,
            puc: auctionIndex % 5 !== 0,
            challans: auctionIndex % 7,
            loan: auctionIndex % 10 === 0,
          },
          thumbnail: getVehicleImage(config.make, id),
        });
        
        auctionIndex++;
      }
    }
  }
  
  return auctions;
};

export interface MockAuction {
  id: string;
  vehicle: {
    make: string;
    model: string;
    variant: string;
    year: number;
    kms: number;
    city: string;
    grade: string;
    color: string;
    registration: string;
    engineCC: number;
    vin: string;
  };
  auctionType: string;
  timeRemaining: number;
  endTime: Date;
  startTime: Date;
  currentHighestBid: number;
  currentHighestCommission: number;
  bidCount: number;
  minimumBidIncrement: number;
  matchScore: number;
  conditionScore: number;
  documents: {
    rc: boolean;
    insurance: boolean;
    puc: boolean;
    challans: number;
    loan: boolean;
  };
  thumbnail: string;
}

// Pre-generated auctions for consistent usage
export const MOCK_AUCTIONS = generateMockAuctions();

// Get auction by ID
export const getAuctionById = (id: string): MockAuction | undefined => {
  return MOCK_AUCTIONS.find(a => a.id === id) || 
    // Fallback: generate consistent auction for any ID
    generateAuctionForId(id);
};

// Generate a consistent auction for any ID (for unknown IDs)
const generateAuctionForId = (id: string): MockAuction => {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const configIndex = hash % VEHICLE_CONFIGS.length;
  const config = VEHICLE_CONFIGS[configIndex];
  const variant = config.variants[hash % config.variants.length];
  const year = config.yearRange[hash % config.yearRange.length];
  const city = CITIES[hash % CITIES.length];
  const color = COLORS[hash % COLORS.length];
  const grade = GRADES[hash % GRADES.length];
  const auctionType = AUCTION_TYPES[hash % AUCTION_TYPES.length];
  
  const age = 2025 - year;
  const kms = age * 8000 + (hash * 500) % 15000;
  
  const basePrice = config.make === "Royal Enfield" ? 120000 :
                   config.make === "KTM" ? 180000 :
                   config.make === "Bajaj" ? 80000 : 50000;
  const highestBid = Math.max(basePrice - (age * 10000) + (hash % 30000), 25000);
  
  const hoursRemaining = (hash % 48) + 1;
  const endTime = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);
  
  const regPrefix = city.substring(0, 2).toUpperCase();
  const regYear = String(year).substring(2);
  const regSuffix = String(1000 + hash).substring(1, 5);
  
  return {
    id,
    vehicle: {
      make: config.make,
      model: config.model,
      variant,
      year,
      kms,
      city,
      grade,
      color,
      registration: `${regPrefix} ${regYear} AB ${regSuffix}`,
      engineCC: config.ccRange[0],
      vin: `VIN${config.make.substring(0, 3).toUpperCase()}${year}${String(hash).padStart(6, '0')}`,
    },
    auctionType,
    timeRemaining: hoursRemaining * 60 * 60 * 1000,
    endTime,
    startTime: new Date(endTime.getTime() - 24 * 60 * 60 * 1000),
    currentHighestBid: highestBid,
    currentHighestCommission: Math.floor(highestBid * 0.02) + 500,
    bidCount: 3 + (hash % 15),
    minimumBidIncrement: 500,
    matchScore: 70 + (hash % 30),
    conditionScore: 40 + (hash % 55),
    documents: {
      rc: hash % 3 !== 0,
      insurance: hash % 4 !== 0,
      puc: hash % 5 !== 0,
      challans: hash % 7,
      loan: hash % 10 === 0,
    },
    thumbnail: getVehicleImage(config.make, id),
  };
};

// Generate mock bids for an auction
export const generateMockBids = (auctionId: string, count?: number) => {
  const auction = getAuctionById(auctionId);
  const hash = auctionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bidCount = count || (4 + (hash % 8));
  const baseBid = auction?.currentHighestBid || 50000;
  
  const bids = [];
  
  for (let i = 0; i < bidCount; i++) {
    const bidDecrement = i * (500 + (hash % 500));
    const bidAmount = baseBid - bidDecrement;
    const commission = 500 + Math.floor(bidAmount * 0.02) + (i * 100);
    const effectiveScore = bidAmount * 0.85 + commission * 0.15;
    
    bids.push({
      id: `bid-${auctionId}-${i}`,
      auction_id: auctionId,
      broker_id: `broker-${String.fromCharCode(65 + (i % 26)).toLowerCase()}`,
      bid_amount: bidAmount,
      commission_amount: commission,
      effective_score: effectiveScore,
      placed_at: new Date(Date.now() - i * 3 * 60 * 1000).toISOString(),
      status: "active",
      bid_type: i === 0 ? "competitive" : "initial",
    });
  }
  
  return bids.sort((a, b) => b.effective_score - a.effective_score);
};

// Generate mock defects for an auction
export const generateMockDefects = (auctionId: string) => {
  const hash = auctionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const defectCount = 1 + (hash % 5);
  
  const defectTypes = [
    { category: "Body", severity: "minor", descriptions: ["Minor scratches on tank", "Small dent on side panel", "Paint fade on fender"] },
    { category: "Engine", severity: "major", descriptions: ["Slight engine vibration", "Oil seepage noted", "Chain tension needs adjustment"] },
    { category: "Tyres", severity: "minor", descriptions: ["Front tyre wear 40%", "Rear tyre wear 60%", "Minor sidewall scuff"] },
    { category: "Electricals", severity: "minor", descriptions: ["Indicator bulb dim", "Horn slightly weak", "Headlight alignment off"] },
    { category: "Brakes", severity: "major", descriptions: ["Front brake pad wear 50%", "Disc slight scoring", "Brake fluid due for change"] },
  ];
  
  const defects = [];
  for (let i = 0; i < defectCount; i++) {
    const defectType = defectTypes[(hash + i) % defectTypes.length];
    const description = defectType.descriptions[(hash + i) % defectType.descriptions.length];
    
    defects.push({
      id: `defect-${auctionId}-${i}`,
      category: defectType.category,
      severity: defectType.severity,
      description,
      extracted_from: "visual_inspection",
      confidence: 0.85 + (Math.random() * 0.1),
    });
  }
  
  return defects;
};
