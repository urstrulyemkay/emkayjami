export interface TrustRecord {
  id: string;
  entity_type: "broker" | "oem" | "runner";
  entity_name: string;
  entity_id: string;
  city: string;
  trust_score: number;
  level: number;
  strikes_active: number;
  strikes_total: number;
  last_strike_date: string | null;
  compliance_status: "compliant" | "warning" | "non_compliant";
  audit_flags: number;
  last_audit: string;
}

export const mockTrustRecords: TrustRecord[] = [
  { id: "1", entity_type: "broker", entity_name: "Rajesh Motors", entity_id: "BRK-0234", city: "Bangalore", trust_score: 82, level: 3, strikes_active: 1, strikes_total: 2, last_strike_date: "2026-04-05", compliance_status: "warning", audit_flags: 1, last_audit: "2026-04-07" },
  { id: "2", entity_type: "broker", entity_name: "Anand Motors", entity_id: "BRK-0189", city: "Mumbai", trust_score: 91, level: 4, strikes_active: 0, strikes_total: 0, last_strike_date: null, compliance_status: "compliant", audit_flags: 0, last_audit: "2026-04-06" },
  { id: "3", entity_type: "broker", entity_name: "Speedy Motors", entity_id: "BRK-0312", city: "Bangalore", trust_score: 45, level: 1, strikes_active: 3, strikes_total: 5, last_strike_date: "2026-04-06", compliance_status: "non_compliant", audit_flags: 3, last_audit: "2026-04-07" },
  { id: "4", entity_type: "broker", entity_name: "Metro Autos", entity_id: "BRK-0156", city: "Bangalore", trust_score: 75, level: 2, strikes_active: 1, strikes_total: 1, last_strike_date: "2026-03-28", compliance_status: "warning", audit_flags: 1, last_audit: "2026-04-05" },
  { id: "5", entity_type: "broker", entity_name: "Kumar Bikes", entity_id: "BRK-0278", city: "Chennai", trust_score: 88, level: 3, strikes_active: 0, strikes_total: 1, last_strike_date: "2026-02-15", compliance_status: "compliant", audit_flags: 0, last_audit: "2026-04-04" },
  { id: "6", entity_type: "broker", entity_name: "Delhi Wheels", entity_id: "BRK-0345", city: "Delhi", trust_score: 62, level: 2, strikes_active: 2, strikes_total: 3, last_strike_date: "2026-04-03", compliance_status: "warning", audit_flags: 2, last_audit: "2026-04-06" },
  { id: "7", entity_type: "oem", entity_name: "Ananda Honda", entity_id: "OEM-001", city: "Bangalore", trust_score: 95, level: 5, strikes_active: 0, strikes_total: 0, last_strike_date: null, compliance_status: "compliant", audit_flags: 0, last_audit: "2026-04-01" },
  { id: "8", entity_type: "runner", entity_name: "Mohan K.", entity_id: "RNR-045", city: "Bangalore", trust_score: 78, level: 3, strikes_active: 0, strikes_total: 1, last_strike_date: "2026-03-10", compliance_status: "compliant", audit_flags: 0, last_audit: "2026-04-03" },
];

export interface DisputeRecord {
  id: string;
  dispute_id: string;
  deal_id: string;
  vehicle: string;
  filed_by: string;
  filed_by_type: "broker" | "oem" | "customer";
  against: string;
  dispute_type: "delta_damage" | "payment_mismatch" | "delivery_issue" | "documentation" | "quality" | "pricing";
  description: string;
  status: "open" | "under_investigation" | "awaiting_response" | "resolved" | "escalated" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  sla_status: "on_track" | "warning" | "overdue";
  assigned_to: string | null;
  filed_at: string;
  resolved_at: string | null;
  resolution: string | null;
  city: string;
}

export const mockDisputes: DisputeRecord[] = [
  { id: "1", dispute_id: "DSP-2026-0041", deal_id: "D-1887", vehicle: "Honda CB350 KA05MN6789", filed_by: "Anand Motors", filed_by_type: "broker", against: "Ananda Honda (SE: Pradeep)", dispute_type: "delta_damage", description: "Headlight crack not reported in first inspection. Delta shows new damage post-pickup.", status: "under_investigation", priority: "high", sla_status: "warning", assigned_to: "QA Lead: Rekha M.", filed_at: "2026-04-05 14:30", resolved_at: null, resolution: null, city: "Bangalore" },
  { id: "2", dispute_id: "DSP-2026-0042", deal_id: "D-1885", vehicle: "TVS Ntorq KA03AB4567", filed_by: "Speedy Motors", filed_by_type: "broker", against: "TVS Motors", dispute_type: "payment_mismatch", description: "₹2,400 discrepancy between agreed bid and amount debited from wallet.", status: "open", priority: "medium", sla_status: "on_track", assigned_to: null, filed_at: "2026-04-06 10:00", resolved_at: null, resolution: null, city: "Bangalore" },
  { id: "3", dispute_id: "DSP-2026-0043", deal_id: "D-1880", vehicle: "Activa 125 MH01AB6789", filed_by: "Shree Ganesh Motors", filed_by_type: "broker", against: "Runner: Prakash M.", dispute_type: "delivery_issue", description: "Vehicle delivered with minor scratch on left panel not present during pickup photos.", status: "awaiting_response", priority: "medium", sla_status: "on_track", assigned_to: "QA Lead: Rekha M.", filed_at: "2026-04-04 16:00", resolved_at: null, resolution: null, city: "Mumbai" },
  { id: "4", dispute_id: "DSP-2026-0038", deal_id: "D-1870", vehicle: "Pulsar 150 TN09CD2345", filed_by: "Star Bikes", filed_by_type: "broker", against: "Bajaj Arena Chennai", dispute_type: "quality", description: "Engine noise not reported. Requires ₹3,000 repair.", status: "resolved", priority: "high", sla_status: "on_track", assigned_to: "QA Lead: Rekha M.", filed_at: "2026-03-28 09:00", resolved_at: "2026-04-02 11:00", resolution: "Partial refund of ₹1,500 approved. SE issued warning.", city: "Chennai" },
  { id: "5", dispute_id: "DSP-2026-0039", deal_id: "D-1872", vehicle: "RE Meteor 350 DL02EF5678", filed_by: "Delhi Wheels", filed_by_type: "broker", against: "RE Showroom Delhi", dispute_type: "pricing", description: "Customer expectation was changed after auction started. Broker claims unfair pricing.", status: "escalated", priority: "critical", sla_status: "overdue", assigned_to: "KAM: Vikram S.", filed_at: "2026-03-30 11:00", resolved_at: null, resolution: null, city: "Delhi" },
];

export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  category: "auctions" | "logistics" | "finance" | "entities" | "documentation" | "trust" | "platform";
  frequency: "daily" | "weekly" | "monthly" | "on_demand";
  last_generated: string;
  format: "table" | "chart" | "mixed";
}

export const mockReports: ReportConfig[] = [
  { id: "1", title: "Daily Auction Summary", description: "Total auctions, bid counts, conversion rates, avg bid amounts by city", category: "auctions", frequency: "daily", last_generated: "2026-04-07 06:00", format: "mixed" },
  { id: "2", title: "Deal Pipeline Health", description: "Deals by status, avg time in each stage, bottleneck identification", category: "auctions", frequency: "daily", last_generated: "2026-04-07 06:00", format: "mixed" },
  { id: "3", title: "Weekly Settlement Report", description: "OEM-wise settlements, commission earned, pending transfers", category: "finance", frequency: "weekly", last_generated: "2026-04-06 00:00", format: "table" },
  { id: "4", title: "Logistics Performance", description: "Pickups completed, avg time to deliver, runner utilization", category: "logistics", frequency: "daily", last_generated: "2026-04-07 06:00", format: "chart" },
  { id: "5", title: "Broker Trust Scorecard", description: "Trust score distribution, strike trends, compliance rates", category: "trust", frequency: "weekly", last_generated: "2026-04-06 00:00", format: "mixed" },
  { id: "6", title: "KYC Processing Report", description: "KYC submissions, approval rates, avg processing time, rejection reasons", category: "entities", frequency: "weekly", last_generated: "2026-04-06 00:00", format: "mixed" },
  { id: "7", title: "Documentation SLA Report", description: "Service requests by type, SLA compliance, overdue items", category: "documentation", frequency: "weekly", last_generated: "2026-04-06 00:00", format: "table" },
  { id: "8", title: "Monthly Revenue Report", description: "GMV, commission revenue, city-wise breakdown, MoM growth", category: "finance", frequency: "monthly", last_generated: "2026-04-01 00:00", format: "mixed" },
  { id: "9", title: "Cascade Analysis", description: "Cascade trigger rates, success rates, avg cascade depth, time to resolution", category: "auctions", frequency: "weekly", last_generated: "2026-04-06 00:00", format: "chart" },
  { id: "10", title: "Platform Health Dashboard", description: "Active users, system uptime, error rates, API response times", category: "platform", frequency: "daily", last_generated: "2026-04-07 06:00", format: "chart" },
];
