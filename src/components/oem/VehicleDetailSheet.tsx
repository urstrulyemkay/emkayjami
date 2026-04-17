import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/data/oemTypes";
import { StageBadge } from "./StageBadge";
import { formatINR, getSe, STAGE_LABELS } from "@/data/oemMockData";
import { Phone, MapPin, Calendar, Gauge, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMELINE: Array<{ stage: Vehicle["stage"]; label: string }> = [
  { stage: "registered", label: "Registered" },
  { stage: "inspected", label: "Inspected" },
  { stage: "listed", label: "Listed" },
  { stage: "live", label: "Live Auction" },
  { stage: "allocated", label: "Allocated" },
  { stage: "transit", label: "In Transit" },
  { stage: "closed", label: "Closed" },
];

export const VehicleDetailSheet = ({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  if (!vehicle) return null;
  const se = getSe(vehicle.seId);
  const stageIdx = TIMELINE.findIndex((t) => t.stage === vehicle.stage);
  const isFailed = vehicle.stage === "failed";

  const cta = (() => {
    switch (vehicle.stage) {
      case "registered": return "Schedule Inspection";
      case "inspected": return "Create Listing";
      case "listed": return "Edit Listing";
      case "live": return "View Live Auction";
      case "allocated": return "Schedule Pickup";
      case "transit": return "Track Pickup";
      case "closed": return "View Deal";
      case "failed": return "Re-list Vehicle";
    }
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[88vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-lg">{vehicle.make} {vehicle.model}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{vehicle.reg}</p>
            </div>
            <StageBadge stage={vehicle.stage} />
          </div>
        </SheetHeader>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span>{vehicle.km.toLocaleString("en-IN")} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span>{vehicle.color}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground text-xs">CC</span>
            <span>{vehicle.cc}</span>
          </div>
        </div>

        {/* Pricing */}
        {(vehicle.listedPrice || vehicle.highestBid || vehicle.finalPrice) && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-2">
              {vehicle.listedPrice != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Listed</p>
                  <p className="font-semibold">{formatINR(vehicle.listedPrice)}</p>
                </div>
              )}
              {vehicle.highestBid != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Highest</p>
                  <p className="font-semibold">{formatINR(vehicle.highestBid)}</p>
                </div>
              )}
              {vehicle.finalPrice != null && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Final</p>
                  <p className="font-semibold text-success">{formatINR(vehicle.finalPrice)}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Failure reason */}
        {isFailed && vehicle.failureReason && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-xs font-medium text-destructive uppercase">Failure reason</p>
            <p className="text-sm mt-1">{vehicle.failureReason}</p>
          </div>
        )}

        {/* Timeline */}
        <Separator className="my-4" />
        <p className="text-sm font-semibold mb-3">Status Timeline</p>
        <div className="space-y-3">
          {TIMELINE.map((t, idx) => {
            const done = idx <= stageIdx && !isFailed;
            const current = idx === stageIdx && !isFailed;
            return (
              <div key={t.stage} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 shrink-0",
                    done ? "bg-success border-success" : current ? "bg-primary border-primary" : "bg-background border-border",
                  )}
                />
                <p className={cn("text-sm", done || current ? "text-foreground font-medium" : "text-muted-foreground")}>
                  {t.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Assigned SE */}
        {se && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Assigned SE</p>
                <p className="text-sm font-medium">{se.name}</p>
              </div>
              <Button variant="outline" size="sm">
                <Phone className="w-3.5 h-3.5" />
                Call
              </Button>
            </div>
          </>
        )}

        <div className="sticky bottom-0 bg-background pt-4 mt-4 -mx-6 px-6 pb-2 border-t">
          <Button className="w-full" size="lg">{cta}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
