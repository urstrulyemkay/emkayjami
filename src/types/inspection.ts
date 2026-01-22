// Core types for DriveX Inspection Truth System - 2 Wheelers

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
  engineCC?: number;
}

export type ImageAngle =
  | "front"
  | "rear"
  | "left"
  | "right"
  | "engine"
  | "chassis"
  | "odometer"
  | "front_tyre"
  | "rear_tyre"
  | "handlebar"
  | "fuel_tank"
  | "exhaust";

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
  | "electricals"
  | "frame"
  | "body"
  | "tyres"
  | "suspension"
  | "brakes";

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

// Image angles configuration for 2-wheelers
export const IMAGE_ANGLES: { angle: ImageAngle; label: string; description: string }[] = [
  { angle: "front", label: "Front", description: "Full front view with headlight" },
  { angle: "rear", label: "Rear", description: "Full rear view with tail light" },
  { angle: "left", label: "Left Side", description: "Full left profile view" },
  { angle: "right", label: "Right Side", description: "Full right profile view" },
  { angle: "engine", label: "Engine", description: "Close-up of engine block" },
  { angle: "chassis", label: "Chassis Number", description: "Frame number plate visible" },
  { angle: "odometer", label: "Odometer", description: "Speedometer showing km reading" },
  { angle: "front_tyre", label: "Front Tyre", description: "Front tyre tread and condition" },
  { angle: "rear_tyre", label: "Rear Tyre", description: "Rear tyre tread and condition" },
  { angle: "handlebar", label: "Handlebar", description: "Controls, mirrors, switches" },
  { angle: "fuel_tank", label: "Fuel Tank", description: "Tank condition and cap" },
  { angle: "exhaust", label: "Exhaust", description: "Silencer and exhaust pipe" },
];

// Defect categories configuration for 2-wheelers
export const DEFECT_CATEGORIES: { category: DefectCategory; label: string; icon: string }[] = [
  { category: "engine", label: "Engine", icon: "🔧" },
  { category: "transmission", label: "Transmission", icon: "⚙️" },
  { category: "electricals", label: "Electricals", icon: "⚡" },
  { category: "frame", label: "Frame/Chassis", icon: "🏗️" },
  { category: "body", label: "Body Panels", icon: "🛵" },
  { category: "tyres", label: "Tyres", icon: "🔘" },
  { category: "suspension", label: "Suspension", icon: "🔩" },
  { category: "brakes", label: "Brakes", icon: "🛑" },
];
