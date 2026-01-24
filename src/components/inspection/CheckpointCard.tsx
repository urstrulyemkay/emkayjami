import { useState } from "react";
import { Checkpoint, CheckpointOption } from "@/data/inspectionCheckpoints";
import { Mic, MicOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckpointCardProps {
  checkpoint: Checkpoint;
  selectedValue?: string;
  voiceNote?: string;
  onSelect: (value: string) => void;
  onVoiceNote: (note: string) => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function CheckpointCard({
  checkpoint,
  selectedValue,
  voiceNote,
  onSelect,
  onVoiceNote,
  isRecording = false,
  onStartRecording,
  onStopRecording,
}: CheckpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
        return "border-destructive bg-destructive/20 text-destructive";
      default:
        return "border-primary bg-primary/10 text-primary";
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      {/* Question */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-medium text-foreground">
          {checkpoint.question}
          {checkpoint.required && <span className="text-destructive ml-1">*</span>}
        </p>
        {selectedValue && (
          <Check className="w-5 h-5 text-success flex-shrink-0" />
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2 mb-3">
        {checkpoint.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "px-3 py-2 rounded-lg border text-sm transition-all",
              selectedValue === option.value
                ? getSeverityColor(option)
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Voice note section */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isRecording) {
                onStopRecording?.();
              } else {
                onStartRecording?.();
              }
            }}
            className={cn(
              "gap-2",
              isRecording && "border-destructive text-destructive"
            )}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Add note
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            {checkpoint.voicePrompt}
          </span>
        </div>

        {/* Voice note display */}
        {voiceNote && (
          <div className="mt-2 p-2 rounded-lg bg-secondary/50">
            <p className="text-sm text-foreground">{voiceNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
