export interface ServiceRequest {
  id: string;
  request_id: string;
  vehicle_reg: string;
  vehicle: string;
  service_type: "name_transfer" | "duplicate_rc" | "hp_termination" | "rc_transfer_broker" | "insurance_transfer" | "puc_renewal" | "loan_closure";
  case_subtype: string | null;
  source_product: "DAP_2.0" | "SERVICES_RTO" | "C2C";
  requester: string;
  requester_type: string;
  city: string;
  status: string;
  priority: "normal" | "high" | "urgent";
  sla_deadline: string;
  sla_status: "on_track" | "warning" | "overdue";
  assigned_to: string | null;
  docs_collected: number;
  docs_required: number;
  created_at: string;
  updated_at: string;
  // RTO-specific
  rto_office?: string;
  submission_date?: string;
  rto_reference?: string;
  vahan_status?: string;
  vahan_last_checked?: string;
  fee_paid?: number;
  fee_status?: "paid" | "unpaid";
}

export const mockServiceRequests: ServiceRequest[] = [
  { id: "1", request_id: "SR-2026-0142", vehicle_reg: "KA05HU4458", vehicle: "Apache RTR 180 2018", service_type: "name_transfer", case_subtype: "HPT + TO", source_product: "SERVICES_RTO", requester: "Suresh Kumar", requester_type: "Customer", city: "Bangalore", status: "UNDER_VERIFICATION", priority: "normal", sla_deadline: "2026-04-30", sla_status: "warning", assigned_to: "Priya S.", docs_collected: 7, docs_required: 9, created_at: "2026-04-02", updated_at: "2026-04-10", rto_office: "Bengaluru South RTO", submission_date: "2026-04-10", rto_reference: "RTO-BLR-2026-4521", vahan_status: "Under Verification", vahan_last_checked: "2026-04-07 14:00", fee_paid: 850, fee_status: "paid" },
  { id: "2", request_id: "SR-2026-0148", vehicle_reg: "MH02CD5678", vehicle: "RE Classic 350 2020", service_type: "name_transfer", case_subtype: "TO", source_product: "SERVICES_RTO", requester: "Rahul Sharma", requester_type: "Customer", city: "Mumbai", status: "DOCS_COLLECTION", priority: "high", sla_deadline: "2026-05-15", sla_status: "on_track", assigned_to: "Arun K.", docs_collected: 4, docs_required: 7, created_at: "2026-04-05", updated_at: "2026-04-07", rto_office: undefined, submission_date: undefined, rto_reference: undefined },
  { id: "3", request_id: "SR-2026-0155", vehicle_reg: "TN09EF3456", vehicle: "Dio DLX 2019", service_type: "duplicate_rc", case_subtype: null, source_product: "SERVICES_RTO", requester: "Karthik V.", requester_type: "Customer", city: "Chennai", status: "SUBMITTED_TO_RTO", priority: "normal", sla_deadline: "2026-05-20", sla_status: "on_track", assigned_to: "Deepa M.", docs_collected: 5, docs_required: 5, created_at: "2026-04-01", updated_at: "2026-04-08", rto_office: "Chennai Central RTO", submission_date: "2026-04-08", rto_reference: "RTO-CHN-2026-1103", vahan_status: "Submitted", vahan_last_checked: "2026-04-07 10:00", fee_paid: 600, fee_status: "paid" },
  { id: "4", request_id: "SR-2026-0160", vehicle_reg: "KA04AB1234", vehicle: "Pulsar NS200 2021", service_type: "rc_transfer_broker", case_subtype: null, source_product: "DAP_2.0", requester: "Speedy Motors", requester_type: "Broker", city: "Bangalore", status: "PROOF_SUBMITTED", priority: "normal", sla_deadline: "2026-10-05", sla_status: "on_track", assigned_to: "Arun K.", docs_collected: 2, docs_required: 2, created_at: "2026-04-06", updated_at: "2026-04-07" },
  { id: "5", request_id: "SR-2026-0162", vehicle_reg: "KA01GH7890", vehicle: "TVS Jupiter ZX 2020", service_type: "insurance_transfer", case_subtype: null, source_product: "DAP_2.0", requester: "Metro Autos", requester_type: "Broker", city: "Bangalore", status: "IN_PROGRESS", priority: "normal", sla_deadline: "2026-04-20", sla_status: "on_track", assigned_to: "Deepa M.", docs_collected: 3, docs_required: 4, created_at: "2026-04-04", updated_at: "2026-04-06" },
  { id: "6", request_id: "SR-2026-0167", vehicle_reg: "DL04IJ2345", vehicle: "FZ-S V3 2019", service_type: "name_transfer", case_subtype: "HPT + TO + HPA", source_product: "SERVICES_RTO", requester: "Amit Gupta", requester_type: "Customer", city: "Delhi", status: "LEAD_CREATED", priority: "urgent", sla_deadline: "2026-04-12", sla_status: "overdue", assigned_to: null, docs_collected: 0, docs_required: 11, created_at: "2026-03-28", updated_at: "2026-03-28" },
  { id: "7", request_id: "SR-2026-0170", vehicle_reg: "KA02KL6789", vehicle: "Splendor Plus 2017", service_type: "hp_termination", case_subtype: null, source_product: "SERVICES_RTO", requester: "Priya Nair", requester_type: "Customer", city: "Bangalore", status: "FEE_PAID", priority: "normal", sla_deadline: "2026-06-01", sla_status: "on_track", assigned_to: "Priya S.", docs_collected: 6, docs_required: 6, created_at: "2026-03-25", updated_at: "2026-04-05", rto_office: "Bengaluru East RTO", submission_date: "2026-04-03", rto_reference: "RTO-BLR-2026-4480", vahan_status: "Fee Received", vahan_last_checked: "2026-04-06 09:00", fee_paid: 750, fee_status: "paid" },
  { id: "8", request_id: "SR-2026-0175", vehicle_reg: "MH04MN0123", vehicle: "Access 125 2020", service_type: "name_transfer", case_subtype: "TO", source_product: "SERVICES_RTO", requester: "Neha Patil", requester_type: "Customer", city: "Mumbai", status: "APPROVAL_PENDING", priority: "high", sla_deadline: "2026-04-25", sla_status: "warning", assigned_to: "Arun K.", docs_collected: 7, docs_required: 7, created_at: "2026-03-20", updated_at: "2026-04-06", rto_office: "Mumbai West RTO", submission_date: "2026-03-28", rto_reference: "RTO-MUM-2026-2201", vahan_status: "Approval Pending", vahan_last_checked: "2026-04-07 11:00", fee_paid: 900, fee_status: "paid" },
  { id: "9", request_id: "SR-2026-0180", vehicle_reg: "TN10OP4567", vehicle: "Fascino 125 2021", service_type: "puc_renewal", case_subtype: null, source_product: "DAP_2.0", requester: "Star Bikes", requester_type: "Broker", city: "Chennai", status: "COMPLETED", priority: "normal", sla_deadline: "2026-04-15", sla_status: "on_track", assigned_to: "Deepa M.", docs_collected: 1, docs_required: 1, created_at: "2026-04-03", updated_at: "2026-04-05" },
  { id: "10", request_id: "SR-2026-0185", vehicle_reg: "KA03MN9876", vehicle: "Activa 6G 2021", service_type: "rc_transfer_broker", case_subtype: null, source_product: "DAP_2.0", requester: "Kumar Bikes", requester_type: "Broker", city: "Bangalore", status: "PROOF_SUBMITTED", priority: "high", sla_deadline: "2026-04-09", sla_status: "overdue", assigned_to: "Priya S.", docs_collected: 2, docs_required: 2, created_at: "2026-04-01", updated_at: "2026-04-07" },
  { id: "11", request_id: "SR-2026-0190", vehicle_reg: "MH01AB6789", vehicle: "Activa 125 2019", service_type: "loan_closure", case_subtype: null, source_product: "DAP_2.0", requester: "Shree Ganesh Motors", requester_type: "Broker", city: "Mumbai", status: "IN_PROGRESS", priority: "normal", sla_deadline: "2026-04-18", sla_status: "on_track", assigned_to: "Arun K.", docs_collected: 2, docs_required: 3, created_at: "2026-04-04", updated_at: "2026-04-06" },
  { id: "12", request_id: "SR-2026-0198", vehicle_reg: "KA05XY1234", vehicle: "Gixxer SF 2020", service_type: "name_transfer", case_subtype: "TO", source_product: "SERVICES_RTO", requester: "Manoj Kumar", requester_type: "Customer", city: "Bangalore", status: "COMPLETED_VAHAN", priority: "normal", sla_deadline: "2026-05-10", sla_status: "on_track", assigned_to: "Priya S.", docs_collected: 7, docs_required: 7, created_at: "2026-03-15", updated_at: "2026-04-06", rto_office: "Bengaluru South RTO", submission_date: "2026-03-25", rto_reference: "RTO-BLR-2026-4390", vahan_status: "Completed", vahan_last_checked: "2026-04-06 15:00", fee_paid: 850, fee_status: "paid" },
];
