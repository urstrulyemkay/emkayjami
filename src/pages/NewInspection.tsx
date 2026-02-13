import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Bike, Search, AlertTriangle, User, Loader2, Zap, Shield } from "lucide-react";
import {
  VEHICLE_MAKES,
  VEHICLE_MODELS,
  getModelsByMake,
  getVehicleYears,
  VEHICLE_COLORS,
} from "@/data/vehicleModels";
import { useToast } from "@/hooks/use-toast";
import { useInspectionPersistence } from "@/hooks/useInspectionPersistence";
import { useVahanLookup, VahanVehicleData } from "@/hooks/useVahanLookup";
import { VahanVerificationCard } from "@/components/inspection/VahanVerificationCard";

const NewInspection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createInspection, isLoading: isPersistenceLoading, isAuthenticated } = useInspectionPersistence();
  const { lookupVehicle, isLoading: isVahanLoading, vehicleData, clearData: clearVahanData } = useVahanLookup();

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Vehicle details
  const [registration, setRegistration] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [odometerReading, setOdometerReading] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);

  // Get models for selected make
  const availableModels = useMemo(() => {
    if (!selectedMake) return [];
    return getModelsByMake(selectedMake);
  }, [selectedMake]);

  // Get selected model data
  const selectedModelData = useMemo(() => {
    return VEHICLE_MODELS.find(
      (m) => m.make === selectedMake && m.model === selectedModel
    );
  }, [selectedMake, selectedModel]);

  const years = getVehicleYears();

  // Validate registration format (Indian 2-wheeler format)
  const isValidRegistration = (reg: string) => {
    const pattern = /^[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/;
    return pattern.test(reg.replace(/\s/g, "").toUpperCase());
  };

  // Validate phone number
  const isValidPhone = (phone: string) => {
    const pattern = /^[6-9]\d{9}$/;
    return pattern.test(phone.replace(/\s/g, ""));
  };

  // Auto-fill form from Vahan data
  const autoFillFromVahan = (data: VahanVehicleData) => {
    // Try to match make from our list
    const matchedMake = VEHICLE_MAKES.find(
      (m) => m.toLowerCase() === data.make.toLowerCase()
    );
    if (matchedMake) {
      setSelectedMake(matchedMake);
      
      // Try to match model
      const modelsForMake = getModelsByMake(matchedMake);
      const matchedModel = modelsForMake.find(
        (m) => m.model.toLowerCase().includes(data.model.toLowerCase()) ||
               data.model.toLowerCase().includes(m.model.toLowerCase())
      );
      if (matchedModel) {
        setSelectedModel(matchedModel.model);
      }
    }
    
    // Set year and color
    setSelectedYear(data.manufacturingYear.toString());
    
    // Try to match color
    const matchedColor = VEHICLE_COLORS.find(
      (c) => c.toLowerCase().includes(data.color.toLowerCase()) ||
             data.color.toLowerCase().includes(c.toLowerCase())
    );
    if (matchedColor) {
      setSelectedColor(matchedColor);
    }
    
    // Auto-fill owner name if customer name is empty
    if (!customerName.trim()) {
      setCustomerName(data.ownerName);
    }
    
    setVehicleFound(true);
  };

  const handleSearch = async () => {
    if (!isValidRegistration(registration)) {
      toast({
        title: "Invalid registration",
        description: "Please enter a valid registration number (e.g., MH-12-AB-1234)",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Auto-fill with realistic mock data
    const testMakes = ["Honda", "TVS", "Bajaj", "Yamaha", "Royal Enfield", "Hero", "Suzuki"];
    const randomMake = testMakes[Math.floor(Math.random() * testMakes.length)];
    const modelsForMake = getModelsByMake(randomMake);
    const randomModel = modelsForMake.length > 0 ? modelsForMake[Math.floor(Math.random() * modelsForMake.length)] : null;
    const ownerNames = ["Rajesh", "Suresh", "Amit", "Vikram", "Arun", "Karthik", "Pradeep", "Manoj", "Ravi", "Sanjay"];
    
    setSelectedMake(randomMake);
    setSelectedModel(randomModel?.model || "");
    setSelectedYear((2019 + Math.floor(Math.random() * 6)).toString());
    setSelectedColor(VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)]);
    setOdometerReading((5000 + Math.floor(Math.random() * 45000)).toString());
    
    if (!customerName.trim()) {
      setCustomerName(ownerNames[Math.floor(Math.random() * ownerNames.length)]);
    }
    
    setVehicleFound(true);
    setIsSearching(false);
    
    toast({
      title: "Vehicle found",
      description: `${randomMake} ${randomModel?.model || ""} - Auto-filled`,
    });
  };

  // Auto-fill all fields for testing
  const handleAutoFillTest = () => {
    const testNames = ["Rahul", "Amit", "Priya", "Vikram", "Sneha"];
    const testPhones = ["9876543210", "8765432109", "7654321098", "9988776655", "8877665544"];
    const testRegs = ["KA-01-AB-1234", "MH-02-CD-5678", "DL-03-EF-9012", "TN-04-GH-3456"];
    const testMakes = ["Honda", "TVS", "Bajaj", "Yamaha", "Royal Enfield"];
    
    const randomMake = testMakes[Math.floor(Math.random() * testMakes.length)];
    const modelsForMake = getModelsByMake(randomMake);
    const randomModel = modelsForMake.length > 0 ? modelsForMake[Math.floor(Math.random() * modelsForMake.length)] : null;
    
    setCustomerName(testNames[Math.floor(Math.random() * testNames.length)]);
    setCustomerPhone(testPhones[Math.floor(Math.random() * testPhones.length)]);
    setRegistration(testRegs[Math.floor(Math.random() * testRegs.length)]);
    setSelectedMake(randomMake);
    setSelectedModel(randomModel?.model || "");
    setSelectedYear((2020 + Math.floor(Math.random() * 5)).toString());
    setSelectedColor(VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)]);
    setOdometerReading((5000 + Math.floor(Math.random() * 50000)).toString());
    setVehicleFound(true);
    
    toast({
      title: "Test data filled",
      description: "All fields auto-filled for testing",
    });
  };

  const handleCreateNew = () => {
    setShowDuplicateWarning(false);
    setVehicleFound(true);
  };

  const canProceed = () => {
    return (
      customerName.trim().length > 0 &&
      isValidPhone(customerPhone) &&
      isValidRegistration(registration) &&
      selectedMake &&
      selectedModel &&
      selectedYear &&
      selectedColor
    );
  };

  const handleStartInspection = async () => {
    if (!canProceed()) {
      toast({
        title: "Incomplete details",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check authentication before proceeding
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an inspection",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsCreating(true);

    const inspectionData = {
      customerName,
      customerPhone,
      registration: registration.toUpperCase(),
      make: selectedMake,
      model: selectedModel,
      year: parseInt(selectedYear),
      color: selectedColor,
      engineCC: selectedModelData?.engineCC || 0,
      odometerReading: parseInt(odometerReading) || 0,
    };

    // Create inspection in database
    const inspectionId = await createInspection(inspectionData);

    if (!inspectionId) {
      setIsCreating(false);
      return; // Toast already shown by createInspection
    }

    setIsCreating(false);

    navigate("/inspection/capture", {
      state: {
        ...inspectionData,
        inspectionId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">New Inspection</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoFillTest}
          className="gap-1 text-xs border-warning/50 text-warning hover:bg-warning/10"
        >
          <Zap className="w-3.5 h-3.5" />
          Auto-Fill
        </Button>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Customer Details Section */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-medium text-foreground">Customer Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-muted-foreground text-sm">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="First name only"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-muted-foreground text-sm">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">+91</span>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1"
                  maxLength={10}
                />
              </div>
              {customerPhone && !isValidPhone(customerPhone) && (
                <p className="text-xs text-destructive mt-1">
                  Enter valid 10-digit mobile number
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Bike className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-medium text-foreground">Vehicle Details</h2>
          </div>

          {/* Registration Search */}
          <div className="mb-4">
            <Label htmlFor="registration" className="text-muted-foreground text-sm">
              Registration Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="registration"
                value={registration}
                onChange={(e) => {
                  setRegistration(e.target.value.toUpperCase());
                  setVehicleFound(false);
                  setShowDuplicateWarning(false);
                  clearVahanData();
                }}
                placeholder="MH-12-AB-1234"
                className="flex-1 uppercase"
              />
              <Button
                onClick={handleSearch}
                disabled={!registration.trim() || isSearching}
                size="icon"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Format: XX-00-XX-0000 (e.g., KA-01-AB-1234)
            </p>
          </div>

          {/* Duplicate Warning */}
          {showDuplicateWarning && (
            <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Vehicle Previously Inspected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This Honda Activa 6G was inspected on 15-Jan-2026 at Bangalore Counter.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      View Previous
                    </Button>
                    <Button size="sm" onClick={handleCreateNew}>
                      Create New
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Searching state */}
          {(isSearching || isVahanLoading) && (
            <div className="mb-4 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Fetching from Vahan</p>
                  <p className="text-xs text-muted-foreground">Verifying vehicle details...</p>
                </div>
              </div>
            </div>
          )}

          {/* Vahan Verification Card */}
          {vehicleData && !isSearching && !isVahanLoading && (
            <div className="mb-4">
              <VahanVerificationCard 
                data={vehicleData} 
                customerName={customerName}
              />
            </div>
          )}

          {/* Vehicle form */}
          {(vehicleFound || !isSearching) && !showDuplicateWarning && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Make <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedMake} onValueChange={(v) => {
                    setSelectedMake(v);
                    setSelectedModel("");
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_MAKES.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={!selectedMake}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.model} value={m.model}>
                          {m.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Year <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground text-sm">
                    Color <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">
                  Odometer Reading (KMs)
                </Label>
                <Input
                  value={odometerReading}
                  onChange={(e) => setOdometerReading(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g., 12450"
                  className="mt-1"
                />
              </div>

              {/* Engine CC display */}
              {selectedModelData && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Engine</span>
                    <span className="font-medium text-foreground">
                      {selectedModelData.engineCC === 0 
                        ? "Electric" 
                        : `${selectedModelData.engineCC}cc`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">
                      {selectedModelData.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start Inspection Button */}
        <Button
          onClick={handleStartInspection}
          disabled={!canProceed() || isCreating}
          className="w-full h-14 text-base font-medium gap-2"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Inspection...
            </>
          ) : (
            "Begin Inspection"
          )}
        </Button>

        {/* Instructions when form is empty */}
        {!vehicleFound && !isSearching && !showDuplicateWarning && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Quick steps:</p>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0">
                1
              </span>
              <p className="text-foreground text-sm">Enter customer name and phone</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                2
              </span>
              <p className="text-foreground text-sm">Search registration to auto-fill vehicle details</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                3
              </span>
              <p className="text-foreground text-sm">Verify details and start 6-step inspection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewInspection;
