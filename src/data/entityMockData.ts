// Mock data for Entity Onboarding module

export interface OemOrg {
  id: string;
  org_id: string;
  company_name: string;
  trade_name: string;
  primary_city: string;
  stores: number;
  entity_admin: string;
  kyc_status: "not_started" | "docs_received" | "verified" | "rejected";
  agreement_status: "not_started" | "sent" | "signed";
  entity_status: "pending" | "active" | "suspended";
  activated_on: string | null;
  active_deals: number;
  assigned_kam: string | null;
  gst_number: string;
  pan_number: string;
  registered_address: string;
  signatory_name: string;
  signatory_phone: string;
  signatory_email: string;
  brands: string[];
  estimated_monthly_volume: string;
  notes: string;
  created_at: string;
}

export const mockOemOrgs: OemOrg[] = [
  {
    id: "oem-001", org_id: "ORG-2026-0045", company_name: "Ananda Honda Pvt Ltd", trade_name: "Ananda Honda",
    primary_city: "Bangalore", stores: 4, entity_admin: "Suresh Ananda", kyc_status: "verified",
    agreement_status: "signed", entity_status: "active", activated_on: "2026-01-22",
    active_deals: 12, assigned_kam: "Rahul M.", gst_number: "29AABCA1234F1Z5", pan_number: "AABCA1234F",
    registered_address: "#45, Koramangala, Bangalore 560034", signatory_name: "Suresh Ananda",
    signatory_phone: "9876543210", signatory_email: "suresh@anandahonda.com",
    brands: ["Honda", "TVS"], estimated_monthly_volume: "51-100", notes: "Top performing OEM in Bangalore",
    created_at: "2026-01-15",
  },
  {
    id: "oem-002", org_id: "ORG-2026-0078", company_name: "Metro Bajaj Auto", trade_name: "Metro Bajaj",
    primary_city: "Mumbai", stores: 2, entity_admin: "Vikram Patel", kyc_status: "verified",
    agreement_status: "signed", entity_status: "active", activated_on: "2026-02-10",
    active_deals: 8, assigned_kam: "Neha S.", gst_number: "27AADCM5678G1Z9", pan_number: "AADCM5678G",
    registered_address: "Plot 12, Andheri East, Mumbai 400069", signatory_name: "Vikram Patel",
    signatory_phone: "9876501234", signatory_email: "vikram@metrobajaj.com",
    brands: ["Bajaj", "KTM"], estimated_monthly_volume: "11-50", notes: "",
    created_at: "2026-02-01",
  },
  {
    id: "oem-003", org_id: "ORG-2026-0112", company_name: "Southern Hero Motors", trade_name: "Southern Hero",
    primary_city: "Chennai", stores: 3, entity_admin: "Lakshmi R.", kyc_status: "docs_received",
    agreement_status: "sent", entity_status: "pending", activated_on: null,
    active_deals: 0, assigned_kam: "Priya M.", gst_number: "33AADCS9012H1Z3", pan_number: "AADCS9012H",
    registered_address: "No 78, Anna Salai, Chennai 600002", signatory_name: "Lakshmi R.",
    signatory_phone: "9876509876", signatory_email: "lakshmi@southernhero.com",
    brands: ["Hero", "Honda"], estimated_monthly_volume: "11-50", notes: "Docs under review",
    created_at: "2026-03-05",
  },
  {
    id: "oem-004", org_id: "ORG-2026-0145", company_name: "Royal Riders Pvt Ltd", trade_name: "Royal Riders",
    primary_city: "Pune", stores: 1, entity_admin: "—", kyc_status: "not_started",
    agreement_status: "not_started", entity_status: "pending", activated_on: null,
    active_deals: 0, assigned_kam: null, gst_number: "27AADCR3456J1Z7", pan_number: "AADCR3456J",
    registered_address: "SB Road, Pune 411016", signatory_name: "Amit Deshmukh",
    signatory_phone: "9876512345", signatory_email: "amit@royalriders.com",
    brands: ["Royal Enfield"], estimated_monthly_volume: "1-10", notes: "New registration, awaiting docs",
    created_at: "2026-03-28",
  },
  {
    id: "oem-005", org_id: "ORG-2026-0089", company_name: "Yamaha World Delhi", trade_name: "Yamaha World",
    primary_city: "Delhi", stores: 2, entity_admin: "Sandeep Gupta", kyc_status: "verified",
    agreement_status: "signed", entity_status: "suspended", activated_on: "2026-02-15",
    active_deals: 0, assigned_kam: "Rahul M.", gst_number: "07AADCY7890K1Z1", pan_number: "AADCY7890K",
    registered_address: "Karol Bagh, Delhi 110005", signatory_name: "Sandeep Gupta",
    signatory_phone: "9876567890", signatory_email: "sandeep@yamahaworld.com",
    brands: ["Yamaha"], estimated_monthly_volume: "11-50", notes: "Suspended: compliance issue",
    created_at: "2026-01-28",
  },
];

export interface BrokerDirectoryItem {
  id: string;
  entity_id: string;
  business_name: string;
  owner_name: string;
  city: string;
  kyc_status: "not_started" | "in_progress" | "verified" | "rejected";
  agreement_status: "not_started" | "sent" | "signed";
  entity_status: "browse_only" | "active" | "suspended";
  trust_level: string;
  members: number;
  active_deals: number;
  lifetime_deals: number;
  registered_on: string;
  assigned_kam: string | null;
  mobile: string;
  email: string | null;
  gstin: string | null;
  pan: string | null;
  coins_balance: number;
  trust_score: number;
  strikes_count: number;
}

export const mockBrokers: BrokerDirectoryItem[] = [
  {
    id: "brk-001", entity_id: "BRK-0001", business_name: "Rajesh Auto Traders", owner_name: "Rajesh Kumar",
    city: "Mumbai", kyc_status: "verified", agreement_status: "signed", entity_status: "active",
    trust_level: "L3 - Preferred", members: 3, active_deals: 4, lifetime_deals: 47,
    registered_on: "2025-06-15", assigned_kam: "Neha S.", mobile: "9876543210", email: "rajesh@autotraders.com",
    gstin: "27AADCR1234F1Z5", pan: "AADCR1234F", coins_balance: 2400, trust_score: 50, strikes_count: 1,
  },
  {
    id: "brk-002", entity_id: "BRK-0045", business_name: "FastTrack Motors", owner_name: "Suresh Kumar",
    city: "Bangalore", kyc_status: "in_progress", agreement_status: "not_started", entity_status: "browse_only",
    trust_level: "N/A", members: 1, active_deals: 0, lifetime_deals: 0,
    registered_on: "2026-03-20", assigned_kam: null, mobile: "9876507890", email: "suresh@fasttrack.com",
    gstin: "29AADCF1234P1Z5", pan: "AADCF1234P", coins_balance: 0, trust_score: 10, strikes_count: 0,
  },
  {
    id: "brk-003", entity_id: "BRK-0089", business_name: "Kumar Bikes & Scooters", owner_name: "Anil Kumar",
    city: "Chennai", kyc_status: "verified", agreement_status: "signed", entity_status: "active",
    trust_level: "L4 - Trusted", members: 5, active_deals: 6, lifetime_deals: 92,
    registered_on: "2025-03-10", assigned_kam: "Priya M.", mobile: "9876556789", email: "anil@kumarbikes.com",
    gstin: "33AADCK5678G1Z9", pan: "AADCK5678G", coins_balance: 5600, trust_score: 72, strikes_count: 0,
  },
  {
    id: "brk-004", entity_id: "BRK-0123", business_name: "Metro Car Zone", owner_name: "Dinesh Jain",
    city: "Pune", kyc_status: "verified", agreement_status: "signed", entity_status: "active",
    trust_level: "L2 - Verified", members: 2, active_deals: 2, lifetime_deals: 15,
    registered_on: "2025-11-01", assigned_kam: "Rahul M.", mobile: "9876534567", email: "dinesh@metrocarzone.com",
    gstin: "27AADCM9012H1Z3", pan: "AADCM9012H", coins_balance: 800, trust_score: 30, strikes_count: 2,
  },
  {
    id: "brk-005", entity_id: "BRK-0156", business_name: "Anand Motors", owner_name: "Anand Sharma",
    city: "Hyderabad", kyc_status: "rejected", agreement_status: "not_started", entity_status: "browse_only",
    trust_level: "N/A", members: 1, active_deals: 0, lifetime_deals: 0,
    registered_on: "2026-03-25", assigned_kam: null, mobile: "9876523456", email: "anand@anandmotors.com",
    gstin: "36AADCA3456J1Z7", pan: "AADCA3456J", coins_balance: 0, trust_score: 5, strikes_count: 0,
  },
  {
    id: "brk-006", entity_id: "BRK-0189", business_name: "Speedy Wheels", owner_name: "Kiran Rao",
    city: "Bangalore", kyc_status: "verified", agreement_status: "signed", entity_status: "suspended",
    trust_level: "L1 - New", members: 1, active_deals: 0, lifetime_deals: 3,
    registered_on: "2025-12-10", assigned_kam: "Priya M.", mobile: "9876512345", email: "kiran@speedywheels.com",
    gstin: "29AADCS7890K1Z1", pan: "AADCS7890K", coins_balance: 50, trust_score: 8, strikes_count: 3,
  },
];

export interface KycReviewItem {
  id: string;
  submission_id: string;
  broker_name: string;
  owner_name: string;
  phone: string;
  city: string;
  document_type: "dl" | "pan_card";
  ocr_confidence: number;
  ocr_extracted_data: {
    name: string;
    dob: string;
    document_no: string;
  };
  flag_reason: string | null;
  submission_time: string;
  sla_status: "on_track" | "warning" | "overdue";
  assigned_to: string | null;
  review_status: "pending" | "approved" | "rejected";
  broker_gstin: string;
  broker_pan: string;
}

export const mockKycReviews: KycReviewItem[] = [
  {
    id: "kyc-001", submission_id: "KYC-2026-0098", broker_name: "FastTrack Motors", owner_name: "Suresh Kumar",
    phone: "****7890", city: "Bangalore", document_type: "dl", ocr_confidence: 78,
    ocr_extracted_data: { name: "SURESH KUMAR", dob: "15-03-1985", document_no: "KA0520180012345" },
    flag_reason: "Name confidence low (72%)", submission_time: "2026-04-07 08:30",
    sla_status: "warning", assigned_to: "Priya M.", review_status: "pending",
    broker_gstin: "29AADCF1234P1Z5", broker_pan: "AADCF1234P",
  },
  {
    id: "kyc-002", submission_id: "KYC-2026-0099", broker_name: "Anand Motors", owner_name: "Anand Sharma",
    phone: "****3456", city: "Hyderabad", document_type: "pan_card", ocr_confidence: 65,
    ocr_extracted_data: { name: "ANAND SHARMA", dob: "22-07-1990", document_no: "AADCA3456J" },
    flag_reason: "Image quality low, OCR failed on DOB", submission_time: "2026-04-07 07:15",
    sla_status: "overdue", assigned_to: null, review_status: "pending",
    broker_gstin: "36AADCA3456J1Z7", broker_pan: "AADCA3456J",
  },
  {
    id: "kyc-003", submission_id: "KYC-2026-0100", broker_name: "Highway Motors", owner_name: "Ravi Prasad",
    phone: "****6789", city: "Chennai", document_type: "dl", ocr_confidence: 92,
    ocr_extracted_data: { name: "RAVI PRASAD", dob: "01-11-1988", document_no: "TN0620190098765" },
    flag_reason: null, submission_time: "2026-04-07 09:45",
    sla_status: "on_track", assigned_to: "Priya M.", review_status: "pending",
    broker_gstin: "33AADCH7890L1Z5", broker_pan: "AADCH7890L",
  },
  {
    id: "kyc-004", submission_id: "KYC-2026-0101", broker_name: "City Wheels", owner_name: "Meena Devi",
    phone: "****4321", city: "Mumbai", document_type: "pan_card", ocr_confidence: 88,
    ocr_extracted_data: { name: "MEENA DEVI", dob: "15-05-1992", document_no: "AADCC4321M" },
    flag_reason: "PAN found in suspended entity", submission_time: "2026-04-07 10:00",
    sla_status: "on_track", assigned_to: null, review_status: "pending",
    broker_gstin: "27AADCC4321M1Z9", broker_pan: "AADCC4321M",
  },
];

export interface OnboardingPipelineItem {
  id: string;
  entity_type: "oem" | "broker";
  entity_name: string;
  city: string;
  stage: "registered" | "docs_submitted" | "kyc_review" | "agreement" | "activation";
  days_in_stage: number;
  assigned_to: string | null;
  sla_status: "on_track" | "warning" | "overdue";
  created_at: string;
}

export const mockOnboardingPipeline: OnboardingPipelineItem[] = [
  { id: "onb-001", entity_type: "oem", entity_name: "Royal Riders Pvt Ltd", city: "Pune", stage: "registered", days_in_stage: 10, assigned_to: null, sla_status: "overdue", created_at: "2026-03-28" },
  { id: "onb-002", entity_type: "oem", entity_name: "Southern Hero Motors", city: "Chennai", stage: "kyc_review", days_in_stage: 2, assigned_to: "Priya M.", sla_status: "on_track", created_at: "2026-03-05" },
  { id: "onb-003", entity_type: "broker", entity_name: "FastTrack Motors", city: "Bangalore", stage: "kyc_review", days_in_stage: 1, assigned_to: "Priya M.", sla_status: "warning", created_at: "2026-03-20" },
  { id: "onb-004", entity_type: "broker", entity_name: "Anand Motors", city: "Hyderabad", stage: "docs_submitted", days_in_stage: 3, assigned_to: null, sla_status: "overdue", created_at: "2026-03-25" },
  { id: "onb-005", entity_type: "broker", entity_name: "City Wheels", city: "Mumbai", stage: "kyc_review", days_in_stage: 0, assigned_to: null, sla_status: "on_track", created_at: "2026-04-07" },
  { id: "onb-006", entity_type: "broker", entity_name: "Highway Motors", city: "Chennai", stage: "agreement", days_in_stage: 1, assigned_to: "Neha S.", sla_status: "on_track", created_at: "2026-03-15" },
];
