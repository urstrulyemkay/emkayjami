import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bike, Search } from "lucide-react";

const NewInspection = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState<{
    make: string;
    model: string;
    year: number;
    color: string;
    engineCC: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!registration.trim()) return;
    
    setIsSearching(true);
    // Mock API call - in real app would fetch from RTO database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setVehicleDetails({
      make: "Honda",
      model: "Activa 6G",
      year: 2023,
      color: "Pearl White",
      engineCC: 110,
    });
    setIsSearching(false);
  };

  const handleStartCapture = () => {
    if (vehicleDetails) {
      navigate("/inspection/capture", {
        state: {
          registration: registration.toUpperCase(),
          ...vehicleDetails,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">New Inspection</h1>
      </header>

      <div className="px-6 pb-8">
        {/* Registration Input */}
        <div className="mb-6">
          <Label htmlFor="registration" className="text-muted-foreground text-sm mb-2 block">
            Vehicle Registration
          </Label>
          <div className="flex gap-2">
            <Input
              id="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="MH-12-AB-1234"
              className="flex-1 h-12 text-lg uppercase"
            />
            <Button
              onClick={handleSearch}
              disabled={!registration.trim() || isSearching}
              className="h-12 w-12"
              size="icon"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Vehicle Details */}
        {isSearching && (
          <div className="p-6 rounded-xl border border-border bg-card animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-secondary rounded w-1/2" />
                <div className="h-4 bg-secondary rounded w-3/4" />
              </div>
            </div>
          </div>
        )}

        {vehicleDetails && !isSearching && (
          <div className="p-6 rounded-xl border border-border bg-card mb-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Bike className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  {vehicleDetails.make} {vehicleDetails.model}
                </p>
                <p className="text-muted-foreground">
                  {vehicleDetails.engineCC}cc • {vehicleDetails.color}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-muted-foreground text-sm">Registration</p>
                <p className="font-medium text-foreground">{registration}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Year</p>
                <p className="font-medium text-foreground">{vehicleDetails.year}</p>
              </div>
            </div>
          </div>
        )}

        {/* Start Capture Button */}
        {vehicleDetails && !isSearching && (
          <Button
            onClick={handleStartCapture}
            className="w-full h-14 text-base font-medium animate-slide-up"
            size="lg"
          >
            Begin Evidence Capture
          </Button>
        )}

        {/* Instructions */}
        {!vehicleDetails && !isSearching && (
          <div className="mt-8 space-y-4">
            <p className="text-muted-foreground text-sm">Instructions</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <p className="text-foreground text-sm">Enter the 2-wheeler registration number</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <p className="text-foreground text-sm">Verify the vehicle details</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <p className="text-foreground text-sm">Capture all 12 mandatory images</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <p className="text-foreground text-sm">Record voice notes for defects</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewInspection;
