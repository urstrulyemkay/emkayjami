export interface PickupRequest {
  id: string;
  request_id: string;
  vehicle: string;
  oem_store: string;
  se_name: string;
  poc_phone: string;
  pickup_location: string;
  preferred_date: string;
  preferred_slot: string;
  special_instructions: string;
  parking_needed: boolean;
  delivery_path: "direct_to_broker" | "common_yard";
  broker_location: string;
  assigned_runner: string | null;
  status: "requested" | "confirmed" | "runner_assigned" | "picked_up" | "in_transit" | "delivered" | "receipt_confirmed" | "issue_reported";
  sla_status: "on_track" | "warning" | "overdue";
  requested_at: string;
  city: string;
  deal_id: string;
}

export const mockPickups: PickupRequest[] = [
  { id: "1", request_id: "PKP-2026-0341", vehicle: "Apache RTR 180 KA05HU4458", oem_store: "Ananda Honda, Koramangala", se_name: "Pradeep M.", poc_phone: "****3456", pickup_location: "#45, 80 Feet Road, Koramangala, Bangalore", preferred_date: "2026-04-08", preferred_slot: "10:00-12:00", special_instructions: "Vehicle in parking lot B. Keys with SM.", parking_needed: false, delivery_path: "direct_to_broker", broker_location: "#12, Wilson Garden, Bangalore", assigned_runner: null, status: "requested", sla_status: "warning", requested_at: "2026-04-07 08:15", city: "Bangalore", deal_id: "D-1891" },
  { id: "2", request_id: "PKP-2026-0342", vehicle: "Activa 6G KA03MN9876", oem_store: "Honda Joy, Indiranagar", se_name: "Suresh R.", poc_phone: "****7812", pickup_location: "#88, 100 Feet Road, Indiranagar, Bangalore", preferred_date: "2026-04-08", preferred_slot: "12:00-15:00", special_instructions: "", parking_needed: true, delivery_path: "direct_to_broker", broker_location: "#34, JP Nagar, Bangalore", assigned_runner: "Mohan K.", status: "runner_assigned", sla_status: "on_track", requested_at: "2026-04-07 09:00", city: "Bangalore", deal_id: "D-1892" },
  { id: "3", request_id: "PKP-2026-0343", vehicle: "Pulsar NS200 KA04AB1234", oem_store: "Bajaj Arena, Whitefield", se_name: "Anil K.", poc_phone: "****5690", pickup_location: "#22, ITPL Road, Whitefield, Bangalore", preferred_date: "2026-04-08", preferred_slot: "15:00-18:00", special_instructions: "Call before arriving. Gate closes at 5 PM.", parking_needed: false, delivery_path: "common_yard", broker_location: "DriveX Yard, Marathahalli", assigned_runner: "Mohan K.", status: "confirmed", sla_status: "on_track", requested_at: "2026-04-07 09:30", city: "Bangalore", deal_id: "D-1893" },
  { id: "4", request_id: "PKP-2026-0344", vehicle: "Royal Enfield Classic 350 MH02CD5678", oem_store: "RE Showroom, Andheri", se_name: "Vikram S.", poc_phone: "****1234", pickup_location: "#10, Link Road, Andheri West, Mumbai", preferred_date: "2026-04-07", preferred_slot: "09:00-12:00", special_instructions: "", parking_needed: false, delivery_path: "direct_to_broker", broker_location: "#56, Dadar, Mumbai", assigned_runner: "Ravi T.", status: "picked_up", sla_status: "on_track", requested_at: "2026-04-06 16:00", city: "Mumbai", deal_id: "D-1888" },
  { id: "5", request_id: "PKP-2026-0345", vehicle: "Dio DLX TN09EF3456", oem_store: "Honda Wings, T. Nagar", se_name: "Karthik V.", poc_phone: "****9087", pickup_location: "#33, Usman Road, T. Nagar, Chennai", preferred_date: "2026-04-07", preferred_slot: "10:00-12:00", special_instructions: "Parking underground level 2.", parking_needed: true, delivery_path: "direct_to_broker", broker_location: "#78, Anna Nagar, Chennai", assigned_runner: "Ganesh P.", status: "in_transit", sla_status: "on_track", requested_at: "2026-04-06 14:00", city: "Chennai", deal_id: "D-1886" },
  { id: "6", request_id: "PKP-2026-0346", vehicle: "TVS Jupiter ZX KA01GH7890", oem_store: "TVS Motors, Jayanagar", se_name: "Rajan N.", poc_phone: "****4321", pickup_location: "#15, 4th Block, Jayanagar, Bangalore", preferred_date: "2026-04-06", preferred_slot: "15:00-18:00", special_instructions: "", parking_needed: false, delivery_path: "direct_to_broker", broker_location: "#90, BTM Layout, Bangalore", assigned_runner: "Sanjay R.", status: "delivered", sla_status: "on_track", requested_at: "2026-04-05 11:00", city: "Bangalore", deal_id: "D-1884" },
  { id: "7", request_id: "PKP-2026-0347", vehicle: "FZ-S V3 DL04IJ2345", oem_store: "Yamaha Blue Square, Connaught Place", se_name: "Deepak G.", poc_phone: "****6543", pickup_location: "#7, Barakhamba Road, Delhi", preferred_date: "2026-04-06", preferred_slot: "09:00-12:00", special_instructions: "Heavy traffic area, arrive early.", parking_needed: true, delivery_path: "direct_to_broker", broker_location: "#44, Karol Bagh, Delhi", assigned_runner: null, status: "requested", sla_status: "overdue", requested_at: "2026-04-05 08:00", city: "Delhi", deal_id: "D-1882" },
  { id: "8", request_id: "PKP-2026-0348", vehicle: "Splendor Plus KA02KL6789", oem_store: "Hero MotoCorp, Electronic City", se_name: "Manoj B.", poc_phone: "****8765", pickup_location: "#55, Hosur Road, Electronic City, Bangalore", preferred_date: "2026-04-08", preferred_slot: "09:00-12:00", special_instructions: "", parking_needed: false, delivery_path: "common_yard", broker_location: "DriveX Yard, Marathahalli", assigned_runner: null, status: "requested", sla_status: "on_track", requested_at: "2026-04-07 10:00", city: "Bangalore", deal_id: "D-1894" },
  { id: "9", request_id: "PKP-2026-0349", vehicle: "Access 125 MH04MN0123", oem_store: "Suzuki, Powai", se_name: "Rahul M.", poc_phone: "****2109", pickup_location: "#12, Hiranandani Gardens, Powai, Mumbai", preferred_date: "2026-04-07", preferred_slot: "12:00-15:00", special_instructions: "Vehicle at service center next door.", parking_needed: false, delivery_path: "direct_to_broker", broker_location: "#23, Bandra, Mumbai", assigned_runner: "Ravi T.", status: "runner_assigned", sla_status: "warning", requested_at: "2026-04-06 17:00", city: "Mumbai", deal_id: "D-1889" },
  { id: "10", request_id: "PKP-2026-0350", vehicle: "Fascino 125 TN10OP4567", oem_store: "Yamaha, Adyar", se_name: "Srinivas K.", poc_phone: "****3478", pickup_location: "#67, LB Road, Adyar, Chennai", preferred_date: "2026-04-08", preferred_slot: "09:00-12:00", special_instructions: "", parking_needed: false, delivery_path: "direct_to_broker", broker_location: "#45, Velachery, Chennai", assigned_runner: null, status: "confirmed", sla_status: "on_track", requested_at: "2026-04-07 07:30", city: "Chennai", deal_id: "D-1895" },
];

export interface RunnerProfile {
  id: string;
  runner_id: string;
  name: string;
  phone: string;
  city: string;
  status: "available" | "on_task" | "offline" | "suspended";
  active_tasks: number;
  completed_today: number;
  completed_this_week: number;
  rating: number;
  joined_at: string;
}

export const mockRunners: RunnerProfile[] = [
  { id: "1", runner_id: "RNR-045", name: "Mohan K.", phone: "****4567", city: "Bangalore", status: "on_task", active_tasks: 2, completed_today: 1, completed_this_week: 12, rating: 4.6, joined_at: "2025-11-15" },
  { id: "2", runner_id: "RNR-046", name: "Sanjay R.", phone: "****7890", city: "Bangalore", status: "available", active_tasks: 0, completed_today: 3, completed_this_week: 15, rating: 4.8, joined_at: "2025-10-01" },
  { id: "3", runner_id: "RNR-047", name: "Ravi T.", phone: "****1234", city: "Mumbai", status: "on_task", active_tasks: 1, completed_today: 2, completed_this_week: 11, rating: 4.3, joined_at: "2026-01-10" },
  { id: "4", runner_id: "RNR-048", name: "Ganesh P.", phone: "****5678", city: "Chennai", status: "on_task", active_tasks: 1, completed_today: 0, completed_this_week: 8, rating: 4.5, joined_at: "2025-12-20" },
  { id: "5", runner_id: "RNR-049", name: "Amit D.", phone: "****9012", city: "Delhi", status: "offline", active_tasks: 0, completed_today: 0, completed_this_week: 6, rating: 4.1, joined_at: "2026-02-05" },
  { id: "6", runner_id: "RNR-050", name: "Sunil V.", phone: "****3456", city: "Bangalore", status: "available", active_tasks: 0, completed_today: 2, completed_this_week: 14, rating: 4.7, joined_at: "2025-09-15" },
  { id: "7", runner_id: "RNR-051", name: "Prakash M.", phone: "****6789", city: "Mumbai", status: "available", active_tasks: 0, completed_today: 1, completed_this_week: 9, rating: 4.4, joined_at: "2026-01-25" },
  { id: "8", runner_id: "RNR-052", name: "Venkat S.", phone: "****0123", city: "Chennai", status: "suspended", active_tasks: 0, completed_today: 0, completed_this_week: 0, rating: 3.2, joined_at: "2025-08-10" },
];
