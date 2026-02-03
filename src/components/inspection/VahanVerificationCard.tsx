import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Shield,
  FileText,
  Bike,
  Banknote,
  Leaf,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VahanVehicleData, VahanValidationStatus, getValidationStatuses } from "@/types/vahan";
import { Badge } from "@/components/ui/badge";

interface VahanVerificationCardProps {
  data: VahanVehicleData;
  customerName?: string;
  onNameMismatch?: () => void;
}

const StatusIcon = ({ status }: { status: VahanValidationStatus["status"] }) => {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "expired":
      return <XCircle className="w-4 h-4 text-destructive" />;
    case "missing":
      return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusBgColor = (status: VahanValidationStatus["status"]) => {
  switch (status) {
    case "valid":
      return "bg-green-500/10 border-green-500/20";
    case "warning":
      return "bg-warning/10 border-warning/20";
    case "expired":
      return "bg-destructive/10 border-destructive/20";
    case "missing":
      return "bg-muted border-border";
  }
};

export function VahanVerificationCard({ 
  data, 
  customerName,
  onNameMismatch 
}: VahanVerificationCardProps) {
  const validationStatuses = getValidationStatuses(data);
  const hasIssues = validationStatuses.some(s => s.status === "expired" || s.status === "warning");
  
  // Check customer name match
  const nameMatches = customerName 
    ? data.ownerName.toLowerCase().includes(customerName.toLowerCase()) ||
      customerName.toLowerCase().includes(data.ownerName.toLowerCase())
    : true;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        hasIssues ? "bg-warning/10 border-warning/20" : "bg-green-500/10 border-green-500/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={cn(
              "w-5 h-5",
              hasIssues ? "text-warning" : "text-green-500"
            )} />
            <span className="font-semibold text-foreground">Vahan Verification</span>
          </div>
          <Badge variant={hasIssues ? "outline" : "default"} className={cn(
            hasIssues 
              ? "border-warning text-warning" 
              : "bg-green-500 text-white"
          )}>
            {hasIssues ? "Attention Required" : "Verified"}
          </Badge>
        </div>
      </div>

      {/* Owner & Vehicle Info */}
      <div className="p-4 space-y-4">
        {/* Owner Name Match */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          nameMatches 
            ? "bg-green-500/10 border-green-500/20" 
            : "bg-destructive/10 border-destructive/20"
        )}>
          <div className="flex items-center gap-3">
            {nameMatches ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">RC Owner Name</p>
              <p className="text-xs text-muted-foreground">{data.ownerName}</p>
            </div>
          </div>
          {!nameMatches && (
            <Badge variant="destructive" className="text-xs">
              Name Mismatch
            </Badge>
          )}
        </div>

        {/* Vehicle Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Bike className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Vehicle</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {data.make} {data.model}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Year</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {data.manufacturingYear} ({data.vehicleAge} yrs old)
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Emission</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {data.emissionNorms || "N/A"}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">RTO</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {data.rtoCode} - {data.rtoName}
            </p>
          </div>
        </div>

        {/* Validation Status Items */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Document Status
          </p>
          {validationStatuses.map((status) => (
            <div
              key={status.field}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                getStatusBgColor(status.status)
              )}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={status.status} />
                <span className="text-sm font-medium text-foreground">
                  {status.label}
                </span>
              </div>
              <span className={cn(
                "text-xs",
                status.status === "valid" && "text-green-600",
                status.status === "warning" && "text-warning",
                status.status === "expired" && "text-destructive",
                status.status === "missing" && "text-muted-foreground"
              )}>
                {status.message}
              </span>
            </div>
          ))}
        </div>

        {/* Hypothecation Warning */}
        {data.hypothecation && data.financier && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Vehicle Under Hypothecation
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Financed by {data.financier}. NOC required for transfer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
