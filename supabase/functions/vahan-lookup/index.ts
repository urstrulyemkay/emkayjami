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
  
  // Generate realistic mock data for Indian 2-wheelers
  const vehicleData: { make: string; model: string; engineCC: number; category: string }[] = [
    // Honda
    { make: "Honda", model: "Activa 6G", engineCC: 110, category: "Scooter" },
    { make: "Honda", model: "Shine", engineCC: 125, category: "Commuter" },
    { make: "Honda", model: "Unicorn", engineCC: 160, category: "Commuter" },
    { make: "Honda", model: "SP 125", engineCC: 125, category: "Commuter" },
    { make: "Honda", model: "Dio", engineCC: 110, category: "Scooter" },
    { make: "Honda", model: "CB350", engineCC: 350, category: "Cruiser" },
    // TVS
    { make: "TVS", model: "Jupiter", engineCC: 110, category: "Scooter" },
    { make: "TVS", model: "Apache RTR 160", engineCC: 160, category: "Sports" },
    { make: "TVS", model: "Ntorq 125", engineCC: 125, category: "Scooter" },
    { make: "TVS", model: "Raider 125", engineCC: 125, category: "Commuter" },
    { make: "TVS", model: "iQube Electric", engineCC: 0, category: "Electric Scooter" },
    { make: "TVS", model: "Apache RR 310", engineCC: 310, category: "Sports" },
    // Bajaj
    { make: "Bajaj", model: "Pulsar NS200", engineCC: 200, category: "Sports" },
    { make: "Bajaj", model: "Pulsar 150", engineCC: 150, category: "Sports" },
    { make: "Bajaj", model: "Platina 110", engineCC: 110, category: "Commuter" },
    { make: "Bajaj", model: "CT 110", engineCC: 110, category: "Commuter" },
    { make: "Bajaj", model: "Dominar 400", engineCC: 400, category: "Touring" },
    { make: "Bajaj", model: "Chetak Electric", engineCC: 0, category: "Electric Scooter" },
    // Yamaha
    { make: "Yamaha", model: "FZ-S V3", engineCC: 150, category: "Street" },
    { make: "Yamaha", model: "Ray ZR 125", engineCC: 125, category: "Scooter" },
    { make: "Yamaha", model: "R15 V4", engineCC: 155, category: "Sports" },
    { make: "Yamaha", model: "MT-15 V2", engineCC: 155, category: "Street" },
    { make: "Yamaha", model: "Fascino 125", engineCC: 125, category: "Scooter" },
    // Royal Enfield
    { make: "Royal Enfield", model: "Classic 350", engineCC: 350, category: "Cruiser" },
    { make: "Royal Enfield", model: "Meteor 350", engineCC: 350, category: "Cruiser" },
    { make: "Royal Enfield", model: "Hunter 350", engineCC: 350, category: "Roadster" },
    { make: "Royal Enfield", model: "Bullet 350", engineCC: 350, category: "Classic" },
    { make: "Royal Enfield", model: "Himalayan", engineCC: 411, category: "Adventure" },
    // Hero
    { make: "Hero", model: "Splendor Plus", engineCC: 100, category: "Commuter" },
    { make: "Hero", model: "HF Deluxe", engineCC: 100, category: "Commuter" },
    { make: "Hero", model: "Xtreme 160R", engineCC: 160, category: "Sports" },
    { make: "Hero", model: "Glamour", engineCC: 125, category: "Commuter" },
    { make: "Hero", model: "Passion Pro", engineCC: 110, category: "Commuter" },
    { make: "Hero", model: "Destini 125", engineCC: 125, category: "Scooter" },
    // Suzuki
    { make: "Suzuki", model: "Access 125", engineCC: 125, category: "Scooter" },
    { make: "Suzuki", model: "Burgman Street", engineCC: 125, category: "Scooter" },
    { make: "Suzuki", model: "Gixxer SF 250", engineCC: 250, category: "Sports" },
    { make: "Suzuki", model: "Avenis 125", engineCC: 125, category: "Scooter" },
  ];
  
  const colors = ["Pearl Spartan Red", "Matte Black", "Pearl White", "Racing Blue", "Titanium Grey", "Candy Orange", "Midnight Blue", "Glitter Silver"];
  const financiers = ["HDFC Bank", "ICICI Bank", "Bajaj Finance", "TVS Credit", "Mahindra Finance", null, null, null]; // null = no loan
  const insurers = ["ICICI Lombard", "HDFC ERGO", "Bajaj Allianz", "New India Assurance", "TATA AIG", "United India Insurance"];
  
  const randomVehicle = vehicleData[Math.floor(Math.random() * vehicleData.length)];
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
  
  const rtoNames: Record<string, string> = {
    "KA": "Karnataka RTO",
    "MH": "Maharashtra RTO",
    "DL": "Delhi RTO",
    "TN": "Tamil Nadu RTO",
    "UP": "Uttar Pradesh RTO",
    "GJ": "Gujarat RTO",
    "RJ": "Rajasthan RTO",
    "WB": "West Bengal RTO",
    "AP": "Andhra Pradesh RTO",
    "TS": "Telangana RTO",
    "KL": "Kerala RTO",
    "PB": "Punjab RTO",
    "HR": "Haryana RTO",
    "MP": "Madhya Pradesh RTO",
    "BR": "Bihar RTO",
  };
  
  // Generate owner name (common Indian first names)
  const ownerNames = ["Rajesh", "Suresh", "Amit", "Vikram", "Arun", "Karthik", "Pradeep", "Manoj", "Ravi", "Sanjay", "Deepak", "Rahul", "Ankit", "Nitin", "Vivek"];
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
      make: randomVehicle.make,
      model: randomVehicle.model,
      variant: randomVehicle.category,
      vehicleClass: randomVehicle.engineCC === 0 ? "Electric Two Wheeler" : randomVehicle.engineCC <= 125 ? "Motor Cycle/Scooter (up to 125cc)" : "Motor Cycle (above 125cc)",
      fuelType: randomVehicle.engineCC === 0 ? "Electric" : "Petrol",
      engineCC: randomVehicle.engineCC,
      chassisNumber: `${randomVehicle.make.substring(0, 2).toUpperCase()}${manufacturingYear.toString().substring(2)}${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      engineNumber: `${randomVehicle.make.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      manufacturingYear: manufacturingYear,
      color: randomColor,
      seatingCapacity: 2,
      unladenWeight: randomVehicle.engineCC === 0 ? 118 : 100 + Math.floor(randomVehicle.engineCC / 3),
      
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
