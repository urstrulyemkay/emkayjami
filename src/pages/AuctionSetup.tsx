import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, Users, ChevronRight, AlertCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUCTION_TYPES,
  BROKER_NETWORKS,
  MOCK_BROKERS,
  AuctionType,
  BrokerNetworkType,
  formatDuration,
} from "@/data/auctionTypes";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VehicleState {
  registration: string;
  make: string;
  model: string;
  year: number;
  conditionGrade?: string;
}

const AuctionSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const vehicleData = location.state as VehicleState | null;

  const [selectedAuctionType, setSelectedAuctionType] = useState<AuctionType>("flexible");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedNetwork, setSelectedNetwork] = useState<BrokerNetworkType>("my_network");
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>(
    MOCK_BROKERS.filter((b) => b.tier >= 3).map((b) => b.id)
  );
  const [minTier, setMinTier] = useState<number>(3);

  const auctionTypeConfig = AUCTION_TYPES.find((t) => t.type === selectedAuctionType)!;

  // Filter brokers based on network selection
  const availableBrokers = useMemo(() => {
    if (selectedNetwork === "my_network") {
      return MOCK_BROKERS.filter((b) => b.city === "Bangalore" && b.tier >= 3);
    }
    if (selectedNetwork === "drivex_network") {
      return MOCK_BROKERS.filter((b) => b.tier >= minTier);
    }
    return MOCK_BROKERS;
  }, [selectedNetwork, minTier]);

  const toggleBroker = (brokerId: string) => {
    setSelectedBrokers((prev) =>
      prev.includes(brokerId)
        ? prev.filter((id) => id !== brokerId)
        : [...prev, brokerId]
    );
  };

  const handleLaunchAuction = () => {
    if (selectedBrokers.length < 3 && selectedAuctionType !== "one_click") {
      toast({
        title: "Too few brokers",
        description: "Select at least 3 brokers for better competition",
        variant: "destructive",
      });
      return;
    }

    // Navigate to live auction with config
    navigate("/auction/live", {
      state: {
        vehicle: vehicleData || {
          registration: "KA-01-AB-1234",
          make: "Honda",
          model: "Activa 6G",
          year: 2023,
        },
        auctionType: selectedAuctionType,
        duration: selectedDuration,
        brokerNetwork: selectedNetwork,
        selectedBrokers,
        estimatedPrice: 35000, // Mock base price
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Set Up Auction</h1>
          <p className="text-sm text-muted-foreground">
            {vehicleData?.make} {vehicleData?.model} • {vehicleData?.registration}
          </p>
        </div>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Auction Type Selection */}
        <section>
          <h2 className="font-medium text-foreground mb-3">Choose Auction Type</h2>
          <div className="space-y-3">
            {AUCTION_TYPES.map((auctionType) => (
              <button
                key={auctionType.type}
                onClick={() => {
                  setSelectedAuctionType(auctionType.type);
                  setSelectedDuration(auctionType.defaultDuration);
                }}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all",
                  selectedAuctionType === auctionType.type
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{auctionType.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{auctionType.title}</p>
                      {selectedAuctionType === auctionType.type && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {auctionType.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                        {auctionType.expectedBids}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        SLA: {auctionType.slaMins} min
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Duration Selection */}
        {auctionTypeConfig.durations.length > 1 && (
          <section>
            <h2 className="font-medium text-foreground mb-3">Duration</h2>
            <div className="flex gap-2">
              {auctionTypeConfig.durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl border text-center transition-all",
                    selectedDuration === duration
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground"
                  )}
                >
                  {formatDuration(duration)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Broker Network Selection */}
        <section>
          <h2 className="font-medium text-foreground mb-3">Broker Network</h2>
          <div className="space-y-2">
            {BROKER_NETWORKS.map((network) => (
              <button
                key={network.type}
                onClick={() => setSelectedNetwork(network.type)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left transition-all",
                  selectedNetwork === network.type
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{network.title}</p>
                    <p className="text-sm text-muted-foreground">{network.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{network.brokerCount}</span>
                    {selectedNetwork === network.type && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* DriveX Network Tier Filter */}
        {selectedNetwork === "drivex_network" && (
          <section>
            <h2 className="font-medium text-foreground mb-3">Minimum Broker Tier</h2>
            <Select value={minTier.toString()} onValueChange={(v) => setMinTier(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">All tiers (1-5)</SelectItem>
                <SelectItem value="2">Level 2+</SelectItem>
                <SelectItem value="3">Level 3+ (Recommended)</SelectItem>
                <SelectItem value="4">Level 4+</SelectItem>
                <SelectItem value="5">Level 5 only</SelectItem>
              </SelectContent>
            </Select>
          </section>
        )}

        {/* Custom Broker Selection */}
        {selectedNetwork === "custom" && (
          <section>
            <h2 className="font-medium text-foreground mb-3">Select Brokers</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {MOCK_BROKERS.map((broker) => (
                <div
                  key={broker.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <Checkbox
                    checked={selectedBrokers.includes(broker.id)}
                    onCheckedChange={() => toggleBroker(broker.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{broker.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Level {broker.tier}</span>
                      <span>•</span>
                      <span>{broker.city}</span>
                      <span>•</span>
                      <span>{broker.winRate}% win rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Broker Count Warning */}
        {selectedBrokers.length < 3 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Few brokers selected</p>
              <p className="text-sm text-muted-foreground">
                Fewer brokers = fewer bids. Recommend 5+ for better competition.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <section className="p-4 rounded-xl bg-card border border-border">
          <h2 className="font-medium text-foreground mb-3">Auction Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="text-foreground">
                {vehicleData?.make || "Honda"} {vehicleData?.model || "Activa 6G"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auction Type</span>
              <span className="text-foreground">{auctionTypeConfig.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="text-foreground">{formatDuration(selectedDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brokers</span>
              <span className="text-foreground">
                {selectedNetwork === "custom"
                  ? `${selectedBrokers.length} selected`
                  : availableBrokers.length + " brokers"}
              </span>
            </div>
          </div>
        </section>

        {/* Launch Button */}
        <Button
          onClick={handleLaunchAuction}
          className="w-full h-14 text-base font-medium"
          size="lg"
        >
          Launch Auction
        </Button>
      </div>
    </div>
  );
};

export default AuctionSetup;
