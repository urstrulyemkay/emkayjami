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
const OWNERSHIP = [1, 1, 1, 2, 2, 3]; // More 1st owners for realistic distribution

// Localities for each city (vague area-level, not exact addresses)
export const CITY_LOCALITIES: Record<string, string[]> = {
  "Mumbai": ["Andheri West", "Bandra", "Malad", "Goregaon", "Borivali", "Powai"],
  "Delhi": ["Karol Bagh", "Dwarka", "Rohini", "Janakpuri", "Pitampura", "Nehru Place"],
  "Bangalore": ["Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Electronic City", "Jayanagar"],
  "Chennai": ["T. Nagar", "Anna Nagar", "Velachery", "Adyar", "Porur", "Tambaram"],
  "Hyderabad": ["Madhapur", "Banjara Hills", "Gachibowli", "Kukatpally", "Secunderabad", "Kondapur"],
  "Pune": ["Kothrud", "Hinjewadi", "Baner", "Viman Nagar", "Wakad", "Aundh"],
  "Kolkata": ["Salt Lake", "Park Street", "Tollygunge", "Howrah", "Dum Dum", "Rajarhat"],
  "Ahmedabad": ["Satellite", "Prahlad Nagar", "Navrangpura", "Vastrapur", "Bopal", "SG Highway"],
  "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar", "Raja Park", "Tonk Road"],
  "Lucknow": ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Alambagh", "Mahanagar"],
};

// Approximate distances between major cities (in km) for distance calculation
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  "Mumbai": { "Mumbai": 0, "Delhi": 1400, "Bangalore": 980, "Chennai": 1330, "Hyderabad": 710, "Pune": 150, "Kolkata": 1870, "Ahmedabad": 530, "Jaipur": 1150, "Lucknow": 1350 },
  "Delhi": { "Mumbai": 1400, "Delhi": 0, "Bangalore": 2150, "Chennai": 2180, "Hyderabad": 1550, "Pune": 1420, "Kolkata": 1530, "Ahmedabad": 940, "Jaipur": 280, "Lucknow": 550 },
  "Bangalore": { "Mumbai": 980, "Delhi": 2150, "Bangalore": 0, "Chennai": 350, "Hyderabad": 570, "Pune": 840, "Kolkata": 1870, "Ahmedabad": 1500, "Jaipur": 1870, "Lucknow": 2000 },
  "Chennai": { "Mumbai": 1330, "Delhi": 2180, "Bangalore": 350, "Chennai": 0, "Hyderabad": 630, "Pune": 1170, "Kolkata": 1670, "Ahmedabad": 1850, "Jaipur": 1930, "Lucknow": 2060 },
  "Hyderabad": { "Mumbai": 710, "Delhi": 1550, "Bangalore": 570, "Chennai": 630, "Hyderabad": 0, "Pune": 560, "Kolkata": 1500, "Ahmedabad": 1180, "Jaipur": 1400, "Lucknow": 1300 },
  "Pune": { "Mumbai": 150, "Delhi": 1420, "Bangalore": 840, "Chennai": 1170, "Hyderabad": 560, "Pune": 0, "Kolkata": 1880, "Ahmedabad": 660, "Jaipur": 1180, "Lucknow": 1370 },
  "Kolkata": { "Mumbai": 1870, "Delhi": 1530, "Bangalore": 1870, "Chennai": 1670, "Hyderabad": 1500, "Pune": 1880, "Kolkata": 0, "Ahmedabad": 1930, "Jaipur": 1500, "Lucknow": 990 },
  "Ahmedabad": { "Mumbai": 530, "Delhi": 940, "Bangalore": 1500, "Chennai": 1850, "Hyderabad": 1180, "Pune": 660, "Kolkata": 1930, "Ahmedabad": 0, "Jaipur": 670, "Lucknow": 850 },
  "Jaipur": { "Mumbai": 1150, "Delhi": 280, "Bangalore": 1870, "Chennai": 1930, "Hyderabad": 1400, "Pune": 1180, "Kolkata": 1500, "Ahmedabad": 670, "Jaipur": 0, "Lucknow": 580 },
  "Lucknow": { "Mumbai": 1350, "Delhi": 550, "Bangalore": 2000, "Chennai": 2060, "Hyderabad": 1300, "Pune": 1370, "Kolkata": 990, "Ahmedabad": 850, "Jaipur": 580, "Lucknow": 0 },
};

// Get distance between two cities
export const getDistanceBetweenCities = (city1: string, city2: string): number => {
  // Same city - return random local distance (5-25 km)
  if (city1 === city2) {
    const hash = city1.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 5 + (hash % 21);
  }
  return CITY_DISTANCES[city1]?.[city2] || CITY_DISTANCES[city2]?.[city1] || 500;
};

// Get locality for a city based on hash
export const getLocalityForCity = (city: string, hash: number): string => {
  const localities = CITY_LOCALITIES[city] || CITY_LOCALITIES["Bangalore"];
  return localities[hash % localities.length];
};

// Generate 100 mock auctions with variety (interleaved makes)
export const generateMockAuctions = (): MockAuction[] => {
  const auctions: MockAuction[] = [];
  
  // Create expanded list with all config+variant combinations
  const expandedConfigs: { config: typeof VEHICLE_CONFIGS[0]; variantIndex: number }[] = [];
  for (const config of VEHICLE_CONFIGS) {
    for (let v = 0; v < config.variants.length; v++) {
      expandedConfigs.push({ config, variantIndex: v });
    }
  }
  
  // Shuffle to interleave different makes (deterministic)
  const shuffled = expandedConfigs.sort((a, b) => {
    const hashA = a.config.make.charCodeAt(0) + a.variantIndex * 7;
    const hashB = b.config.make.charCodeAt(0) + b.variantIndex * 7;
    return hashA - hashB;
  });
  
  for (let i = 0; i < Math.min(100, shuffled.length); i++) {
    const { config, variantIndex } = shuffled[i];
    const variant = config.variants[variantIndex];
    const year = config.yearRange[i % config.yearRange.length];
    const city = CITIES[i % CITIES.length];
    const color = COLORS[i % COLORS.length];
    const grade = GRADES[i % GRADES.length];
    const auctionType = AUCTION_TYPES[i % AUCTION_TYPES.length];
    
    // Generate clean slug: honda-activa-6g-2022-kol-001
    const cityCode = city.substring(0, 3).toLowerCase();
    const modelSlug = `${config.make}-${config.model}`.toLowerCase().replace(/\s+/g, '-');
    const slug = `${modelSlug}-${year}-${cityCode}-${String(i + 1).padStart(3, '0')}`;
    const id = slug; // Use slug as ID for clean URLs
    
    const age = 2025 - year;
    const kms = age * 8000 + (i * 500) % 15000;
    
    const basePrice = config.make === "Royal Enfield" ? 120000 :
                     config.make === "KTM" ? 180000 :
                     config.make === "Bajaj" ? 80000 : 50000;
    const priceVariation = (i * 1234) % 50000;
    const highestBid = basePrice + priceVariation - (age * 10000);
    
    const hoursRemaining = (i % 48) + 1;
    const endTime = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000);
    
    const regPrefix = city.substring(0, 2).toUpperCase();
    const regYear = String(year).substring(2);
    const regSuffix = String(1000 + i).substring(1);
    const registration = `${regPrefix} ${regYear} AB ${regSuffix}`;
    
    const locality = getLocalityForCity(city, i);
    
    auctions.push({
      id,
      slug,
      vehicle: {
        make: config.make,
        model: config.model,
        variant,
        year,
        kms,
        city,
        locality,
        grade,
        color,
        registration,
        engineCC: config.ccRange[0],
        vin: `VIN${config.make.substring(0, 3).toUpperCase()}${year}${String(i).padStart(6, '0')}`,
        ownership: OWNERSHIP[i % OWNERSHIP.length],
      },
      auctionType,
      timeRemaining: hoursRemaining * 60 * 60 * 1000,
      endTime,
      startTime: new Date(endTime.getTime() - 24 * 60 * 60 * 1000),
      currentHighestBid: Math.max(highestBid, 25000),
      currentHighestCommission: Math.floor(highestBid * 0.02) + 500,
      bidCount: 3 + (i % 15),
      minimumBidIncrement: 500,
      matchScore: 70 + (i % 30),
      conditionScore: 40 + (i % 55),
      documents: {
        rc: i % 3 !== 0,
        insurance: i % 4 !== 0,
        puc: i % 5 !== 0,
        challans: (i % 7) * 500,
        loan: i % 10 === 0,
      },
      thumbnail: getVehicleImage(config.make, id),
    });
  }
  
  return auctions;
};

export interface MockAuction {
  id: string;
  slug: string;
  vehicle: {
    make: string;
    model: string;
    variant: string;
    year: number;
    kms: number;
    city: string;
    locality: string;
    grade: string;
    color: string;
    registration: string;
    engineCC: number;
    vin: string;
    ownership: number; // 1 = 1st owner, 2 = 2nd owner, etc.
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

// Get auction by ID or slug
export const getAuctionById = (idOrSlug: string): MockAuction | undefined => {
  return MOCK_AUCTIONS.find(a => a.id === idOrSlug || a.slug === idOrSlug) || 
    // Fallback: generate consistent auction for any ID
    generateAuctionForId(idOrSlug);
};

// Get auction by slug only
export const getAuctionBySlug = (slug: string): MockAuction | undefined => {
  return MOCK_AUCTIONS.find(a => a.slug === slug);
};

// Generate a consistent auction for any ID (for unknown IDs/slugs)
const generateAuctionForId = (idOrSlug: string): MockAuction => {
  const hash = idOrSlug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const configIndex = hash % VEHICLE_CONFIGS.length;
  const config = VEHICLE_CONFIGS[configIndex];
  const variant = config.variants[hash % config.variants.length];
  const year = config.yearRange[hash % config.yearRange.length];
  const city = CITIES[hash % CITIES.length];
  const locality = getLocalityForCity(city, hash);
  const color = COLORS[hash % COLORS.length];
  const grade = GRADES[hash % GRADES.length];
  const auctionType = AUCTION_TYPES[hash % AUCTION_TYPES.length];
  
  const cityCode = city.substring(0, 3).toLowerCase();
  const modelSlug = `${config.make}-${config.model}`.toLowerCase().replace(/\s+/g, '-');
  const slug = `${modelSlug}-${year}-${cityCode}-${String(hash % 1000).padStart(3, '0')}`;
  
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
    id: slug,
    slug,
    vehicle: {
      make: config.make,
      model: config.model,
      variant,
      year,
      kms,
      city,
      locality,
      grade,
      color,
      registration: `${regPrefix} ${regYear} AB ${regSuffix}`,
      engineCC: config.ccRange[0],
      vin: `VIN${config.make.substring(0, 3).toUpperCase()}${year}${String(hash).padStart(6, '0')}`,
      ownership: OWNERSHIP[hash % OWNERSHIP.length],
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
      challans: (hash % 7) * 500,
      loan: hash % 10 === 0,
    },
    thumbnail: getVehicleImage(config.make, slug),
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
