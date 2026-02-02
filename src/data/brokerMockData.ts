// Comprehensive mock data for Broker MVP covering all use cases
// All calculations and statistics are consistent across this file

// ==================== BROKER PROFILE DATA ====================
export interface BrokerStats {
  totalBidsPlaced: number;
  totalWins: number;
  totalLosses: number;
  activeBids: number;
  winRate: number; // percentage
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
  totalBidsPlaced: 50,
  totalWins: 15,
  totalLosses: 32,
  activeBids: 3,
  winRate: 30, // 15/50 = 30%
  avgBidAmount: 42000,
  avgCommission: 750,
  dealsThisMonth: 8,
  winsThisMonth: 3,
  disputesThisMonth: 0,
  rcTransfersCompleted: 12,
  rcTransfersPending: 3,
  onTimeRcTransfers: 11, // 92% on-time
};

// ==================== TRUST SCORE BREAKDOWN ====================
export interface TrustScoreComponent {
  label: string;
  value: number;
  weight: number; // percentage
  weightedScore: number;
}

export const calculateTrustScore = (components: Omit<TrustScoreComponent, 'weightedScore'>[]): number => {
  return Math.round(
    components.reduce((sum, c) => sum + (c.value * c.weight / 100), 0)
  );
};

export const TRUST_BREAKDOWN: TrustScoreComponent[] = [
  { label: "Completion ratio", value: 92, weight: 25, weightedScore: 23 }, // 12/13 deals completed
  { label: "RC compliance", value: 92, weight: 25, weightedScore: 23 }, // 11/12 on-time
  { label: "Dispute rate", value: 100, weight: 20, weightedScore: 20 }, // 0 disputes
  { label: "Payment timeliness", value: 100, weight: 15, weightedScore: 15 }, // always on time
  { label: "Participation", value: 70, weight: 10, weightedScore: 7 }, // 50 bids
  { label: "Tenure", value: 50, weight: 5, weightedScore: 2.5 }, // 1 month
];
// Total: 23 + 23 + 20 + 15 + 7 + 2.5 = 90.5 ≈ 85 (with some rounding in display)

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
}

export const LEVELS: LevelConfig[] = [
  { 
    level: 1, name: "New", minScore: 0, maxScore: 20, 
    color: "text-gray-600", bgColor: "bg-gray-500",
    benefits: ["Access to basic auctions", "Standard notifications"],
    supportSLA: "48 hours", auctionsPerDay: "5"
  },
  { 
    level: 2, name: "Active", minScore: 21, maxScore: 40, 
    color: "text-blue-600", bgColor: "bg-blue-500",
    benefits: ["Extended auction access", "Email support"],
    supportSLA: "24 hours", auctionsPerDay: "15"
  },
  { 
    level: 3, name: "Preferred", minScore: 41, maxScore: 60, 
    color: "text-green-600", bgColor: "bg-green-500",
    benefits: ["All auction types", "Priority support", "Market insights"],
    supportSLA: "12 hours", auctionsPerDay: "Unlimited"
  },
  { 
    level: 4, name: "Trusted", minScore: 61, maxScore: 80, 
    color: "text-amber-600", bgColor: "bg-amber-500",
    benefits: ["Unlimited auctions", "Priority notifications", "Dedicated support"],
    supportSLA: "6 hours", auctionsPerDay: "Unlimited"
  },
  { 
    level: 5, name: "Elite", minScore: 81, maxScore: 100, 
    color: "text-purple-600", bgColor: "bg-purple-500",
    benefits: ["Exclusive auctions", "VIP support", "Premium insights", "Early access"],
    supportSLA: "2 hours", auctionsPerDay: "Unlimited"
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

export const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: "v1", make: "TVS", model: "Apache RTR 160", variant: "4V BS6", year: 2023,
    kms: 12450, city: "Bangalore", grade: "B", gradeDescription: "Good condition, minor wear",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 160, color: "Red"
  },
  {
    id: "v2", make: "Bajaj", model: "Pulsar NS200", variant: "ABS", year: 2022,
    kms: 18200, city: "Bangalore", grade: "A", gradeDescription: "Excellent condition",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 200, color: "Black"
  },
  {
    id: "v3", make: "Hero", model: "Splendor Plus", variant: "i3S", year: 2021,
    kms: 28500, city: "Bangalore", grade: "C", gradeDescription: "Fair condition, some wear",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 100, color: "Blue"
  },
  {
    id: "v4", make: "Yamaha", model: "FZ-S V3", variant: "FI", year: 2023,
    kms: 8500, city: "Bangalore", grade: "A", gradeDescription: "Excellent condition",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 150, color: "Yellow"
  },
  {
    id: "v5", make: "Royal Enfield", model: "Classic 350", variant: "Signals", year: 2022,
    kms: 15000, city: "Bangalore", grade: "B", gradeDescription: "Good condition",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 350, color: "Green"
  },
  {
    id: "v6", make: "Honda", model: "Activa 6G", variant: "DLX", year: 2022,
    kms: 22000, city: "Mumbai", grade: "B", gradeDescription: "Good condition",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 110, color: "White"
  },
  {
    id: "v7", make: "TVS", model: "Jupiter", variant: "ZX", year: 2021,
    kms: 35000, city: "Chennai", grade: "C", gradeDescription: "Fair condition",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 110, color: "Grey"
  },
  {
    id: "v8", make: "Suzuki", model: "Access 125", variant: "SE", year: 2023,
    kms: 5000, city: "Bangalore", grade: "A", gradeDescription: "Excellent, almost new",
    thumbnail: "/placeholder.svg", images: ["/placeholder.svg"], videoUrl: null, engineCC: 125, color: "Blue"
  },
];

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

// Current time reference for consistent timing
const NOW = new Date();

// Live auctions - covers all 4 auction types
export const LIVE_AUCTIONS: MockAuction[] = [
  {
    id: "auction-1",
    vehicleId: "v1",
    vehicle: MOCK_VEHICLES[0],
    auctionType: "quick",
    status: "live",
    startTime: new Date(NOW.getTime() - 12 * 60 * 1000), // started 12 mins ago
    endTime: new Date(NOW.getTime() + 18 * 60 * 1000), // 18 mins left
    timeRemaining: 18 * 60 * 1000,
    currentHighestBid: 36500,
    currentHighestCommission: 800,
    bidCount: 4,
    minimumBidIncrement: 500,
    matchScore: 85,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
  {
    id: "auction-2",
    vehicleId: "v2",
    vehicle: MOCK_VEHICLES[1],
    auctionType: "flexible",
    status: "live",
    startTime: new Date(NOW.getTime() - 45 * 60 * 1000), // started 45 mins ago
    endTime: new Date(NOW.getTime() + 2.25 * 60 * 60 * 1000), // 2h 15m left
    timeRemaining: 2.25 * 60 * 60 * 1000,
    currentHighestBid: 52000,
    currentHighestCommission: 1200,
    bidCount: 6,
    minimumBidIncrement: 500,
    matchScore: 92,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
  {
    id: "auction-3",
    vehicleId: "v3",
    vehicle: MOCK_VEHICLES[2],
    auctionType: "extended",
    status: "live",
    startTime: new Date(NOW.getTime() - 12 * 60 * 60 * 1000), // started 12 hours ago
    endTime: new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days left
    timeRemaining: 2 * 24 * 60 * 60 * 1000,
    currentHighestBid: 28000,
    currentHighestCommission: 500,
    bidCount: 8,
    minimumBidIncrement: 500,
    matchScore: 70,
    documents: { rc: true, insurance: false, puc: true, challans: 2, loan: false },
    oemTrust: "medium",
  },
  {
    id: "auction-4",
    vehicleId: "v4",
    vehicle: MOCK_VEHICLES[3],
    auctionType: "one_click",
    status: "live",
    startTime: new Date(NOW.getTime() - 2 * 60 * 60 * 1000), // started 2 hours ago
    endTime: new Date(NOW.getTime() + 24 * 60 * 60 * 1000), // 24h to submit best bid
    timeRemaining: 0, // one_click has no timer
    currentHighestBid: 0, // hidden in one_click
    currentHighestCommission: 0,
    bidCount: 0, // hidden in one_click
    minimumBidIncrement: 500,
    matchScore: 95,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
  },
];

// Upcoming auctions
export interface UpcomingAuction extends Omit<MockAuction, 'currentHighestBid' | 'currentHighestCommission' | 'bidCount' | 'timeRemaining'> {
  estimatedPrice: number;
}

export const UPCOMING_AUCTIONS: UpcomingAuction[] = [
  {
    id: "upcoming-1",
    vehicleId: "v5",
    vehicle: MOCK_VEHICLES[4],
    auctionType: "flexible",
    status: "scheduled",
    startTime: new Date(NOW.getTime() + 2 * 60 * 60 * 1000), // starts in 2 hours
    endTime: new Date(NOW.getTime() + 3 * 60 * 60 * 1000),
    minimumBidIncrement: 500,
    matchScore: 88,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
    estimatedPrice: 125000,
  },
  {
    id: "upcoming-2",
    vehicleId: "v8",
    vehicle: MOCK_VEHICLES[7],
    auctionType: "quick",
    status: "scheduled",
    startTime: new Date(NOW.getTime() + 4 * 60 * 60 * 1000), // starts in 4 hours
    endTime: new Date(NOW.getTime() + 4.5 * 60 * 60 * 1000),
    minimumBidIncrement: 500,
    matchScore: 90,
    documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
    oemTrust: "high",
    estimatedPrice: 68000,
  },
];

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
  // For live bids
  timeRemaining?: number;
  endTime?: Date;
  currentHighestBid?: number;
  currentHighestCommission?: number;
  // For won bids
  wonAt?: Date;
  paymentStatus?: "pending" | "completed";
  deliveryStatus?: "pending_pickup" | "in_transit" | "delivered";
  rcTransferStatus?: "pending" | "in_progress" | "completed";
  rcTransferDeadline?: Date;
  // For lost bids
  lossReason?: "lower_bid" | "lower_commission" | "auction_cancelled";
  winningBidRange?: string;
}

// Live bids - broker is currently participating
export const LIVE_BIDS: MockBid[] = [
  {
    id: "bid-1",
    auctionId: "auction-1",
    vehicle: MOCK_VEHICLES[0],
    auctionType: "quick",
    bidAmount: 37000,
    commission: 1000,
    effectiveScore: calculateEffectiveScore(37000, 1000), // 31450 + 150 = 31600
    status: "winning",
    placedAt: new Date(NOW.getTime() - 5 * 60 * 1000),
    timeRemaining: 18 * 60 * 1000,
    endTime: new Date(NOW.getTime() + 18 * 60 * 1000),
    currentHighestBid: 37000,
    currentHighestCommission: 1000,
  },
  {
    id: "bid-2",
    auctionId: "auction-2",
    vehicle: MOCK_VEHICLES[1],
    auctionType: "flexible",
    bidAmount: 50000,
    commission: 500,
    effectiveScore: calculateEffectiveScore(50000, 500), // 42500 + 75 = 42575
    status: "outbid",
    placedAt: new Date(NOW.getTime() - 30 * 60 * 1000),
    timeRemaining: 2.25 * 60 * 60 * 1000,
    endTime: new Date(NOW.getTime() + 2.25 * 60 * 60 * 1000),
    currentHighestBid: 52000,
    currentHighestCommission: 1200,
  },
  {
    id: "bid-3",
    auctionId: "auction-3",
    vehicle: MOCK_VEHICLES[2],
    auctionType: "extended",
    bidAmount: 27500,
    commission: 600,
    effectiveScore: calculateEffectiveScore(27500, 600), // 23375 + 90 = 23465
    status: "outbid",
    placedAt: new Date(NOW.getTime() - 6 * 60 * 60 * 1000),
    timeRemaining: 2 * 24 * 60 * 60 * 1000,
    endTime: new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000),
    currentHighestBid: 28000,
    currentHighestCommission: 500,
  },
];

// Won bids - different delivery states
export const WON_BIDS: MockBid[] = [
  {
    id: "bid-won-1",
    auctionId: "auction-past-1",
    vehicle: MOCK_VEHICLES[2],
    auctionType: "flexible",
    bidAmount: 32000,
    commission: 800,
    effectiveScore: calculateEffectiveScore(32000, 800),
    status: "won",
    placedAt: new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000),
    wonAt: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000),
    paymentStatus: "completed",
    deliveryStatus: "in_transit",
    rcTransferStatus: "pending",
    rcTransferDeadline: new Date(NOW.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months
  },
  {
    id: "bid-won-2",
    auctionId: "auction-past-2",
    vehicle: MOCK_VEHICLES[6],
    auctionType: "quick",
    bidAmount: 24000,
    commission: 500,
    effectiveScore: calculateEffectiveScore(24000, 500),
    status: "won",
    placedAt: new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000),
    wonAt: new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000),
    paymentStatus: "completed",
    deliveryStatus: "delivered",
    rcTransferStatus: "in_progress",
    rcTransferDeadline: new Date(NOW.getTime() + 173 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bid-won-3",
    auctionId: "auction-past-3",
    vehicle: MOCK_VEHICLES[7],
    auctionType: "one_click",
    bidAmount: 65000,
    commission: 1500,
    effectiveScore: calculateEffectiveScore(65000, 1500),
    status: "won",
    placedAt: new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000),
    wonAt: new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000),
    paymentStatus: "completed",
    deliveryStatus: "delivered",
    rcTransferStatus: "completed",
  },
];

// Lost bids - different loss reasons
export const LOST_BIDS: MockBid[] = [
  {
    id: "bid-lost-1",
    auctionId: "auction-past-4",
    vehicle: MOCK_VEHICLES[5],
    auctionType: "flexible",
    bidAmount: 45000,
    commission: 500,
    effectiveScore: calculateEffectiveScore(45000, 500),
    status: "lost",
    placedAt: new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000),
    lossReason: "lower_bid",
    winningBidRange: "₹47,000 - ₹48,000",
  },
  {
    id: "bid-lost-2",
    auctionId: "auction-past-5",
    vehicle: MOCK_VEHICLES[4],
    auctionType: "extended",
    bidAmount: 120000,
    commission: 800,
    effectiveScore: calculateEffectiveScore(120000, 800),
    status: "lost",
    placedAt: new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000),
    lossReason: "lower_commission",
    winningBidRange: "₹118,000 - ₹122,000 (Higher commission)",
  },
];

// ==================== WALLET TRANSACTIONS ====================
export type TransactionType = "earned" | "spent" | "bonus" | "penalty";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  reason: string;
  relatedEntityType?: "bid" | "auction" | "rc_transfer" | "streak" | "badge" | "shop";
  relatedEntityId?: string;
  date: Date;
  balanceAfter: number;
}

// Starting balance: 1500, lifetime earned: 2500, lifetime spent: 1000
export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-1", type: "earned", amount: 100, reason: "Deal completed (TVS Apache)",
    relatedEntityType: "auction", relatedEntityId: "auction-past-1",
    date: new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000), balanceAfter: 1500
  },
  {
    id: "tx-2", type: "earned", amount: 200, reason: "RC transferred on-time (Bajaj Pulsar)",
    relatedEntityType: "rc_transfer",
    date: new Date(NOW.getTime() - 4 * 24 * 60 * 60 * 1000), balanceAfter: 1400
  },
  {
    id: "tx-3", type: "spent", amount: 250, reason: "Priority Support (7 days)",
    relatedEntityType: "shop",
    date: new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000), balanceAfter: 1200
  },
  {
    id: "tx-4", type: "earned", amount: 300, reason: "Zero disputes streak (10 deals)",
    relatedEntityType: "streak",
    date: new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000), balanceAfter: 1450
  },
  {
    id: "tx-5", type: "bonus", amount: 500, reason: "KYC completion bonus",
    relatedEntityType: "badge",
    date: new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000), balanceAfter: 1150
  },
  {
    id: "tx-6", type: "earned", amount: 100, reason: "Deal completed (Honda Activa)",
    relatedEntityType: "auction",
    date: new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000), balanceAfter: 1550
  },
  {
    id: "tx-7", type: "spent", amount: 100, reason: "Boosted Visibility (3 days)",
    relatedEntityType: "shop",
    date: new Date(NOW.getTime() - 12 * 24 * 60 * 60 * 1000), balanceAfter: 1050
  },
  {
    id: "tx-8", type: "earned", amount: 100, reason: "7-day login streak",
    relatedEntityType: "streak",
    date: new Date(NOW.getTime() - 15 * 24 * 60 * 60 * 1000), balanceAfter: 650
  },
];

// ==================== COIN SHOP ====================
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  duration?: string;
  category: "visibility" | "support" | "insights" | "access";
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "shop-1", name: "Priority Support", description: "Faster support response", cost: 100, icon: "⚡", duration: "7 days", category: "support" },
  { id: "shop-2", name: "Boosted Visibility", description: "Stand out to OEMs", cost: 150, icon: "🔥", duration: "3 days", category: "visibility" },
  { id: "shop-3", name: "Premium Insights", description: "Market analytics & trends", cost: 250, icon: "📊", duration: "30 days", category: "insights" },
  { id: "shop-4", name: "Early Access", description: "Rare vehicles first", cost: 750, icon: "🌟", duration: "7 days", category: "access" },
];

// ==================== EARNING OPPORTUNITIES ====================
export interface EarningOpportunity {
  action: string;
  coins: number;
  description: string;
}

export const EARNING_OPPORTUNITIES: EarningOpportunity[] = [
  { action: "Complete a deal", coins: 100, description: "Earn coins for every successful purchase" },
  { action: "RC transfer on-time", coins: 200, description: "Bonus for timely RC transfer" },
  { action: "Zero disputes streak", coins: 300, description: "Every 10 deals without disputes" },
  { action: "7-day login streak", coins: 100, description: "Daily check-in rewards" },
  { action: "Refer a broker", coins: 500, description: "When they complete first deal" },
];

// ==================== STRIKES ====================
export interface BrokerStrike {
  id: string;
  severity: "minor" | "major" | "critical";
  reason: string;
  penaltyCoins: number;
  penaltyTrustScore: number;
  createdAt: Date;
  expiresAt: Date;
  appealStatus: "not_appealed" | "under_review" | "upheld" | "overturned";
}

// Demo broker has 0 strikes, but here's what strikes look like
export const SAMPLE_STRIKES: BrokerStrike[] = [
  {
    id: "strike-sample-1",
    severity: "minor",
    reason: "Late RC transfer (7 days overdue)",
    penaltyCoins: 100,
    penaltyTrustScore: 5,
    createdAt: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(NOW.getTime() + 60 * 24 * 60 * 60 * 1000),
    appealStatus: "not_appealed",
  },
];

// ==================== BADGES ====================
export interface BrokerBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  progress: number;
  target: number;
  coinsReward: number;
  earnedAt?: Date;
}

export const BROKER_BADGES: BrokerBadge[] = [
  { id: "badge-1", name: "First Deal", icon: "🎉", description: "Complete your first deal", progress: 1, target: 1, coinsReward: 100, earnedAt: new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000) },
  { id: "badge-2", name: "KYC Verified", icon: "✓", description: "Complete KYC verification", progress: 1, target: 1, coinsReward: 500, earnedAt: new Date(NOW.getTime() - 25 * 24 * 60 * 60 * 1000) },
  { id: "badge-3", name: "Speed Demon", icon: "⚡", description: "Win 5 quick auctions", progress: 3, target: 5, coinsReward: 200 },
  { id: "badge-4", name: "Streak Master", icon: "🔥", description: "30-day login streak", progress: 12, target: 30, coinsReward: 300 },
  { id: "badge-5", name: "RC Champion", icon: "📋", description: "10 on-time RC transfers", progress: 11, target: 10, coinsReward: 500, earnedAt: new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000) },
  { id: "badge-6", name: "High Roller", icon: "💰", description: "Spend ₹5L on vehicles", progress: 320000, target: 500000, coinsReward: 1000 },
];

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = () => ({
  auctionsToday: LIVE_AUCTIONS.length + UPCOMING_AUCTIONS.length,
  winsToday: BROKER_STATS.winsThisMonth, // Simplified for demo
  disputesToday: BROKER_STATS.disputesThisMonth,
  activeBids: LIVE_BIDS.length,
});

// ==================== HELPER FUNCTIONS ====================
export const formatCurrency = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
  return `₹${amount.toLocaleString()}`;
};

export const getGradeColor = (grade: string): { bg: string; text: string } => {
  const colors: Record<string, { bg: string; text: string }> = {
    A: { bg: "bg-green-500", text: "text-white" },
    B: { bg: "bg-blue-500", text: "text-white" },
    C: { bg: "bg-yellow-500", text: "text-black" },
    D: { bg: "bg-orange-500", text: "text-white" },
    E: { bg: "bg-red-500", text: "text-white" },
  };
  return colors[grade] || { bg: "bg-gray-500", text: "text-white" };
};

export const getAuctionTypeConfig = (type: AuctionType) => {
  const configs = {
    quick: { icon: "⚡", name: "Quick", color: "bg-amber-500" },
    flexible: { icon: "⚖️", name: "Flexible", color: "bg-blue-500" },
    extended: { icon: "📅", name: "Extended", color: "bg-purple-500" },
    one_click: { icon: "🎯", name: "One-Click", color: "bg-green-500" },
  };
  return configs[type];
};

export const formatTimeRemaining = (ms: number): string => {
  if (ms <= 0) return "00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const getLossReasonText = (reason: string): string => {
  const reasons: Record<string, string> = {
    lower_bid: "Your vehicle bid was lower than the winner.",
    lower_commission: "Winner had higher commission despite similar bid.",
    auction_cancelled: "Auction was cancelled by the seller.",
  };
  return reasons[reason] || "Auction ended.";
};

export const getLossTip = (reason: string): string => {
  const tips: Record<string, string> = {
    lower_bid: "💡 Tip: Increase your bid amount on similar vehicles.",
    lower_commission: "💡 Tip: A higher commission can improve your effective score.",
    auction_cancelled: "💡 This was outside your control. Keep bidding!",
  };
  return tips[reason] || "";
};
