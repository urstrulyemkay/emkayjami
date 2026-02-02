import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VahanResponse {
  success: boolean;
  data?: {
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
  };
  error?: string;
}

// Mock Vahan API response for development
// In production, replace with actual Vahan API call
function getMockVahanData(registrationNumber: string): VahanResponse {
  // Simulate different responses based on registration pattern
  const stateCode = registrationNumber.substring(0, 2).toUpperCase();
  
  // Simulate 5% failure rate for testing
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: "Vehicle not found in Vahan database",
    };
  }
  
  // Generate realistic mock data
  const makes = ["Honda", "TVS", "Bajaj", "Yamaha", "Royal Enfield", "Hero", "Suzuki"];
  const models: Record<string, string[]> = {
    "Honda": ["Activa 6G", "Shine", "Unicorn", "SP 125", "Dio"],
    "TVS": ["Jupiter", "Apache RTR 160", "Ntorq", "Raider 125", "iQube"],
    "Bajaj": ["Pulsar NS200", "Platina", "CT 110", "Dominar 400", "Chetak"],
    "Yamaha": ["FZ-S", "Ray ZR", "R15 V4", "MT-15", "Fascino"],
    "Royal Enfield": ["Classic 350", "Meteor 350", "Hunter 350", "Bullet 350", "Continental GT"],
    "Hero": ["Splendor Plus", "HF Deluxe", "Xtreme 160R", "Glamour", "Passion Pro"],
    "Suzuki": ["Access 125", "Burgman Street", "Gixxer SF", "Avenis", "Hayabusa"],
  };
  const colors = ["Pearl White", "Midnight Black", "Racing Red", "Matt Blue", "Silver Grey"];
  const financiers = ["HDFC Bank", "ICICI Bank", "Bajaj Finance", "TVS Credit", null, null]; // null = no loan
  const insurers = ["ICICI Lombard", "HDFC ERGO", "Bajaj Allianz", "New India Assurance", "TATA AIG"];
  
  const randomMake = makes[Math.floor(Math.random() * makes.length)];
  const makeModels = models[randomMake] || ["Unknown Model"];
  const randomModel = makeModels[Math.floor(Math.random() * makeModels.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomFinancier = financiers[Math.floor(Math.random() * financiers.length)];
  const randomInsurer = insurers[Math.floor(Math.random() * insurers.length)];
  
  const currentYear = new Date().getFullYear();
  const manufacturingYear = currentYear - Math.floor(Math.random() * 8); // 0-7 years old
  const vehicleAge = currentYear - manufacturingYear;
  
  // Generate dates
  const registrationDate = new Date(manufacturingYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const insuranceExpiry = new Date(currentYear + (Math.random() > 0.3 ? 1 : 0), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const pucExpiry = new Date(currentYear + (Math.random() > 0.4 ? 1 : 0), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const fitnessExpiry = new Date(currentYear + 5, registrationDate.getMonth(), registrationDate.getDate());
  
  // RTO mapping
  const rtoNames: Record<string, string> = {
    "KA": "Karnataka",
    "MH": "Maharashtra",
    "DL": "Delhi",
    "TN": "Tamil Nadu",
    "UP": "Uttar Pradesh",
    "GJ": "Gujarat",
    "RJ": "Rajasthan",
    "WB": "West Bengal",
    "AP": "Andhra Pradesh",
    "TS": "Telangana",
  };
  
  const engineCCs = [110, 125, 150, 160, 200, 350, 400];
  const randomEngineCC = engineCCs[Math.floor(Math.random() * engineCCs.length)];
  
  // Generate owner name (first name for privacy)
  const ownerNames = ["Rahul", "Amit", "Priya", "Vikram", "Sneha", "Arjun", "Neha", "Karthik", "Ananya", "Suresh"];
  const randomOwnerName = ownerNames[Math.floor(Math.random() * ownerNames.length)];
  
  return {
    success: true,
    data: {
      // Owner & RC Details
      ownerName: randomOwnerName,
      registrationDate: registrationDate.toISOString().split("T")[0],
      rcStatus: "Active",
      rcValidUpto: new Date(registrationDate.getFullYear() + 15, registrationDate.getMonth(), registrationDate.getDate()).toISOString().split("T")[0],
      hypothecation: randomFinancier ? "Yes" : null,
      financier: randomFinancier,
      
      // Vehicle Specs
      make: randomMake,
      model: randomModel,
      variant: null,
      vehicleClass: randomEngineCC <= 125 ? "Motor Cycle/Scooter (up to 125cc)" : "Motor Cycle (above 125cc)",
      fuelType: randomMake === "TVS" && randomModel === "iQube" ? "Electric" : "Petrol",
      engineCC: randomMake === "TVS" && randomModel === "iQube" ? 0 : randomEngineCC,
      chassisNumber: `${randomMake.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      engineNumber: `${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      manufacturingYear: manufacturingYear,
      color: randomColor,
      seatingCapacity: 2,
      unladenWeight: 100 + Math.floor(Math.random() * 80),
      
      // Insurance & PUC
      insuranceCompany: randomInsurer,
      insuranceValidUpto: insuranceExpiry.toISOString().split("T")[0],
      insurancePolicyNumber: `POL${Math.random().toString().substring(2, 12)}`,
      pucValidUpto: pucExpiry.toISOString().split("T")[0],
      pucNumber: `PUC${stateCode}${Math.random().toString().substring(2, 10)}`,
      
      // Additional
      rtoName: rtoNames[stateCode] || "Unknown RTO",
      rtoCode: stateCode,
      vehicleAge: vehicleAge,
      fitnessValidUpto: fitnessExpiry.toISOString().split("T")[0],
      taxValidUpto: new Date(currentYear + 1, 2, 31).toISOString().split("T")[0],
      emissionNorms: vehicleAge <= 3 ? "BS-VI" : "BS-IV",
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationNumber } = await req.json();
    
    if (!registrationNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "Registration number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate registration format
    const pattern = /^[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/;
    const cleanedReg = registrationNumber.replace(/[-\s]/g, "").toUpperCase();
    
    if (!pattern.test(registrationNumber.replace(/\s/g, "").toUpperCase())) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid registration number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for Vahan API key
    const vahanApiKey = Deno.env.get("VAHAN_API_KEY");
    
    let response: VahanResponse;
    
    if (vahanApiKey) {
      // Production: Call actual Vahan API
      // Note: Replace with actual Vahan API endpoint and implementation
      // const vahanResponse = await fetch("https://api.vahan.gov.in/v1/vehicle", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${vahanApiKey}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ registrationNumber: cleanedReg }),
      // });
      // response = await vahanResponse.json();
      
      // For now, use mock data even with API key (replace when Vahan API is ready)
      console.log("Vahan API key found, but using mock data until API integration is complete");
      response = getMockVahanData(cleanedReg);
    } else {
      // Development: Use mock data
      console.log("No Vahan API key found, using mock data");
      response = getMockVahanData(cleanedReg);
    }
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Vahan lookup error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch vehicle details" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
