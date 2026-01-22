// Core types for DriveX Inspection Truth System

export type UserRole = "executive" | "customer" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  trustScore: number;
  trustLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  coins: number;
  streak: number;
}

export interface Vehicle {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  odometerReading?: number;
}

export type ImageAngle =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "engine"
  | "chassis"
  | "odometer"
  | "tyres_front"
  | "tyres_rear"
  | "dashboard"
  | "defects"
  | "battery";

export interface CapturedImage {
  id: string;
  angle: ImageAngle;
  uri: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  hash?: string;
}

export type VideoType = "walkaround" | "engine_start" | "idle_sound" | "acceleration";

export interface CapturedVideo {
  id: string;
  type: VideoType;
  uri: string;
  duration: number;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  hash?: string;
}

export type DefectCategory =
  | "engine"
  | "transmission"
  | "electronics"
  | "chassis"
  | "body"
  | "tyres"
  | "suspension"
  | "braking";

export type DefectSeverity = "minor" | "moderate" | "major" | "critical";

export interface Defect {
  id: string;
  category: DefectCategory;
  description: string;
  severity: DefectSeverity;
  extractedFrom: "voice" | "ai" | "manual";
  confidence?: number;
}

export interface VoiceRecording {
  id: string;
  category: DefectCategory;
  audioUri: string;
  transcript: string;
  duration: number;
  timestamp: string;
}

export type InspectionStatus =
  | "draft"
  | "in_progress"
  | "pending_consent"
  | "consented"
  | "second_inspection"
  | "completed";

export interface Inspection {
  id: string;
  vehicle: Vehicle;
  executiveId: string;
  customerId?: string;
  status: InspectionStatus;
  images: CapturedImage[];
  videos: CapturedVideo[];
  voiceRecordings: VoiceRecording[];
  defects: Defect[];
  conditionScore?: number;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
  consentedAt?: string;
  frozenHash?: string;
}

export interface InspectionDelta {
  id: string;
  firstInspectionId: string;
  secondInspectionId: string;
  newDefects: Defect[];
  resolvedDefects: Defect[];
  changedDefects: {
    defectId: string;
    previousSeverity: DefectSeverity;
    newSeverity: DefectSeverity;
  }[];
  attribution: "customer" | "inspector" | "platform";
  createdAt: string;
}

// Image angles configuration
export const IMAGE_ANGLES: { angle: ImageAngle; label: string; description: string }[] = [
  { angle: "front", label: "Front", description: "Full front view of the vehicle" },
  { angle: "rear", label: "Rear", description: "Full rear view of the vehicle" },
  { angle: "left", label: "Left Side", description: "Full left side view" },
  { angle: "right", label: "Right Side", description: "Full right side view" },
  { angle: "engine", label: "Engine Bay", description: "Open hood, engine visible" },
  { angle: "chassis", label: "Chassis Number", description: "Clear view of chassis/VIN plate" },
  { angle: "odometer", label: "Odometer", description: "Dashboard showing mileage" },
  { angle: "tyres_front", label: "Front Tyres", description: "Both front tyres visible" },
  { angle: "tyres_rear", label: "Rear Tyres", description: "Both rear tyres visible" },
  { angle: "dashboard", label: "Dashboard", description: "Full dashboard and controls" },
  { angle: "defects", label: "Visible Defects", description: "Any scratches, dents, damage" },
  { angle: "battery", label: "Battery Area", description: "Battery and surrounding area" },
];

// Defect categories configuration
export const DEFECT_CATEGORIES: { category: DefectCategory; label: string; icon: string }[] = [
  { category: "engine", label: "Engine", icon: "🔧" },
  { category: "transmission", label: "Transmission", icon: "⚙️" },
  { category: "electronics", label: "Electronics", icon: "⚡" },
  { category: "chassis", label: "Chassis", icon: "🛞" },
  { category: "body", label: "Body", icon: "🚗" },
  { category: "tyres", label: "Tyres", icon: "🔘" },
  { category: "suspension", label: "Suspension", icon: "🔩" },
  { category: "braking", label: "Braking", icon: "🛑" },
];
