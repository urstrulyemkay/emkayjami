// Comprehensive mock data for Broker MVP covering all use cases
// All calculations and statistics are consistent across this file

// ==================== BROKER PROFILE DATA ====================
export interface BrokerStats {
  totalBidsPlaced: number;
  totalWins: number;
  totalLosses: number;
  activeBids: number;
  winRate: number;
  avgBidAmount: number;
  avgCommission: number;
  dealsThisMonth: number;
  winsThisMonth: number;
  disputesThisMonth: number;
  rcTransfersCompleted: number;
  rcTransfersPending: number;
  onTimeRcTransfers: number;
}

export const BROKER_STATS: BrokerStats = {
  totalBidsPlaced: 156,
  totalWins: 47,
  totalLosses: 98,
  activeBids: 11,
  winRate: 30,
  avgBidAmount: 42000,
  avgCommission: 750,
  dealsThisMonth: 12,
  winsThisMonth: 5,
  disputesThisMonth: 0,
  rcTransfersCompleted: 42,
  rcTransfersPending: 5,
  onTimeRcTransfers: 40,
};

// ==================== TRUST SCORE BREAKDOWN ====================
export interface TrustScoreComponent {
  label: string;
  value: number;
  weight: number;
  weightedScore: number;
}

export const calculateTrustScore = (components: Omit<TrustScoreComponent, 'weightedScore'>[]): number => {
  return Math.round(
    components.reduce((sum, c) => sum + (c.value * c.weight / 100), 0)
  );
};

export const TRUST_BREAKDOWN: TrustScoreComponent[] = [
  { label: "Completion ratio", value: 92, weight: 25, weightedScore: 23 },
  { label: "RC compliance", value: 92, weight: 25, weightedScore: 23 },
  { label: "Dispute rate", value: 100, weight: 20, weightedScore: 20 },
  { label: "Payment timeliness", value: 100, weight: 15, weightedScore: 15 },
  { label: "Participation", value: 70, weight: 10, weightedScore: 7 },
  { label: "Tenure", value: 50, weight: 5, weightedScore: 2.5 },
];

// ==================== LEVEL SYSTEM ====================
export interface LevelConfig {
  level: number;
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  benefits: string[];
  supportSLA: string;
  auctionsPerDay: string;
  howToReach?: string;
  requirements?: string[];
}

export const LEVELS: LevelConfig[] = [
  { 
    level: 1, name: "New", minScore: 0, maxScore: 20, 
    color: "text-gray-600", bgColor: "bg-gray-500",
    benefits: ["Access to basic auctions", "Standard notifications"],
    supportSLA: "48 hours", auctionsPerDay: "5",
    howToReach: "Complete KYC verification and place your first bid",
    requirements: ["Complete profile setup", "Verify KYC documents", "Place at least 1 bid"]
  },
  { 
    level: 2, name: "Active", minScore: 21, maxScore: 40, 
    color: "text-blue-600", bgColor: "bg-blue-500",
    benefits: ["Extended auction access", "Email support"],
    supportSLA: "24 hours", auctionsPerDay: "15",
    howToReach: "Win 3 auctions and maintain good payment record",
    requirements: ["Win 3+ auctions", "100% on-time payments", "No active strikes"]
  },
  { 
    level: 3, name: "Preferred", minScore: 41, maxScore: 60, 
    color: "text-green-600", bgColor: "bg-green-500",
    benefits: ["All auction types", "Priority support", "Market insights"],
    supportSLA: "12 hours", auctionsPerDay: "Unlimited",
    howToReach: "Build trust with 10+ deals and timely RC transfers",
    requirements: ["Win 10+ auctions", "90%+ RC transfer compliance", "Maintain 40+ trust score"]
  },
  { 
    level: 4, name: "Trusted", minScore: 61, maxScore: 80, 
    color: "text-amber-600", bgColor: "bg-amber-500",
    benefits: ["Unlimited auctions", "Priority notifications", "Dedicated support"],
    supportSLA: "6 hours", auctionsPerDay: "Unlimited",
    howToReach: "Demonstrate excellence with 25+ deals and zero disputes",
    requirements: ["Win 25+ auctions", "95%+ RC compliance", "Zero disputes in 6 months"]
  },
  { 
    level: 5, name: "Elite", minScore: 81, maxScore: 100, 
    color: "text-purple-600", bgColor: "bg-purple-500",
    benefits: ["Exclusive auctions", "VIP support", "Premium insights", "Early access"],
    supportSLA: "2 hours", auctionsPerDay: "Unlimited",
    howToReach: "Top performer status with 50+ deals and perfect compliance",
    requirements: ["Win 50+ auctions", "100% RC compliance", "Top 10% performer", "1+ year on platform"]
  },
];

export const getLevelFromScore = (score: number): LevelConfig => {
  return LEVELS.find(l => score >= l.minScore && score <= l.maxScore) || LEVELS[0];
};

export const getProgressToNextLevel = (score: number, currentLevel: number): number => {
  const level = LEVELS[currentLevel - 1];
  const nextLevel = LEVELS[currentLevel];
  if (!nextLevel) return 100;
  const range = nextLevel.minScore - level.minScore;
  const progress = score - level.minScore;
  return Math.min(100, Math.max(0, (progress / range) * 100));
};

// ==================== VEHICLE DATA ====================
export interface MockVehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  kms: number;
  city: string;
  grade: "A" | "B" | "C" | "D" | "E";
  gradeDescription: string;
  thumbnail: string;
  images: string[];
  videoUrl: string | null;
  engineCC: number;
  color: string;
}

// Real vehicle inspection images from database
const BIKE_IMAGES: Record<string, string[]> = {
  "Honda": ["/vehicles/activa1.jpg", "/vehicles/activa2.jpg", "/vehicles/activa3.jpg", "/vehicles/activa4.jpg", "/vehicles/activa6.jpg", "/vehicles/activa7.jpg"],
  "TVS": ["/vehicles/pulsar5.jpg", "/vehicles/activa7.jpg"],
  "Bajaj": ["/vehicles/pulsar2.jpg", "/vehicles/pulsar4.jpg", "/vehicles/pulsar5.jpg"],
  "Royal Enfield": ["/vehicles/royalenfield1.jpg", "/vehicles/royalenfield2.jpg", "/vehicles/royalenfield3.jpg", "/vehicles/royalenfield4.jpg", "/vehicles/royalenfield5.jpg"],
  "Yamaha": ["/vehicles/pulsar5.jpg", "/vehicles/duke390.jpg"],
  "Hero": ["/vehicles/activa2.jpg", "/vehicles/activa7.jpg"],
  "Suzuki": ["/vehicles/pulsar5.jpg", "/vehicles/activa7.jpg"],
  "KTM": ["/vehicles/duke390.jpg", "/vehicles/duke390_1.jpg", "/vehicles/duke390_2.jpg", "/vehicles/duke390_3.jpg", "/vehicles/duke390_4.jpg", "/vehicles/duke390_5.jpg"],
  "Kawasaki": ["/vehicles/duke390.jpg", "/vehicles/duke390_2.jpg"],
  "default": ["/vehicles/activa1.jpg", "/vehicles/royalenfield1.jpg", "/vehicles/duke390.jpg", "/vehicles/pulsar2.jpg"],
};

// Helper to get random image for a make
const getRandomImage = (make: string): string => {
  const images = BIKE_IMAGES[make] || BIKE_IMAGES["default"];
  return images[Math.floor(Math.random() * images.length)];
};

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"];
const GRADES: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];
const GRADE_WEIGHTS = [20, 35, 30, 10, 5]; // Distribution percentages
const COLORS = ["Red", "Black", "White", "Blue", "Grey", "Yellow", "Green", "Orange", "Silver", "Brown"];

// Vehicle models with variants
const VEHICLE_MODELS = [
  { make: "Honda", model: "Activa 6G", variant: "DLX", cc: 110 },
  { make: "Honda", model: "Activa 125", variant: "BS6", cc: 125 },
  { make: "Honda", model: "Shine", variant: "CBS", cc: 125 },
  { make: "Honda", model: "Unicorn", variant: "BS6", cc: 160 },
  { make: "Honda", model: "SP 125", variant: "ABS", cc: 125 },
  { make: "Honda", model: "Hornet 2.0", variant: "ABS", cc: 184 },
  { make: "Honda", model: "CB350", variant: "DLX Pro", cc: 350 },
  { make: "TVS", model: "Apache RTR 160", variant: "4V", cc: 160 },
  { make: "TVS", model: "Apache RTR 200", variant: "4V", cc: 200 },
  { make: "TVS", model: "Jupiter", variant: "ZX", cc: 110 },
  { make: "TVS", model: "Ntorq 125", variant: "Race XP", cc: 125 },
  { make: "TVS", model: "Raider 125", variant: "Disc", cc: 125 },
  { make: "TVS", model: "Star City+", variant: "ES", cc: 110 },
  { make: "TVS", model: "XL100", variant: "Heavy Duty", cc: 100 },
  { make: "Bajaj", model: "Pulsar NS200", variant: "ABS", cc: 200 },
  { make: "Bajaj", model: "Pulsar 150", variant: "Twin Disc", cc: 150 },
  { make: "Bajaj", model: "Pulsar RS200", variant: "ABS", cc: 200 },
  { make: "Bajaj", model: "Dominar 400", variant: "UG", cc: 400 },
  { make: "Bajaj", model: "Platina 110", variant: "H-Gear", cc: 110 },
  { make: "Bajaj", model: "CT 125X", variant: "Disc", cc: 125 },
  { make: "Bajaj", model: "Chetak", variant: "Premium", cc: 0 },
  { make: "Yamaha", model: "FZ-S V3", variant: "FI", cc: 149 },
  { make: "Yamaha", model: "FZS-FI", variant: "V4", cc: 149 },
  { make: "Yamaha", model: "MT-15", variant: "V2", cc: 155 },
  { make: "Yamaha", model: "R15 V4", variant: "M", cc: 155 },
  { make: "Yamaha", model: "Fascino 125", variant: "Hybrid", cc: 125 },
  { make: "Yamaha", model: "Ray ZR 125", variant: "Fi", cc: 125 },
  { make: "Royal Enfield", model: "Classic 350", variant: "Signals", cc: 350 },
  { make: "Royal Enfield", model: "Meteor 350", variant: "Stellar", cc: 350 },
  { make: "Royal Enfield", model: "Hunter 350", variant: "Metro", cc: 350 },
  { make: "Royal Enfield", model: "Bullet 350", variant: "ES", cc: 350 },
  { make: "Royal Enfield", model: "Continental GT", variant: "650", cc: 650 },
  { make: "Royal Enfield", model: "Interceptor", variant: "650", cc: 650 },
  { make: "Hero", model: "Splendor Plus", variant: "i3S", cc: 100 },
  { make: "Hero", model: "HF Deluxe", variant: "i3S", cc: 100 },
  { make: "Hero", model: "Passion Pro", variant: "i3S", cc: 110 },
  { make: "Hero", model: "Glamour", variant: "Xtec", cc: 125 },
  { make: "Hero", model: "Xpulse 200", variant: "4V", cc: 200 },
  { make: "Hero", model: "Xtreme 160R", variant: "4V", cc: 160 },
  { make: "Hero", model: "Destini 125", variant: "Xtec", cc: 125 },
  { make: "Suzuki", model: "Access 125", variant: "SE", cc: 125 },
  { make: "Suzuki", model: "Burgman Street", variant: "EX", cc: 125 },
  { make: "Suzuki", model: "Gixxer 150", variant: "ABS", cc: 150 },
  { make: "Suzuki", model: "Gixxer SF", variant: "250", cc: 250 },
  { make: "Suzuki", model: "Avenis", variant: "Race Edition", cc: 125 },
  { make: "KTM", model: "Duke 200", variant: "ABS", cc: 200 },
  { make: "KTM", model: "Duke 250", variant: "ABS", cc: 250 },
  { make: "KTM", model: "Duke 390", variant: "ABS", cc: 390 },
  { make: "KTM", model: "RC 200", variant: "ABS", cc: 200 },
  { make: "KTM", model: "RC 390", variant: "GP", cc: 390 },
];

// Generate weighted random grade
const getRandomGrade = (): "A" | "B" | "C" | "D" | "E" => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < GRADES.length; i++) {
    cumulative += GRADE_WEIGHTS[i];
    if (rand < cumulative) return GRADES[i];
  }
  return "B";
};

// Generate 100 vehicles
export const MOCK_VEHICLES: MockVehicle[] = Array.from({ length: 100 }, (_, i) => {
  const vehicle = VEHICLE_MODELS[i % VEHICLE_MODELS.length];
  const year = 2020 + Math.floor(Math.random() * 5); // 2020-2024
  const kms = Math.floor(5000 + Math.random() * 60000); // 5k-65k km
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const grade = getRandomGrade();
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  const gradeDescriptions: Record<string, string> = {
    A: "Excellent condition, minimal wear",
    B: "Good condition, minor wear",
    C: "Fair condition, some wear",
    D: "Below average, visible wear",
    E: "Poor condition, significant issues",
  };

  return {
    id: `v${i + 1}`,
    make: vehicle.make,
    model: vehicle.model,
    variant: vehicle.variant,
    year,
    kms,
    city,
    grade,
    gradeDescription: gradeDescriptions[grade],
    thumbnail: getRandomImage(vehicle.make),
    images: [],
    videoUrl: null,
    engineCC: vehicle.cc,
    color,
  };
});

// ==================== DOCUMENT STATUS ====================
export interface DocumentStatus {
  rc: boolean;
  insurance: boolean;
  puc: boolean;
  challans: number;
  loan: boolean;
}

// ==================== AUCTION DATA ====================
export type AuctionType = "quick" | "flexible" | "extended" | "one_click";
export type AuctionStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface MockAuction {
  id: string;
  vehicleId: string;
  vehicle: MockVehicle;
  auctionType: AuctionType;
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  timeRemaining: number;
  currentHighestBid: number;
  currentHighestCommission: number;
  bidCount: number;
  minimumBidIncrement: number;
  matchScore: number;
  documents: DocumentStatus;
  oemTrust: "high" | "medium" | "low";
  reservePrice?: number;
}

// Calculate effective score: 85% bid + 15% commission
export const calculateEffectiveScore = (bidAmount: number, commission: number): number => {
  return (bidAmount * 0.85) + (commission * 0.15);
};

const NOW = new Date();
const AUCTION_TYPES: AuctionType[] = ["quick", "flexible", "extended", "one_click"];

// Generate time configurations for different auction types
const getAuctionTimeConfig = (type: AuctionType, index: number) => {
  switch (type) {
    case "quick":
      return { endMins: 5 + (index * 3) + Math.floor(Math.random() * 20) }; // 5-45 mins
    case "flexible":
      return { endMins: 60 + (index * 15) + Math.floor(Math.random() * 120) }; // 1-4 hours
    case "extended":
      return { endMins: 1440 + (index * 720) + Math.floor(Math.random() * 2880) }; // 1-5 days
    case "one_click":
      return { endMins: 1440 }; // 24 hours (not displayed)
    default:
      return { endMins: 60 };
  }
};

// Generate 40 live auctions (10 per type)
export const LIVE_AUCTIONS: MockAuction[] = Array.from({ length: 40 }, (_, i) => {
  const auctionType = AUCTION_TYPES[i % 4];
  const vehicle = MOCK_VEHICLES[i];
  const timeConfig = getAuctionTimeConfig(auctionType, Math.floor(i / 4));
  const endTime = new Date(NOW.getTime() + timeConfig.endMins * 60 * 1000);
  
  // Calculate realistic bid based on vehicle age and grade
  const basePrice = vehicle.engineCC * 150 + (2024 - vehicle.year) * -5000;
  const gradeMultiplier = { A: 1.2, B: 1.0, C: 0.85, D: 0.7, E: 0.5 }[vehicle.grade];
  const currentBid = Math.max(15000, Math.round((basePrice * gradeMultiplier + Math.random() * 20000) / 500) * 500);
  
  return {
    id: `auction-${i + 1}`,
    vehicleId: vehicle.id,
    vehicle,
    auctionType,
    status: "live",
    startTime: new Date(NOW.getTime() - Math.random() * 60 * 60 * 1000),
    endTime,
    timeRemaining: timeConfig.endMins * 60 * 1000,
    currentHighestBid: auctionType === "one_click" ? 0 : currentBid,
    currentHighestCommission: Math.round(currentBid * 0.02),
    bidCount: auctionType === "one_click" ? 0 : Math.floor(3 + Math.random() * 15),
    minimumBidIncrement: 500,
    matchScore: 70 + Math.floor(Math.random() * 25),
    documents: { 
      rc: Math.random() > 0.1, 
      insurance: Math.random() > 0.2, 
      puc: Math.random() > 0.15, 
      challans: Math.floor(Math.random() * 3), 
      loan: Math.random() > 0.8 
    },
    oemTrust: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
  };
});

// Generate 20 upcoming auctions
export interface UpcomingAuction extends Omit<MockAuction, 'currentHighestBid' | 'currentHighestCommission' | 'bidCount' | 'timeRemaining'> {
  estimatedPrice: number;
}

export const UPCOMING_AUCTIONS: UpcomingAuction[] = Array.from({ length: 20 }, (_, i) => {
  const auctionType = AUCTION_TYPES[i % 4];
  const vehicle = MOCK_VEHICLES[40 + i];
  const startMins = 30 + i * 45 + Math.floor(Math.random() * 120); // 30 mins to many hours
  
  const basePrice = vehicle.engineCC * 150 + (2024 - vehicle.year) * -5000;
  const gradeMultiplier = { A: 1.2, B: 1.0, C: 0.85, D: 0.7, E: 0.5 }[vehicle.grade];
  const estimatedPrice = Math.max(15000, Math.round((basePrice * gradeMultiplier) / 1000) * 1000);

  return {
    id: `upcoming-${i + 1}`,
    vehicleId: vehicle.id,
    vehicle,
    auctionType,
    status: "scheduled",
    startTime: new Date(NOW.getTime() + startMins * 60 * 1000),
    endTime: new Date(NOW.getTime() + (startMins + 60) * 60 * 1000),
    minimumBidIncrement: 500,
    matchScore: 70 + Math.floor(Math.random() * 25),
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
    estimatedPrice,
  };
});

// ==================== BID DATA ====================
export type BidStatus = "winning" | "outbid" | "pending" | "won" | "lost" | "expired";

export interface MockBid {
  id: string;
  auctionId: string;
  vehicle: MockVehicle;
  auctionType: AuctionType;
  bidAmount: number;
  commission: number;
  effectiveScore: number;
  status: BidStatus;
  placedAt: Date;
  timeRemaining?: number;
  endTime?: Date;
  currentHighestBid?: number;
  currentHighestCommission?: number;
  wonAt?: Date;
  paymentStatus?: "pending" | "completed";
  deliveryStatus?: "pending_pickup" | "in_transit" | "delivered";
  rcTransferStatus?: "pending" | "in_progress" | "completed";
  rcTransferDeadline?: Date;
  lossReason?: "lower_bid" | "lower_commission" | "auction_cancelled";
  winningBidRange?: string;
}

// Generate 15 live bids
export const LIVE_BIDS: MockBid[] = Array.from({ length: 15 }, (_, i) => {
  const auction = LIVE_AUCTIONS[i];
  const isWinning = Math.random() > 0.4;
  const bidAmount = isWinning 
    ? auction.currentHighestBid 
    : auction.currentHighestBid - (Math.floor(Math.random() * 3) + 1) * 500;
  const commission = Math.round(bidAmount * (0.015 + Math.random() * 0.01));

  return {
    id: `bid-live-${i + 1}`,
    auctionId: auction.id,
    vehicle: auction.vehicle,
    auctionType: auction.auctionType,
    bidAmount,
    commission,
    effectiveScore: calculateEffectiveScore(bidAmount, commission),
    status: isWinning ? "winning" : "outbid",
    placedAt: new Date(NOW.getTime() - Math.random() * 30 * 60 * 1000),
    timeRemaining: auction.timeRemaining,
    endTime: auction.endTime,
    currentHighestBid: auction.currentHighestBid,
    currentHighestCommission: auction.currentHighestCommission,
  };
});

// Generate 25 won bids with various service stages
export const WON_BIDS: MockBid[] = Array.from({ length: 25 }, (_, i) => {
  const vehicle = MOCK_VEHICLES[60 + i];
  const bidAmount = Math.round((25000 + Math.random() * 100000) / 500) * 500;
  const commission = Math.round(bidAmount * 0.02);
  const daysAgo = 1 + i * 3 + Math.floor(Math.random() * 5);
  
  const paymentStatuses: ("pending" | "completed")[] = ["pending", "completed"];
  const deliveryStatuses: ("pending_pickup" | "in_transit" | "delivered")[] = ["pending_pickup", "in_transit", "delivered"];
  const rcStatuses: ("pending" | "in_progress" | "completed")[] = ["pending", "in_progress", "completed"];
  
  // Progress through stages based on index
  const stage = Math.min(Math.floor(i / 5), 4);
  
  return {
    id: `bid-won-${i + 1}`,
    auctionId: `auction-past-${i + 1}`,
    vehicle,
    auctionType: AUCTION_TYPES[i % 4],
    bidAmount,
    commission,
    effectiveScore: calculateEffectiveScore(bidAmount, commission),
    status: "won",
    placedAt: new Date(NOW.getTime() - (daysAgo + 1) * 24 * 60 * 60 * 1000),
    wonAt: new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    paymentStatus: stage >= 1 ? "completed" : paymentStatuses[Math.floor(Math.random() * 2)],
    deliveryStatus: stage >= 2 ? "delivered" : deliveryStatuses[Math.min(stage, 2)],
    rcTransferStatus: stage >= 3 ? "completed" : rcStatuses[Math.min(stage, 2)],
    rcTransferDeadline: new Date(NOW.getTime() + (180 - daysAgo) * 24 * 60 * 60 * 1000),
  };
});

// Generate 20 lost bids
export const LOST_BIDS: MockBid[] = Array.from({ length: 20 }, (_, i) => {
  const vehicle = MOCK_VEHICLES[85 + (i % 15)];
  const bidAmount = Math.round((20000 + Math.random() * 80000) / 500) * 500;
  const winningBid = bidAmount + Math.floor(Math.random() * 5 + 1) * 500;
  
  return {
    id: `bid-lost-${i + 1}`,
    auctionId: `auction-past-lost-${i + 1}`,
    vehicle,
    auctionType: AUCTION_TYPES[i % 4],
    bidAmount,
    commission: Math.round(bidAmount * 0.015),
    effectiveScore: calculateEffectiveScore(bidAmount, bidAmount * 0.015),
    status: "lost",
    placedAt: new Date(NOW.getTime() - (2 + i) * 24 * 60 * 60 * 1000),
    lossReason: ["lower_bid", "lower_commission"][Math.floor(Math.random() * 2)] as "lower_bid" | "lower_commission",
    winningBidRange: `₹${(winningBid / 1000).toFixed(0)}k - ₹${((winningBid + 2000) / 1000).toFixed(0)}k`,
  };
});

// ==================== WALLET TRANSACTIONS ====================
export type TransactionType = "earned" | "spent" | "bonus" | "penalty" | "refund";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: Date;
  balanceAfter: number;
  relatedEntity?: string;
}

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: "txn-1", type: "earned", amount: 150, description: "First bid bonus", timestamp: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000), balanceAfter: 1650 },
  { id: "txn-2", type: "spent", amount: -50, description: "Premium auction access", timestamp: new Date(NOW.getTime() - 1.5 * 24 * 60 * 60 * 1000), balanceAfter: 1600 },
  { id: "txn-3", type: "earned", amount: 200, description: "Deal completion reward", timestamp: new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000), balanceAfter: 1800 },
  { id: "txn-4", type: "bonus", amount: 100, description: "Weekly streak bonus", timestamp: new Date(NOW.getTime() - 12 * 60 * 60 * 1000), balanceAfter: 1900 },
  { id: "txn-5", type: "earned", amount: 75, description: "Quick auction win", timestamp: new Date(NOW.getTime() - 6 * 60 * 60 * 1000), balanceAfter: 1975 },
];

// ==================== HELPER FUNCTIONS ====================
export const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}k`;
};

export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const getAuctionTypeLabel = (type: AuctionType): string => {
  const labels: Record<AuctionType, string> = {
    quick: "Quick",
    flexible: "Flex",
    extended: "Extended",
    one_click: "1-Click",
  };
  return labels[type];
};

// ==================== SHOP & EARNING ====================
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "boost" | "unlock" | "premium";
  icon: string;
  duration?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "shop-1", name: "Priority Bid", description: "Your bid gets priority in tie-breakers", cost: 100, category: "boost", icon: "⚡", duration: "Single use" },
  { id: "shop-2", name: "Early Access", description: "See auctions 30 mins before others", cost: 250, category: "premium", icon: "🎯", duration: "7 days" },
  { id: "shop-3", name: "Bid Shield", description: "Protect your bid from last-second outbids", cost: 150, category: "boost", icon: "🛡️", duration: "Single use" },
  { id: "shop-4", name: "Analytics Pro", description: "Unlock detailed market insights", cost: 500, category: "unlock", icon: "📊", duration: "30 days" },
  { id: "shop-5", name: "Express Support", description: "Priority customer support", cost: 200, category: "premium", icon: "💬", duration: "7 days" },
  { id: "shop-6", name: "Auction Alerts", description: "Custom alerts for preferred vehicles", cost: 75, category: "unlock", icon: "🔔", duration: "14 days" },
];

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  type: "daily" | "weekly" | "achievement";
  action: string;
  coins: number;
}

export const EARNING_OPPORTUNITIES: EarningOpportunity[] = [
  { id: "earn-1", title: "First Bid of Day", description: "Place your first bid today", reward: 25, progress: 0, target: 1, type: "daily", action: "First bid of the day", coins: 25 },
  { id: "earn-2", title: "Win Streak", description: "Win 3 auctions this week", reward: 200, progress: 2, target: 3, type: "weekly", action: "Win an auction", coins: 50 },
  { id: "earn-3", title: "Perfect Payment", description: "Complete 5 payments on time", reward: 150, progress: 4, target: 5, type: "achievement", action: "On-time payment", coins: 30 },
  { id: "earn-4", title: "Explorer", description: "Bid on 3 different auction types", reward: 50, progress: 2, target: 3, type: "weekly", action: "Try new auction type", coins: 15 },
  { id: "earn-5", title: "RC Champion", description: "Complete RC transfer within 90 days", reward: 300, progress: 1, target: 1, type: "achievement", action: "Early RC transfer", coins: 100 },
  { id: "earn-6", title: "Daily Active", description: "Login for 7 consecutive days", reward: 100, progress: 5, target: 7, type: "weekly", action: "Daily login", coins: 10 },
];
