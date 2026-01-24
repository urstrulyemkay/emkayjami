import { Checkpoint, CheckpointOption } from "@/data/inspectionCheckpoints";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleCheckpointCardProps {
  checkpoint: Checkpoint;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function SimpleCheckpointCard({
  checkpoint,
  selectedValue,
  onSelect,
}: SimpleCheckpointCardProps) {
  const getSeverityColor = (option: CheckpointOption) => {
    if (option.value !== selectedValue) return "";
    
    switch (option.severity) {
      case "ok":
        return "border-success bg-success/10 text-success";
      case "minor":
        return "border-warning bg-warning/10 text-warning";
      case "major":
        return "border-destructive bg-destructive/10 text-destructive";
      case "critical":
        return "border-destructive bg-destructive/20 text-destructive font-semibold";
      default:
        return "border-primary bg-primary/10 text-primary";
    }
  };

  return (
    <div className="p-3 rounded-xl border border-border bg-card">
      {/* Question */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-foreground">
          {checkpoint.question}
          {checkpoint.required && <span className="text-destructive ml-1">*</span>}
        </p>
        {selectedValue && (
          <Check className="w-4 h-4 text-success flex-shrink-0" />
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-1.5">
        {checkpoint.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg border text-xs transition-all",
              selectedValue === option.value
                ? getSeverityColor(option)
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}