import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

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

interface VahanLookupResult {
  success: boolean;
  data?: VahanVehicleData;
  error?: string;
}

interface UseVahanLookupReturn {
  lookupVehicle: (registrationNumber: string) => Promise<VahanVehicleData | null>;
  isLoading: boolean;
  vehicleData: VahanVehicleData | null;
  error: string | null;
  clearData: () => void;
}

export function useVahanLookup(): UseVahanLookupReturn {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<VahanVehicleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupVehicle = useCallback(async (registrationNumber: string): Promise<VahanVehicleData | null> => {
    if (!registrationNumber.trim()) {
      setError("Registration number is required");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<VahanLookupResult>(
        "vahan-lookup",
        {
          body: { registrationNumber: registrationNumber.toUpperCase() },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to fetch vehicle details");
      }

      if (!data?.success) {
        const errorMessage = data?.error || "Vehicle not found";
        setError(errorMessage);
        toast({
          title: "Lookup failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      if (data.data) {
        setVehicleData(data.data);
        toast({
          title: "Vehicle found",
          description: `${data.data.make} ${data.data.model} - ${data.data.manufacturingYear}`,
        });
        return data.data;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch vehicle details";
      setError(message);
      toast({
        title: "Lookup error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearData = useCallback(() => {
    setVehicleData(null);
    setError(null);
  }, []);

  return {
    lookupVehicle,
    isLoading,
    vehicleData,
    error,
    clearData,
  };
}
