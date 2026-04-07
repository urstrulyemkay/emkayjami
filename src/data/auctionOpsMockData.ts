// Mock data for Auction & Deal Management module

export interface LiveAuctionItem {
  id: string;
  auction_id: string;
  vehicle: string;
  oem: string;
  store: string;
  se: string;
  auction_type: "quick" | "flexible" | "extended";
  duration: string;
  time_remaining_min: number;
  bid_count: number;
  highest_bid: number;
  effective_score: number;
  customer_expectation: number;
  bid_vs_expectation: number;
  broadcast_scope: string;
  status: "scheduled" | "live" | "ending_soon";
}

export const mockLiveAuctions: LiveAuctionItem[] = [
  { id: "auc-001", auction_id: "AUC-2026-1847", vehicle: "Apache RTR 180 2018 KA05HU4458", oem: "Ananda Honda", store: "Koramangala", se: "Pradeep M.", auction_type: "quick", duration: "30 min", time_remaining_min: 3, bid_count: 4, highest_bid: 42500, effective_score: 37625, customer_expectation: 40000, bid_vs_expectation: 106, broadcast_scope: "Bangalore", status: "ending_soon" },
  { id: "auc-002", auction_id: "AUC-2026-1848", vehicle: "Activa 6G 2021 KA03MN9876", oem: "Ananda Honda", store: "Indiranagar", se: "Anitha R.", auction_type: "flexible", duration: "60 min", time_remaining_min: 28, bid_count: 2, highest_bid: 38000, effective_score: 33500, customer_expectation: 42000, bid_vs_expectation: 90, broadcast_scope: "Bangalore", status: "live" },
  { id: "auc-003", auction_id: "AUC-2026-1849", vehicle: "Pulsar NS200 2020 MH01AB1234", oem: "Metro Bajaj", store: "Andheri", se: "Ravi K.", auction_type: "quick", duration: "30 min", time_remaining_min: 1, bid_count: 0, highest_bid: 0, effective_score: 0, customer_expectation: 55000, bid_vs_expectation: 0, broadcast_scope: "Mumbai", status: "ending_soon" },
  { id: "auc-004", auction_id: "AUC-2026-1850", vehicle: "Jupiter Classic 2022 TN01CD5678", oem: "Southern Hero", store: "Anna Salai", se: "Kumar S.", auction_type: "extended", duration: "120 min", time_remaining_min: 95, bid_count: 1, highest_bid: 32000, effective_score: 28500, customer_expectation: 35000, bid_vs_expectation: 91, broadcast_scope: "Chennai", status: "live" },
  { id: "auc-005", auction_id: "AUC-2026-1851", vehicle: "FZ-S V3 2019 KA01EF9012", oem: "Yamaha World", store: "Karol Bagh", se: "Amit P.", auction_type: "quick", duration: "30 min", time_remaining_min: 15, bid_count: 6, highest_bid: 48000, effective_score: 42200, customer_expectation: 45000, bid_vs_expectation: 107, broadcast_scope: "Delhi + NCR", status: "live" },
  { id: "auc-006", auction_id: "AUC-2026-1852", vehicle: "Classic 350 2020 KA04GH3456", oem: "Royal Riders", store: "SB Road", se: "Nikhil D.", auction_type: "flexible", duration: "60 min", time_remaining_min: 8, bid_count: 3, highest_bid: 95000, effective_score: 83500, customer_expectation: 100000, bid_vs_expectation: 95, broadcast_scope: "Pune + Mumbai", status: "ending_soon" },
];

export interface DealItem {
  id: string;
  deal_id: string;
  vehicle: string;
  oem: string;
  broker: string;
  winning_bid: number;
  deal_status: string;
  payment_status: string;
  pickup_status: string;
  documentation_status: string;
  days_since_allocation: number;
  sla_status: "on_track" | "warning" | "overdue";
  assigned_runner: string | null;
  city: string;
}

export const mockDeals: DealItem[] = [
  { id: "deal-001", deal_id: "DAP-DEAL-2026-0891", vehicle: "Apache RTR 180 KA05HU4458", oem: "Ananda Honda", broker: "Rajesh Auto Traders", winning_bid: 42500, deal_status: "in_transit", payment_status: "held", pickup_status: "picked_up", documentation_status: "pending", days_since_allocation: 5, sla_status: "on_track", assigned_runner: "Mohan K.", city: "Bangalore" },
  { id: "deal-002", deal_id: "DAP-DEAL-2026-0892", vehicle: "Activa 125 MH02JK6789", oem: "Metro Bajaj", broker: "Metro Car Zone", winning_bid: 35000, deal_status: "payment_pending", payment_status: "pending", pickup_status: "not_scheduled", documentation_status: "pending", days_since_allocation: 1, sla_status: "on_track", assigned_runner: null, city: "Mumbai" },
  { id: "deal-003", deal_id: "DAP-DEAL-2026-0887", vehicle: "Pulsar 150 TN03LM4321", oem: "Southern Hero", broker: "Kumar Bikes & Scooters", winning_bid: 28000, deal_status: "delivered", payment_status: "released", pickup_status: "delivered", documentation_status: "in_progress", days_since_allocation: 12, sla_status: "warning", assigned_runner: "Suresh R.", city: "Chennai" },
  { id: "deal-004", deal_id: "DAP-DEAL-2026-0880", vehicle: "Classic 350 KA01NO8765", oem: "Royal Riders", broker: "Rajesh Auto Traders", winning_bid: 110000, deal_status: "documentation_pending", payment_status: "released", pickup_status: "delivered", documentation_status: "broker_marked_done", days_since_allocation: 22, sla_status: "overdue", assigned_runner: "Mohan K.", city: "Bangalore" },
  { id: "deal-005", deal_id: "DAP-DEAL-2026-0893", vehicle: "FZ-S V3 DL01PQ2345", oem: "Yamaha World", broker: "Anand Motors", winning_bid: 48000, deal_status: "allocated", payment_status: "pending", pickup_status: "not_scheduled", documentation_status: "pending", days_since_allocation: 0, sla_status: "on_track", assigned_runner: null, city: "Delhi" },
  { id: "deal-006", deal_id: "DAP-DEAL-2026-0878", vehicle: "Jupiter Classic TN01RS6543", oem: "Southern Hero", broker: "Kumar Bikes & Scooters", winning_bid: 31000, deal_status: "completed", payment_status: "released", pickup_status: "delivered", documentation_status: "verified", days_since_allocation: 35, sla_status: "on_track", assigned_runner: "Ravi T.", city: "Chennai" },
  { id: "deal-007", deal_id: "DAP-DEAL-2026-0885", vehicle: "Splendor Plus KA02TU7890", oem: "Ananda Honda", broker: "Speedy Wheels", winning_bid: 18000, deal_status: "failed", payment_status: "refunded", pickup_status: "not_scheduled", documentation_status: "pending", days_since_allocation: 8, sla_status: "overdue", assigned_runner: null, city: "Bangalore" },
];

export interface DeltaReviewItem {
  id: string;
  flag_id: string;
  vehicle: string;
  oem_store_se: string;
  first_grade: string;
  second_grade: string;
  delta_severity: "negligible" | "minor" | "major";
  price_adjustment: number;
  price_adjustment_pct: number;
  flag_reason: string;
  status: "pending_review" | "approved" | "rejected" | "escalated";
  sla_status: "on_track" | "warning" | "overdue";
}

export const mockDeltaReviews: DeltaReviewItem[] = [
  { id: "delta-001", flag_id: "DLT-2026-0045", vehicle: "Apache RTR 180 KA05HU4458", oem_store_se: "Ananda Honda / Koramangala / Pradeep M.", first_grade: "B", second_grade: "C", delta_severity: "minor", price_adjustment: 5000, price_adjustment_pct: 13.7, flag_reason: "Auto: >10% price change", status: "pending_review", sla_status: "warning" },
  { id: "delta-002", flag_id: "DLT-2026-0046", vehicle: "Activa 6G MH01AB9999", oem_store_se: "Metro Bajaj / Andheri / Ravi K.", first_grade: "A", second_grade: "C", delta_severity: "major", price_adjustment: 12000, price_adjustment_pct: 28.5, flag_reason: "Auto: >25% adjustment", status: "pending_review", sla_status: "overdue" },
  { id: "delta-003", flag_id: "DLT-2026-0047", vehicle: "Pulsar 150 TN03LM4321", oem_store_se: "Southern Hero / Anna Salai / Kumar S.", first_grade: "B", second_grade: "B-", delta_severity: "negligible", price_adjustment: 1500, price_adjustment_pct: 5.3, flag_reason: "Broker disputed", status: "pending_review", sla_status: "on_track" },
  { id: "delta-004", flag_id: "DLT-2026-0044", vehicle: "FZ-S V3 KA01EF9012", oem_store_se: "Yamaha World / Karol Bagh / Amit P.", first_grade: "A", second_grade: "B", delta_severity: "minor", price_adjustment: 7500, price_adjustment_pct: 15.6, flag_reason: "Auto: SE repeat delta (4th in 30d)", status: "escalated", sla_status: "on_track" },
];

export interface CascadeItem {
  id: string;
  auction_id: string;
  vehicle: string;
  original_winner: string;
  backed_out_at: string;
  cascade_started: string;
  validity_until: string;
  eligibility_floor: number;
  floor_source: string;
  total_bids: number;
  eligible_bids: number;
  status: "active" | "resolved" | "failed";
  offers: CascadeOffer[];
}

export interface CascadeOffer {
  rank: number;
  broker: string;
  bid_amount: number;
  status: "offered" | "accepted" | "declined" | "expired" | "standby" | "below_floor";
  sent_at: string | null;
  deadline: string | null;
  time_remaining: string | null;
}

export const mockCascades: CascadeItem[] = [
  {
    id: "cas-001", auction_id: "AUC-2026-1903", vehicle: "Honda Activa 6G 2021 KA03MN9876",
    original_winner: "[Anonymous]", backed_out_at: "11:15 AM", cascade_started: "11:16 AM",
    validity_until: "5:16 PM", eligibility_floor: 38000, floor_source: "customer_expect",
    total_bids: 5, eligible_bids: 3, status: "active",
    offers: [
      { rank: 2, broker: "Broker B", bid_amount: 41000, status: "offered", sent_at: "11:17 AM", deadline: "12:17 PM", time_remaining: "43 min" },
      { rank: 3, broker: "Broker C", bid_amount: 39500, status: "standby", sent_at: null, deadline: null, time_remaining: null },
      { rank: 4, broker: "Broker D", bid_amount: 38200, status: "standby", sent_at: null, deadline: null, time_remaining: null },
      { rank: 5, broker: "Broker E", bid_amount: 37000, status: "below_floor", sent_at: null, deadline: null, time_remaining: null },
    ],
  },
  {
    id: "cas-002", auction_id: "AUC-2026-1895", vehicle: "TVS Jupiter 2020 TN01XY3456",
    original_winner: "[Anonymous]", backed_out_at: "9:30 AM", cascade_started: "9:31 AM",
    validity_until: "3:31 PM", eligibility_floor: 25000, floor_source: "reserve_price",
    total_bids: 4, eligible_bids: 2, status: "active",
    offers: [
      { rank: 2, broker: "Broker F", bid_amount: 28000, status: "declined", sent_at: "9:32 AM", deadline: "10:32 AM", time_remaining: null },
      { rank: 3, broker: "Broker G", bid_amount: 26500, status: "offered", sent_at: "10:33 AM", deadline: "11:33 AM", time_remaining: "18 min" },
      { rank: 4, broker: "Broker H", bid_amount: 24000, status: "below_floor", sent_at: null, deadline: null, time_remaining: null },
    ],
  },
  {
    id: "cas-003", auction_id: "AUC-2026-1880", vehicle: "Hero Splendor 2019 KA01AB7890",
    original_winner: "[Anonymous]", backed_out_at: "Yesterday 4:00 PM", cascade_started: "Yesterday 4:01 PM",
    validity_until: "Expired", eligibility_floor: 15000, floor_source: "customer_expect",
    total_bids: 3, eligible_bids: 2, status: "failed",
    offers: [
      { rank: 2, broker: "Broker I", bid_amount: 17000, status: "declined", sent_at: "4:02 PM", deadline: "5:02 PM", time_remaining: null },
      { rank: 3, broker: "Broker J", bid_amount: 15500, status: "expired", sent_at: "5:03 PM", deadline: "6:03 PM", time_remaining: null },
    ],
  },
];
