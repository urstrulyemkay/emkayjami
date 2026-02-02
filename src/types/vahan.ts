// Types for Vahan API integration
// Vahan is the centralized national registry for all vehicle-related services in India
// Initiative by the Ministry of Road Transport and Highways (MoRTH)

export interface VahanVehicleData {
  // Owner & RC Details
  ownerName: string;
  registrationDate: string;
  rcStatus: string;
  rcValidUpto: string;
  hypothecation: string | null;
  financier: string | null;
  
  // Vehicle Specs
  make: string;
  model: string;
  variant: string | null;
  vehicleClass: string;
  fuelType: string;
  engineCC: number;
  chassisNumber: string;
  engineNumber: string;
  manufacturingYear: number;
  color: string;
  seatingCapacity: number;
  unladenWeight: number;
  
  // Insurance & PUC
  insuranceCompany: string | null;
  insuranceValidUpto: string | null;
  insurancePolicyNumber: string | null;
  pucValidUpto: string | null;
  pucNumber: string | null;
  
  // Additional
  rtoName: string;
  rtoCode: string;
  vehicleAge: number;
  fitnessValidUpto: string | null;
  taxValidUpto: string | null;
  emissionNorms: string | null;
}

export interface VahanValidationStatus {
  field: string;
  label: string;
  status: "valid" | "warning" | "expired" | "missing";
  value: string | null;
  message?: string;
}

export function getValidationStatuses(data: VahanVehicleData): VahanValidationStatus[] {
  const today = new Date();
  const statuses: VahanValidationStatus[] = [];

  // RC Status
  statuses.push({
    field: "rcStatus",
    label: "RC Status",
    status: data.rcStatus === "Active" ? "valid" : "warning",
    value: data.rcStatus,
    message: data.rcStatus !== "Active" ? "RC is not active" : undefined,
  });

  // Insurance
  if (data.insuranceValidUpto) {
    const insuranceExpiry = new Date(data.insuranceValidUpto);
    const daysUntilExpiry = Math.floor((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    statuses.push({
      field: "insurance",
      label: "Insurance",
      status: daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 30 ? "warning" : "valid",
      value: data.insuranceValidUpto,
      message: daysUntilExpiry < 0 
        ? "Insurance expired" 
        : daysUntilExpiry < 30 
          ? `Expires in ${daysUntilExpiry} days`
          : `Valid until ${data.insuranceValidUpto}`,
    });
  } else {
    statuses.push({
      field: "insurance",
      label: "Insurance",
      status: "missing",
      value: null,
      message: "Insurance details not found",
    });
  }

  // PUC
  if (data.pucValidUpto) {
    const pucExpiry = new Date(data.pucValidUpto);
    const daysUntilExpiry = Math.floor((pucExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    statuses.push({
      field: "puc",
      label: "PUC Certificate",
      status: daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 15 ? "warning" : "valid",
      value: data.pucValidUpto,
      message: daysUntilExpiry < 0 
        ? "PUC expired" 
        : daysUntilExpiry < 15 
          ? `Expires in ${daysUntilExpiry} days`
          : `Valid until ${data.pucValidUpto}`,
    });
  } else {
    statuses.push({
      field: "puc",
      label: "PUC Certificate",
      status: "missing",
      value: null,
      message: "PUC details not found",
    });
  }

  // Hypothecation
  statuses.push({
    field: "hypothecation",
    label: "Hypothecation",
    status: data.hypothecation ? "warning" : "valid",
    value: data.hypothecation,
    message: data.hypothecation && data.financier 
      ? `Financed by ${data.financier}` 
      : data.hypothecation 
        ? "Vehicle has hypothecation" 
        : "No hypothecation",
  });

  // Fitness
  if (data.fitnessValidUpto) {
    const fitnessExpiry = new Date(data.fitnessValidUpto);
    const daysUntilExpiry = Math.floor((fitnessExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    statuses.push({
      field: "fitness",
      label: "Fitness Certificate",
      status: daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 30 ? "warning" : "valid",
      value: data.fitnessValidUpto,
      message: daysUntilExpiry < 0 
        ? "Fitness expired" 
        : `Valid until ${data.fitnessValidUpto}`,
    });
  }

  return statuses;
}
