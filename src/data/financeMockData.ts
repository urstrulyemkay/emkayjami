export interface PaymentRecord {
  id: string;
  deal_id: string;
  vehicle: string;
  broker: string;
  oem: string;
  winning_bid: number;
  platform_commission: number;
  oem_payout: number;
  payment_status: "pending" | "initiated" | "held" | "released" | "settled" | "refunded" | "failed" | "timeout";
  payment_method: "escrow" | "upi_fallback";
  escrow_tx_id: string | null;
  hold_timestamp: string | null;
  release_condition: string;
  release_timestamp: string | null;
  sla_status: "on_track" | "warning" | "overdue";
  city: string;
}

export const mockPayments: PaymentRecord[] = [
  { id: "1", deal_id: "D-1891", vehicle: "Apache RTR 180 KA05HU4458", broker: "Rajesh Motors", oem: "Ananda Honda", winning_bid: 42500, platform_commission: 2125, oem_payout: 40375, payment_status: "held", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00341", hold_timestamp: "2026-04-03 10:15", release_condition: "Delivery confirmed (OTP)", release_timestamp: null, sla_status: "on_track", city: "Bangalore" },
  { id: "2", deal_id: "D-1888", vehicle: "RE Classic 350 MH02CD5678", broker: "Anand Motors", oem: "RE Showroom", winning_bid: 85000, platform_commission: 4250, oem_payout: 80750, payment_status: "released", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00338", hold_timestamp: "2026-04-01 14:30", release_condition: "Delivery confirmed (OTP)", release_timestamp: "2026-04-05 11:20", sla_status: "on_track", city: "Mumbai" },
  { id: "3", deal_id: "D-1886", vehicle: "Dio DLX TN09EF3456", broker: "Kumar Bikes", oem: "Honda Wings", winning_bid: 38000, platform_commission: 1900, oem_payout: 36100, payment_status: "settled", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00335", hold_timestamp: "2026-03-30 09:45", release_condition: "Delivery confirmed (OTP)", release_timestamp: "2026-04-02 16:10", sla_status: "on_track", city: "Chennai" },
  { id: "4", deal_id: "D-1884", vehicle: "TVS Jupiter ZX KA01GH7890", broker: "Metro Autos", oem: "TVS Motors", winning_bid: 32000, platform_commission: 1600, oem_payout: 30400, payment_status: "settled", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00332", hold_timestamp: "2026-03-28 11:00", release_condition: "Delivery confirmed (OTP)", release_timestamp: "2026-04-01 09:30", sla_status: "on_track", city: "Bangalore" },
  { id: "5", deal_id: "D-1882", vehicle: "FZ-S V3 DL04IJ2345", broker: "Delhi Wheels", oem: "Yamaha Blue Square", winning_bid: 55000, platform_commission: 2750, oem_payout: 52250, payment_status: "failed", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00330", hold_timestamp: null, release_condition: "N/A", release_timestamp: null, sla_status: "overdue", city: "Delhi" },
  { id: "6", deal_id: "D-1893", vehicle: "Pulsar NS200 KA04AB1234", broker: "Speedy Motors", oem: "Bajaj Arena", winning_bid: 62000, platform_commission: 3100, oem_payout: 58900, payment_status: "pending", payment_method: "escrow", escrow_tx_id: null, hold_timestamp: null, release_condition: "Post-delivery", release_timestamp: null, sla_status: "on_track", city: "Bangalore" },
  { id: "7", deal_id: "D-1880", vehicle: "Activa 125 MH01AB6789", broker: "Shree Ganesh Motors", oem: "Honda Joy", winning_bid: 45000, platform_commission: 2250, oem_payout: 42750, payment_status: "initiated", payment_method: "upi_fallback", escrow_tx_id: null, hold_timestamp: null, release_condition: "Manual confirmation", release_timestamp: null, sla_status: "warning", city: "Mumbai" },
  { id: "8", deal_id: "D-1878", vehicle: "Splendor Plus KA02KL6789", broker: "Auto World", oem: "Hero MotoCorp", winning_bid: 28000, platform_commission: 1400, oem_payout: 26600, payment_status: "refunded", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00325", hold_timestamp: "2026-03-25 10:00", release_condition: "Deal failed", release_timestamp: "2026-03-27 14:00", sla_status: "on_track", city: "Bangalore" },
  { id: "9", deal_id: "D-1876", vehicle: "Access 125 TN04OP3456", broker: "Star Bikes", oem: "Suzuki", winning_bid: 41000, platform_commission: 2050, oem_payout: 38950, payment_status: "timeout", payment_method: "escrow", escrow_tx_id: "ESC-2026-04-00322", hold_timestamp: null, release_condition: "N/A", release_timestamp: null, sla_status: "overdue", city: "Chennai" },
  { id: "10", deal_id: "D-1894", vehicle: "Splendor Plus KA02KL6789", broker: "Rajesh Motors", oem: "Hero MotoCorp", winning_bid: 29500, platform_commission: 1475, oem_payout: 28025, payment_status: "pending", payment_method: "escrow", escrow_tx_id: null, hold_timestamp: null, release_condition: "Post-delivery", release_timestamp: null, sla_status: "on_track", city: "Bangalore" },
];

export interface SettlementRecord {
  id: string;
  oem: string;
  period: string;
  deals_completed: number;
  gross_revenue: number;
  platform_commission: number;
  net_payout: number;
  payment_status: "pending_transfer" | "transferred" | "confirmed";
  city: string;
}

export const mockSettlements: SettlementRecord[] = [
  { id: "1", oem: "Ananda Honda", period: "Apr 1-7, 2026", deals_completed: 8, gross_revenue: 340000, platform_commission: 17000, net_payout: 323000, payment_status: "pending_transfer", city: "Bangalore" },
  { id: "2", oem: "Honda Joy", period: "Apr 1-7, 2026", deals_completed: 5, gross_revenue: 225000, platform_commission: 11250, net_payout: 213750, payment_status: "transferred", city: "Mumbai" },
  { id: "3", oem: "TVS Motors", period: "Apr 1-7, 2026", deals_completed: 6, gross_revenue: 192000, platform_commission: 9600, net_payout: 182400, payment_status: "confirmed", city: "Bangalore" },
  { id: "4", oem: "Bajaj Arena", period: "Apr 1-7, 2026", deals_completed: 4, gross_revenue: 248000, platform_commission: 12400, net_payout: 235600, payment_status: "pending_transfer", city: "Bangalore" },
  { id: "5", oem: "Hero MotoCorp", period: "Apr 1-7, 2026", deals_completed: 7, gross_revenue: 196000, platform_commission: 9800, net_payout: 186200, payment_status: "transferred", city: "Bangalore" },
  { id: "6", oem: "Yamaha Blue Square", period: "Apr 1-7, 2026", deals_completed: 3, gross_revenue: 165000, platform_commission: 8250, net_payout: 156750, payment_status: "pending_transfer", city: "Delhi" },
  { id: "7", oem: "RE Showroom", period: "Apr 1-7, 2026", deals_completed: 4, gross_revenue: 340000, platform_commission: 17000, net_payout: 323000, payment_status: "confirmed", city: "Mumbai" },
  { id: "8", oem: "Suzuki", period: "Apr 1-7, 2026", deals_completed: 3, gross_revenue: 123000, platform_commission: 6150, net_payout: 116850, payment_status: "transferred", city: "Chennai" },
];
