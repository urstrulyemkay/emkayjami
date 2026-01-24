// Auction types and configurations per PRD

export type AuctionType = "quick" | "flexible" | "extended" | "one_click";

export interface AuctionTypeConfig {
  type: AuctionType;
  title: string;
  description: string;
  expectedBids: string;
  slaMins: number;
  icon: string;
  durations: number[]; // in minutes (0 = no countdown)
  defaultDuration: number;
}

export const AUCTION_TYPES: AuctionTypeConfig[] = [
  {
    type: "quick",
    title: "Quick Auction",
    description: "Get quotation fast. Best for customers in a hurry.",
    expectedBids: "3-5 bids",
    slaMins: 7,
    icon: "⚡",
    durations: [15, 30, 60],
    defaultDuration: 30,
  },
  {
    type: "flexible",
    title: "Flexible Auction",
    description: "Balanced speed & competition. Recommended.",
    expectedBids: "5-8 bids",
    slaMins: 15,
    icon: "⚖️",
    durations: [30, 60, 120],
    defaultDuration: 60,
  },
  {
    type: "extended",
    title: "Extended Auction",
    description: "Best for maximum price. Customers willing to wait.",
    expectedBids: "10-15 bids",
    slaMins: 60,
    icon: "📅",
    durations: [1440, 2880, 4320, 10080], // 1, 2, 3, 7 days in minutes
    defaultDuration: 1440,
  },
  {
    type: "one_click",
    title: "One-Click Buy",
    description: "Instant sale. Single best bid from each broker wins.",
    expectedBids: "Best single bid",
    slaMins: 5,
    icon: "🎯",
    durations: [0], // no countdown
    defaultDuration: 0,
  },
];

export interface Broker {
  id: string;
  name: string;
  tier: number; // 1-5
  city: string;
  winRate: number; // percentage
  avgBidTime: number; // minutes
  recentDeals: number;
  isBlocked?: boolean;
}

// Mock broker data
export const MOCK_BROKERS: Broker[] = [
  { id: "b1", name: "AutoMax Traders", tier: 4, city: "Bangalore", winRate: 72, avgBidTime: 4, recentDeals: 28 },
  { id: "b2", name: "Two Wheeler Hub", tier: 5, city: "Bangalore", winRate: 85, avgBidTime: 3, recentDeals: 45 },
  { id: "b3", name: "Bike Bazaar", tier: 3, city: "Bangalore", winRate: 58, avgBidTime: 8, recentDeals: 15 },
  { id: "b4", name: "Moto Exchange", tier: 4, city: "Mumbai", winRate: 68, avgBidTime: 5, recentDeals: 32 },
  { id: "b5", name: "Speed Wheels", tier: 3, city: "Bangalore", winRate: 55, avgBidTime: 10, recentDeals: 12 },
  { id: "b6", name: "Prime Motors", tier: 5, city: "Delhi", winRate: 82, avgBidTime: 4, recentDeals: 52 },
  { id: "b7", name: "Royal Riders", tier: 4, city: "Bangalore", winRate: 65, avgBidTime: 6, recentDeals: 22 },
  { id: "b8", name: "Urban Bikes", tier: 2, city: "Pune", winRate: 42, avgBidTime: 12, recentDeals: 8 },
];

export type BrokerNetworkType = "my_network" | "drivex_network" | "custom";

export interface BrokerNetworkConfig {
  type: BrokerNetworkType;
  title: string;
  description: string;
  brokerCount: string;
}

export const BROKER_NETWORKS: BrokerNetworkConfig[] = [
  {
    type: "my_network",
    title: "My Network",
    description: "Your trusted brokers with existing relationships",
    brokerCount: "5-10 brokers",
  },
  {
    type: "drivex_network",
    title: "DriveX Network",
    description: "All vetted brokers in your city",
    brokerCount: "50-200 brokers",
  },
  {
    type: "custom",
    title: "Custom Selection",
    description: "Choose specific brokers manually",
    brokerCount: "You choose",
  },
];

export interface Bid {
  id: string;
  brokerId: string;
  brokerName: string; // anonymized in production
  amount: number;
  incentive: number; // commission to sales exec
  timestamp: Date;
  isHighest: boolean;
}

export interface Auction {
  id: string;
  vehicleId: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  type: AuctionType;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "live" | "ended" | "cancelled";
  brokerNetwork: BrokerNetworkType;
  selectedBrokers: string[];
  bids: Bid[];
  winningBid?: Bid;
  slaMetAt?: Date; // when first bid received
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes === 0) return "No timer";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${minutes / 60} hours`;
  return `${minutes / 1440} days`;
}

// Format time remaining
export function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  
  if (diff <= 0) return "00:00:00";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Generate mock bids for simulation
export function generateMockBid(auctionId: string, basePrice: number, bidNumber: number): Bid {
  const brokerIndex = Math.floor(Math.random() * MOCK_BROKERS.length);
  const broker = MOCK_BROKERS[brokerIndex];
  
  // Bids generally increase over time with some variation
  const variation = (Math.random() - 0.3) * 0.05; // -1.5% to +3.5%
  const increment = 0.02 * bidNumber; // 2% per bid roughly
  const amount = Math.round(basePrice * (1 + increment + variation));
  
  const incentive = Math.round(amount * (0.02 + Math.random() * 0.02)); // 2-4% incentive
  
  return {
    id: `bid-${Date.now()}-${bidNumber}`,
    brokerId: broker.id,
    brokerName: `Broker ${bidNumber}`, // anonymized
    amount,
    incentive,
    timestamp: new Date(),
    isHighest: false,
  };
}
