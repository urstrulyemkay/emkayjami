import type {
  Vehicle,
  Store,
  SalesManager,
  SalesExecutive,
  GeneralManager,
  Auction,
  Organization,
  OemNotification,
  PeriodKpis,
  Stage,
} from "./oemTypes";

// Single source of truth — Ananda Honda, 4 stores, 1 GM, 4 SMs, 12 SEs, 39 vehicles
export const ORG: Organization = {
  id: "org-ananda",
  name: "Ananda Honda Pvt Ltd",
  brand: "Honda",
  city: "Bengaluru",
  founded: "2008",
  gstin: "29AABCA1234B1Z5",
  pan: "AABCA1234B",
  agreementStatus: "active",
  totalStores: 4,
  totalGm: 1,
  totalSm: 4,
  totalSe: 12,
};

export const GM: GeneralManager = {
  id: "gm-1",
  name: "Rakesh Bhat",
  phone: "+91 98450 11111",
  email: "rakesh@anandahonda.com",
  storeIds: ["s-jp", "s-kor", "s-whf", "s-hsr"],
  joinedAt: "2019-04-12",
};

export const STORES: Store[] = [
  {
    id: "s-jp",
    name: "Ananda Honda — Jayanagar",
    city: "Bengaluru",
    address: "12th Main, Jayanagar 4th Block",
    smId: "sm-jp",
    gmId: "gm-1",
    active: true,
    vehiclesActive: 11,
    vehiclesClosed30d: 18,
    gmv30d: 386000,
    conversionPct: 78,
    avgBidsPerAuction: 7.2,
    attentionFlags: 2,
  },
  {
    id: "s-kor",
    name: "Ananda Honda — Koramangala",
    city: "Bengaluru",
    address: "80 Feet Road, Koramangala 4th Block",
    smId: "sm-kor",
    gmId: "gm-1",
    active: true,
    vehiclesActive: 9,
    vehiclesClosed30d: 21,
    gmv30d: 442000,
    conversionPct: 82,
    avgBidsPerAuction: 8.1,
    attentionFlags: 0,
  },
  {
    id: "s-whf",
    name: "Ananda Honda — Whitefield",
    city: "Bengaluru",
    address: "ITPL Main Road, Whitefield",
    smId: "sm-whf",
    gmId: "gm-1",
    active: true,
    vehiclesActive: 12,
    vehiclesClosed30d: 14,
    gmv30d: 198000,
    conversionPct: 58,
    avgBidsPerAuction: 4.8,
    attentionFlags: 4,
  },
  {
    id: "s-hsr",
    name: "Ananda Honda — HSR Layout",
    city: "Bengaluru",
    address: "27th Main, HSR Sector 2",
    smId: "sm-hsr",
    gmId: "gm-1",
    active: true,
    vehiclesActive: 7,
    vehiclesClosed30d: 16,
    gmv30d: 282000,
    conversionPct: 71,
    avgBidsPerAuction: 6.4,
    attentionFlags: 1,
  },
];

export const SMS: SalesManager[] = [
  { id: "sm-jp", name: "Vinay Shetty", storeId: "s-jp", phone: "+91 98801 22222", email: "vinay@anandahonda.com", canExecute: true, joinedAt: "2020-06-01" },
  { id: "sm-kor", name: "Anita Rao", storeId: "s-kor", phone: "+91 98802 33333", email: "anita@anandahonda.com", canExecute: false, joinedAt: "2021-01-15" },
  { id: "sm-whf", name: "Suresh Iyer", storeId: "s-whf", phone: "+91 98803 44444", email: "suresh@anandahonda.com", canExecute: false, joinedAt: "2022-08-20" },
  { id: "sm-hsr", name: "Priya Menon", storeId: "s-hsr", phone: "+91 98804 55555", email: "priya@anandahonda.com", canExecute: true, joinedAt: "2021-11-05" },
];

export const SES: SalesExecutive[] = [
  // Jayanagar — 3 SEs
  { id: "se-jp-1", name: "Karan Joshi", storeId: "s-jp", phone: "+91 90001 11101", joinedAt: "2023-01-10", active: true, vehiclesActive: 4, vehiclesClosed30d: 7, gmv30d: 152000, conversionPct: 81 },
  { id: "se-jp-2", name: "Divya Pillai", storeId: "s-jp", phone: "+91 90001 11102", joinedAt: "2023-04-22", active: true, vehiclesActive: 4, vehiclesClosed30d: 6, gmv30d: 128000, conversionPct: 75 },
  { id: "se-jp-3", name: "Mohan Das", storeId: "s-jp", phone: "+91 90001 11103", joinedAt: "2024-02-14", active: true, vehiclesActive: 3, vehiclesClosed30d: 5, gmv30d: 106000, conversionPct: 72 },
  // Koramangala — 3 SEs
  { id: "se-kor-1", name: "Neha Sharma", storeId: "s-kor", phone: "+91 90002 22201", joinedAt: "2022-09-01", active: true, vehiclesActive: 3, vehiclesClosed30d: 8, gmv30d: 178000, conversionPct: 88 },
  { id: "se-kor-2", name: "Rohit Verma", storeId: "s-kor", phone: "+91 90002 22202", joinedAt: "2023-03-15", active: true, vehiclesActive: 3, vehiclesClosed30d: 7, gmv30d: 142000, conversionPct: 80 },
  { id: "se-kor-3", name: "Sana Khan", storeId: "s-kor", phone: "+91 90002 22203", joinedAt: "2023-11-08", active: true, vehiclesActive: 3, vehiclesClosed30d: 6, gmv30d: 122000, conversionPct: 78 },
  // Whitefield — 3 SEs
  { id: "se-whf-1", name: "Arun Kumar", storeId: "s-whf", phone: "+91 90003 33301", joinedAt: "2022-05-20", active: true, vehiclesActive: 5, vehiclesClosed30d: 5, gmv30d: 78000, conversionPct: 56 },
  { id: "se-whf-2", name: "Meera Nair", storeId: "s-whf", phone: "+91 90003 33302", joinedAt: "2024-01-04", active: true, vehiclesActive: 4, vehiclesClosed30d: 5, gmv30d: 70000, conversionPct: 60 },
  { id: "se-whf-3", name: "Tarun Bose", storeId: "s-whf", phone: "+91 90003 33303", joinedAt: "2024-06-12", active: false, vehiclesActive: 3, vehiclesClosed30d: 4, gmv30d: 50000, conversionPct: 52 },
  // HSR — 3 SEs
  { id: "se-hsr-1", name: "Ishaan Reddy", storeId: "s-hsr", phone: "+91 90004 44401", joinedAt: "2022-12-01", active: true, vehiclesActive: 3, vehiclesClosed30d: 6, gmv30d: 112000, conversionPct: 74 },
  { id: "se-hsr-2", name: "Asha Gowda", storeId: "s-hsr", phone: "+91 90004 44402", joinedAt: "2023-07-09", active: true, vehiclesActive: 2, vehiclesClosed30d: 6, gmv30d: 98000, conversionPct: 70 },
  { id: "se-hsr-3", name: "Vikram Rao", storeId: "s-hsr", phone: "+91 90004 44403", joinedAt: "2024-03-18", active: true, vehiclesActive: 2, vehiclesClosed30d: 4, gmv30d: 72000, conversionPct: 68 },
];

const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString();

const mkVeh = (
  i: number,
  reg: string,
  model: string,
  year: number,
  cc: number,
  color: string,
  km: number,
  stage: Stage,
  storeId: string,
  seId: string,
  extra: Partial<Vehicle> = {},
): Vehicle => ({
  id: `v-${i}`,
  reg,
  make: "Honda",
  model,
  year,
  cc,
  color,
  km,
  stage,
  storeId,
  seId,
  registeredAt: daysAgo(extra.daysInStage ?? 1),
  daysInStage: extra.daysInStage ?? 1,
  thumbnailIndex: i % 6,
  ...extra,
});

// 39 vehicles spread across stores and stages
export const VEHICLES: Vehicle[] = [
  // s-jp (11 active)
  mkVeh(1, "KA51AB1001", "Activa 6G", 2021, 110, "Black", 18450, "registered", "s-jp", "se-jp-1", { daysInStage: 0 }),
  mkVeh(2, "KA51AB1002", "Shine 125", 2020, 125, "Red", 24300, "inspected", "s-jp", "se-jp-2", { daysInStage: 1 }),
  mkVeh(3, "KA51AB1003", "Unicorn 160", 2022, 160, "Blue", 11200, "listed", "s-jp", "se-jp-1", { daysInStage: 0, listedPrice: 78000 }),
  mkVeh(4, "KA51AB1004", "Dio", 2019, 110, "White", 32100, "live", "s-jp", "se-jp-3", { daysInStage: 0, listedPrice: 42000, highestBid: 41500, bidCount: 6 }),
  mkVeh(5, "KA51AB1005", "Activa 125", 2021, 125, "Grey", 19800, "live", "s-jp", "se-jp-2", { daysInStage: 0, listedPrice: 58000, highestBid: 56200, bidCount: 9 }),
  mkVeh(6, "KA51AB1006", "CB Hornet", 2020, 160, "Red", 27500, "allocated", "s-jp", "se-jp-1", { daysInStage: 1, finalPrice: 64000, winnerBroker: "Skyline Motors" }),
  mkVeh(7, "KA51AB1007", "SP 125", 2022, 125, "Black", 8900, "transit", "s-jp", "se-jp-2", { daysInStage: 2, finalPrice: 72000, winnerBroker: "Nexa Wheels" }),
  mkVeh(8, "KA51AB1008", "Activa 6G", 2020, 110, "Silver", 21400, "transit", "s-jp", "se-jp-3", { daysInStage: 1, finalPrice: 48000, winnerBroker: "Prime Bikes" }),
  mkVeh(9, "KA51AB1009", "Shine 125", 2019, 125, "Black", 36200, "closed", "s-jp", "se-jp-1", { daysInStage: 4, finalPrice: 39000, winnerBroker: "Skyline Motors" }),
  mkVeh(10, "KA51AB1010", "Dream Yuga", 2018, 110, "Blue", 41100, "closed", "s-jp", "se-jp-2", { daysInStage: 6, finalPrice: 32000, winnerBroker: "Urban Riders" }),
  mkVeh(11, "KA51AB1011", "Unicorn 160", 2021, 160, "Red", 15600, "failed", "s-jp", "se-jp-3", { daysInStage: 2, failureReason: "No bids — reserve too high" }),

  // s-kor (9 active)
  mkVeh(12, "KA52BC2001", "Activa 6G", 2022, 110, "Pearl White", 9800, "registered", "s-kor", "se-kor-1", { daysInStage: 0 }),
  mkVeh(13, "KA52BC2002", "SP 125", 2021, 125, "Red", 16400, "inspected", "s-kor", "se-kor-2"),
  mkVeh(14, "KA52BC2003", "Hornet 2.0", 2022, 184, "Yellow", 12100, "listed", "s-kor", "se-kor-3", { listedPrice: 92000 }),
  mkVeh(15, "KA52BC2004", "Activa 125", 2020, 125, "Black", 22300, "live", "s-kor", "se-kor-1", { listedPrice: 54000, highestBid: 53800, bidCount: 11 }),
  mkVeh(16, "KA52BC2005", "Shine 125", 2021, 125, "Blue", 17900, "live", "s-kor", "se-kor-2", { listedPrice: 56000, highestBid: 55400, bidCount: 8 }),
  mkVeh(17, "KA52BC2006", "Dio", 2020, 110, "Red", 28400, "allocated", "s-kor", "se-kor-3", { finalPrice: 38000, winnerBroker: "Nexa Wheels" }),
  mkVeh(18, "KA52BC2007", "CB350", 2023, 348, "Matte Black", 4200, "transit", "s-kor", "se-kor-1", { finalPrice: 158000, winnerBroker: "Royal Motors" }),
  mkVeh(19, "KA52BC2008", "SP 160", 2022, 160, "Sports Red", 10800, "closed", "s-kor", "se-kor-2", { daysInStage: 3, finalPrice: 88000, winnerBroker: "Skyline Motors" }),
  mkVeh(20, "KA52BC2009", "Activa 6G", 2021, 110, "Grey", 19200, "closed", "s-kor", "se-kor-3", { daysInStage: 5, finalPrice: 51000, winnerBroker: "Urban Riders" }),

  // s-whf (12 active — many flagged)
  mkVeh(21, "KA53CD3001", "Activa 6G", 2019, 110, "White", 38900, "registered", "s-whf", "se-whf-1", { daysInStage: 4 }),
  mkVeh(22, "KA53CD3002", "Dio", 2018, 110, "Red", 44200, "inspected", "s-whf", "se-whf-2", { daysInStage: 5 }),
  mkVeh(23, "KA53CD3003", "Shine 125", 2017, 125, "Black", 52100, "listed", "s-whf", "se-whf-1", { daysInStage: 6, listedPrice: 28000 }),
  mkVeh(24, "KA53CD3004", "Unicorn 150", 2018, 150, "Blue", 41800, "listed", "s-whf", "se-whf-3", { daysInStage: 4, listedPrice: 38000 }),
  mkVeh(25, "KA53CD3005", "Activa 125", 2019, 125, "Silver", 32400, "live", "s-whf", "se-whf-2", { listedPrice: 44000, highestBid: 38000, bidCount: 3 }),
  mkVeh(26, "KA53CD3006", "Dream Yuga", 2017, 110, "Black", 49600, "live", "s-whf", "se-whf-1", { listedPrice: 22000, bidCount: 0 }),
  mkVeh(27, "KA53CD3007", "Activa 6G", 2020, 110, "Blue", 26100, "allocated", "s-whf", "se-whf-2", { finalPrice: 42000, winnerBroker: "Prime Bikes" }),
  mkVeh(28, "KA53CD3008", "Shine 125", 2018, 125, "Red", 39200, "transit", "s-whf", "se-whf-1", { finalPrice: 32000, winnerBroker: "Urban Riders" }),
  mkVeh(29, "KA53CD3009", "Dio", 2019, 110, "White", 31100, "closed", "s-whf", "se-whf-2", { daysInStage: 7, finalPrice: 28000, winnerBroker: "Prime Bikes" }),
  mkVeh(30, "KA53CD3010", "SP 125", 2018, 125, "Grey", 42700, "failed", "s-whf", "se-whf-1", { daysInStage: 3, failureReason: "Reserve not met" }),
  mkVeh(31, "KA53CD3011", "Unicorn 160", 2017, 160, "Red", 51900, "failed", "s-whf", "se-whf-3", { daysInStage: 5, failureReason: "Insufficient bidder interest" }),
  mkVeh(32, "KA53CD3012", "Activa 6G", 2018, 110, "Black", 44800, "failed", "s-whf", "se-whf-2", { daysInStage: 2, failureReason: "Below reserve by ₹4,000" }),

  // s-hsr (7 active)
  mkVeh(33, "KA54DE4001", "Activa 6G", 2022, 110, "Pearl Yellow", 7200, "registered", "s-hsr", "se-hsr-1", { daysInStage: 0 }),
  mkVeh(34, "KA54DE4002", "SP 160", 2023, 160, "Sports Red", 3400, "inspected", "s-hsr", "se-hsr-2"),
  mkVeh(35, "KA54DE4003", "Hornet 2.0", 2021, 184, "Black", 14600, "listed", "s-hsr", "se-hsr-3", { listedPrice: 84000 }),
  mkVeh(36, "KA54DE4004", "Activa 125", 2022, 125, "Blue", 11800, "live", "s-hsr", "se-hsr-1", { listedPrice: 62000, highestBid: 60800, bidCount: 7 }),
  mkVeh(37, "KA54DE4005", "Shine 125", 2021, 125, "Black", 18400, "live", "s-hsr", "se-hsr-2", { listedPrice: 52000, highestBid: 51200, bidCount: 5 }),
  mkVeh(38, "KA54DE4006", "CB350", 2022, 348, "Chrome Silver", 9100, "allocated", "s-hsr", "se-hsr-1", { finalPrice: 142000, winnerBroker: "Royal Motors" }),
  mkVeh(39, "KA54DE4007", "Dio", 2020, 110, "Red", 24800, "transit", "s-hsr", "se-hsr-3", { finalPrice: 38000, winnerBroker: "Nexa Wheels" }),
];

// Build auctions from live + completed + failed vehicles
export const AUCTIONS: Auction[] = VEHICLES.filter(
  (v) => v.stage === "live" || v.stage === "allocated" || v.stage === "transit" || v.stage === "closed" || v.stage === "failed",
).map((v, idx) => {
  const status: Auction["status"] =
    v.stage === "live"
      ? "live"
      : v.stage === "failed"
        ? "failed"
        : "completed";
  return {
    id: `auc-${v.id}`,
    vehicleId: v.id,
    status,
    startTime: daysAgo(v.daysInStage + 1),
    endTime: status === "live" ? new Date(today.getTime() + (10 + (idx % 6) * 7) * 60000).toISOString() : daysAgo(v.daysInStage),
    reservePrice: v.listedPrice ?? v.finalPrice ?? 40000,
    highestBid: v.highestBid ?? v.finalPrice,
    bidCount: v.bidCount ?? (v.stage === "failed" ? 0 : 6),
    brokerCount: v.bidCount ? Math.max(2, Math.ceil(v.bidCount / 2)) : 0,
    winner: v.finalPrice && v.winnerBroker ? { broker: v.winnerBroker, price: v.finalPrice } : undefined,
    failureReason: v.failureReason,
  };
});

export const NOTIFICATIONS: OemNotification[] = [
  { id: "n1", type: "alert", title: "3 vehicles stuck >5 days", body: "Whitefield store has 3 listings without bids for over 5 days.", createdAt: daysAgo(0), read: false, scope: ["SM", "GM", "EA"], link: "/sm/pipeline" },
  { id: "n2", type: "warning", title: "Auction ending soon", body: "Activa 125 (KA52BC2004) auction ends in 11 minutes.", createdAt: daysAgo(0), read: false, scope: ["SM", "GM"], link: "/sm/auctions" },
  { id: "n3", type: "success", title: "Deal closed", body: "CB350 sold for ₹1,58,000 to Royal Motors.", createdAt: daysAgo(0), read: true, scope: ["SM", "GM", "EA"] },
  { id: "n4", type: "alert", title: "Whitefield conversion 58%", body: "Below org average of 72%. Review failed listings.", createdAt: daysAgo(1), read: false, scope: ["GM", "EA"], link: "/gm/stores" },
  { id: "n5", type: "info", title: "Monthly report ready", body: "March performance report is available.", createdAt: daysAgo(1), read: true, scope: ["EA"], link: "/ea/reports" },
];

// ---------- Helpers ----------
export const getStore = (id: string) => STORES.find((s) => s.id === id);
export const getSm = (id: string) => SMS.find((s) => s.id === id);
export const getSe = (id: string) => SES.find((s) => s.id === id);
export const getVehicle = (id: string) => VEHICLES.find((v) => v.id === id);
export const getAuction = (id: string) => AUCTIONS.find((a) => a.id === id);

export const vehiclesByStore = (storeId: string) => VEHICLES.filter((v) => v.storeId === storeId);
export const sesByStore = (storeId: string) => SES.filter((s) => s.storeId === storeId);
export const auctionsByStore = (storeId: string) => {
  const vIds = new Set(vehiclesByStore(storeId).map((v) => v.id));
  return AUCTIONS.filter((a) => vIds.has(a.vehicleId));
};

export const stageCounts = (vehicles: Vehicle[]): Record<Stage, number> => {
  const base: Record<Stage, number> = {
    registered: 0, inspected: 0, listed: 0, live: 0,
    allocated: 0, transit: 0, closed: 0, failed: 0,
  };
  vehicles.forEach((v) => { base[v.stage]++; });
  return base;
};

export const computePeriodKpis = (vehicles: Vehicle[], auctions: Auction[]): PeriodKpis => {
  const closed = vehicles.filter((v) => v.stage === "closed" || v.stage === "transit" || v.stage === "allocated");
  const failed = vehicles.filter((v) => v.stage === "failed");
  const total = closed.length + failed.length;
  const gmv = closed.reduce((sum, v) => sum + (v.finalPrice ?? 0), 0);
  const liveOrDone = auctions.filter((a) => a.status !== "scheduled");
  const totalBids = liveOrDone.reduce((s, a) => s + (a.bidCount ?? 0), 0);
  return {
    gmv,
    deals: closed.length,
    conversionPct: total > 0 ? Math.round((closed.length / total) * 100) : 0,
    avgBids: liveOrDone.length > 0 ? +(totalBids / liveOrDone.length).toFixed(1) : 0,
    avgTimeToFirstBidMins: 4.2,
  };
};

// Org-wide KPIs (aggregated from stores)
export const ORG_KPIS = {
  gmv30d: STORES.reduce((s, st) => s + st.gmv30d, 0),
  deals30d: STORES.reduce((s, st) => s + st.vehiclesClosed30d, 0),
  activeVehicles: STORES.reduce((s, st) => s + st.vehiclesActive, 0),
  avgConversion: Math.round(STORES.reduce((s, st) => s + st.conversionPct, 0) / STORES.length),
  liveAuctions: AUCTIONS.filter((a) => a.status === "live").length,
};

// 6-month GMV trend (for EA dashboard)
export const GMV_TREND_6M = [
  { month: "Oct", gmv: 920000 },
  { month: "Nov", gmv: 1080000 },
  { month: "Dec", gmv: 1240000 },
  { month: "Jan", gmv: 1150000 },
  { month: "Feb", gmv: 1320000 },
  { month: "Mar", gmv: ORG_KPIS.gmv30d },
];

export const BRAND_MIX = [
  { brand: "Activa series", pct: 38 },
  { brand: "Shine / SP", pct: 28 },
  { brand: "Unicorn / Hornet", pct: 18 },
  { brand: "Dio / Dream", pct: 11 },
  { brand: "CB350", pct: 5 },
];

export const STAGE_LABELS: Record<Stage, string> = {
  registered: "Registered",
  inspected: "Inspected",
  listed: "Listed",
  live: "Live Auction",
  allocated: "Allocated",
  transit: "In Transit",
  closed: "Closed",
  failed: "Failed",
};

export const formatINR = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};
