export type OemRole = "SE" | "SM" | "GM" | "EA";

export type Stage =
  | "registered"
  | "inspected"
  | "listed"
  | "live"
  | "allocated"
  | "transit"
  | "closed"
  | "failed";

export interface Vehicle {
  id: string;
  reg: string;
  make: string;
  model: string;
  year: number;
  cc: number;
  color: string;
  km: number;
  stage: Stage;
  storeId: string;
  seId: string;
  listedPrice?: number;
  highestBid?: number;
  bidCount?: number;
  reservePrice?: number;
  finalPrice?: number;
  winnerBroker?: string;
  registeredAt: string; // ISO
  daysInStage: number;
  failureReason?: string;
  thumbnailIndex?: number;
}

export interface Auction {
  id: string;
  vehicleId: string;
  status: "live" | "scheduled" | "completed" | "failed";
  startTime: string;
  endTime: string;
  reservePrice: number;
  highestBid?: number;
  bidCount: number;
  brokerCount: number;
  winner?: { broker: string; price: number };
  failureReason?: string;
}

export interface SalesExecutive {
  id: string;
  name: string;
  storeId: string;
  phone: string;
  joinedAt: string;
  active: boolean;
  vehiclesActive: number;
  vehiclesClosed30d: number;
  gmv30d: number;
  conversionPct: number;
}

export interface SalesManager {
  id: string;
  name: string;
  storeId: string;
  phone: string;
  email: string;
  canExecute: boolean;
  joinedAt: string;
}

export interface GeneralManager {
  id: string;
  name: string;
  phone: string;
  email: string;
  storeIds: string[];
  joinedAt: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  smId: string;
  gmId: string;
  active: boolean;
  vehiclesActive: number;
  vehiclesClosed30d: number;
  gmv30d: number;
  conversionPct: number;
  avgBidsPerAuction: number;
  attentionFlags: number;
}

export interface Organization {
  id: string;
  name: string;
  brand: string;
  city: string;
  founded: string;
  gstin: string;
  pan: string;
  agreementStatus: "active" | "pending";
  totalStores: number;
  totalGm: number;
  totalSm: number;
  totalSe: number;
}

export interface OemNotification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  scope: OemRole[];
  link?: string;
}

export interface PeriodKpis {
  gmv: number;
  deals: number;
  conversionPct: number;
  avgBids: number;
  avgTimeToFirstBidMins: number;
}
