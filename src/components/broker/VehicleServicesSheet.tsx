import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  FileText,
  Shield,
  AlertTriangle,
  Wrench,
  Coins,
  Sparkles,
  Check,
  Info,
  ChevronRight,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  estimatedDays: string;
  popular?: boolean;
}

interface VehicleServicesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleName: string;
  availableCoins: number;
  onServiceRequest?: (services: string[], coinsUsed: number, totalAmount: number) => void;
}

const SERVICES: Service[] = [
  {
    id: "logistics",
    name: "Vehicle Logistics",
    description: "Doorstep pickup & delivery across India",
    icon: <Truck className="w-5 h-5" />,
    price: 3500,
    estimatedDays: "2-4 days",
    popular: true,
  },
  {
    id: "rc_transfer",
    name: "RC Transfer",
    description: "Complete ownership transfer with RTO",
    icon: <FileText className="w-5 h-5" />,
    price: 4500,
    estimatedDays: "15-30 days",
    popular: true,
  },
  {
    id: "insurance",
    name: "Insurance Transfer",
    description: "Transfer existing policy to new owner",
    icon: <Shield className="w-5 h-5" />,
    price: 1500,
    estimatedDays: "3-5 days",
  },
  {
    id: "challan_clearance",
    name: "Challan Clearance",
    description: "Clear all pending traffic challans",
    icon: <AlertTriangle className="w-5 h-5" />,
    price: 500,
    estimatedDays: "1-2 days",
  },
  {
    id: "fitness_renewal",
    name: "Fitness Certificate",
    description: "Renew vehicle fitness certificate",
    icon: <Wrench className="w-5 h-5" />,
    price: 2000,
    estimatedDays: "5-7 days",
  },
  {
    id: "noc",
    name: "NOC Processing",
    description: "Get No Objection Certificate for inter-state",
    icon: <FileText className="w-5 h-5" />,
    price: 2500,
    estimatedDays: "7-10 days",
  },
];

const formatPrice = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

const VehicleServicesSheet = ({
  open,
  onOpenChange,
  vehicleName,
  availableCoins,
  onServiceRequest,
}: VehicleServicesSheetProps) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);

  // Calculate totals
  const { subtotal, maxRedeemable, discount, finalAmount } = useMemo(() => {
    const subtotal = selectedServices.reduce((sum, serviceId) => {
      const service = SERVICES.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);

    // Max 50% discount via coins, 1 coin = ₹1
    const maxByPercentage = Math.floor(subtotal * 0.5);
    const maxRedeemable = Math.min(availableCoins, maxByPercentage);
    
    const discount = Math.min(coinsToRedeem, maxRedeemable);
    const finalAmount = subtotal - discount;

    return { subtotal, maxRedeemable, discount, finalAmount };
  }, [selectedServices, availableCoins, coinsToRedeem]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = () => {
    onServiceRequest?.(selectedServices, coinsToRedeem, finalAmount);
    onOpenChange(false);
  };

  const handleCoinsChange = (value: number[]) => {
    setCoinsToRedeem(Math.min(value[0], maxRedeemable));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bike className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">DriveX Services</SheetTitle>
              <SheetDescription className="text-xs">
                for {vehicleName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100%-180px)] -mx-6 px-6">
          {/* Coins Balance */}
          <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 mb-4">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm font-medium">Your Coins</p>
                  <p className="text-xs text-muted-foreground">Redeem up to 50% on services</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-warning">{availableCoins.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">available</p>
              </div>
            </CardContent>
          </Card>

          {/* Services List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">Select Services</p>
            
            {SERVICES.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              
              return (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  )}
                  onClick={() => toggleService(service.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {service.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{service.name}</h4>
                          {service.popular && (
                            <Badge className="bg-accent/10 text-accent border-0 text-[9px] px-1.5 h-4">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            ⏱ {service.estimatedDays}
                          </span>
                          <span className="font-semibold text-sm">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Checkbox
                          checked={isSelected}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Coin Redemption Slider */}
          {selectedServices.length > 0 && maxRedeemable > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Redeem Coins</span>
                </div>
                <span className="text-sm font-bold text-warning">
                  -{formatPrice(coinsToRedeem)}
                </span>
              </div>
              <Slider
                value={[coinsToRedeem]}
                onValueChange={handleCoinsChange}
                max={maxRedeemable}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 coins</span>
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Max {maxRedeemable} (50% of order)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Order Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          {selectedServices.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between mb-2 text-sm text-warning">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    Coins Discount
                  </span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">{formatPrice(finalAmount)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleSubmit}>
                <Check className="w-4 h-4 mr-2" />
                Request {selectedServices.length} Service{selectedServices.length > 1 ? "s" : ""}
              </Button>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Select services to see pricing
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VehicleServicesSheet;
