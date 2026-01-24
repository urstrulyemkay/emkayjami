import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INSPECTION_STEPS,
  type Checkpoint,
  type CheckpointOption,
} from "@/data/inspectionCheckpoints";
import { useToast } from "@/hooks/use-toast";

interface PendingVehicle {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  firstInspectionDate: Date;
  originalResponses: Record<string, string>;
  originalIssues: Array<{
    checkpointId: string;
    severity: "minor" | "major" | "critical";
    stepId: number;
    question: string;
    originalValue: string;
  }>;
}

const DeltaInspection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const pendingVehicle = location.state as PendingVehicle | null;
  
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [deltaResponses, setDeltaResponses] = useState<Record<string, string>>({});
  const [completedIssues, setCompletedIssues] = useState<string[]>([]);

  useEffect(() => {
    if (!pendingVehicle) {
      navigate("/auctions");
    }
  }, [pendingVehicle, navigate]);

  if (!pendingVehicle) {
    return null;
  }

  const issues = pendingVehicle.originalIssues;
  const currentIssue = issues[currentIssueIndex];
  
  // Find the checkpoint definition
  const findCheckpoint = (checkpointId: string): Checkpoint | undefined => {
    for (const step of INSPECTION_STEPS) {
      const checkpoint = step.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) return checkpoint;
    }
    return undefined;
  };

  const currentCheckpoint = currentIssue ? findCheckpoint(currentIssue.checkpointId) : undefined;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "major":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "minor":
        return <AlertCircle className="w-5 h-5 text-info" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "border-destructive bg-destructive/10 text-destructive";
      case "major":
        return "border-warning bg-warning/10 text-warning";
      case "minor":
        return "border-info bg-info/10 text-info";
      default:
        return "border-success bg-success/10 text-success";
    }
  };

  const handleSelectOption = (checkpointId: string, value: string) => {
    setDeltaResponses(prev => ({
      ...prev,
      [checkpointId]: value,
    }));

    if (!completedIssues.includes(checkpointId)) {
      setCompletedIssues(prev => [...prev, checkpointId]);
    }
  };

  const handleNext = () => {
    if (!deltaResponses[currentIssue.checkpointId]) {
      toast({
        title: "Please select a status",
        description: "Verify the current condition before proceeding",
        variant: "destructive",
      });
      return;
    }

    if (currentIssueIndex < issues.length - 1) {
      setCurrentIssueIndex(prev => prev + 1);
    } else {
      // All issues reviewed - navigate to comparison
      navigate("/inspection/delta-comparison", {
        state: {
          vehicle: pendingVehicle.vehicle,
          firstInspectionDate: pendingVehicle.firstInspectionDate,
          originalResponses: pendingVehicle.originalResponses,
          deltaResponses,
          originalIssues: issues,
        },
      });
    }
  };

  const handlePrevious = () => {
    if (currentIssueIndex > 0) {
      setCurrentIssueIndex(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const getStepName = (stepId: number) => {
    const step = INSPECTION_STEPS.find(s => s.id === stepId);
    return step?.shortTitle || "Unknown";
  };

  const progress = ((completedIssues.length / issues.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-4 bg-background">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            Delta Re-inspection
          </h1>
          <p className="text-sm text-muted-foreground">
            {pendingVehicle.vehicle.make} {pendingVehicle.vehicle.model} • {pendingVehicle.vehicle.registration}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{progress}%</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            Issue {currentIssueIndex + 1} of {issues.length}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedIssues.length / issues.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Issue Card */}
      {currentCheckpoint && currentIssue && (
        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Original Issue Info */}
          <div className={cn(
            "p-4 rounded-xl border mb-4",
            getSeverityColor(currentIssue.severity)
          )}>
            <div className="flex items-start gap-3">
              {getSeverityIcon(currentIssue.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/50">
                    {getStepName(currentIssue.stepId)}
                  </span>
                  <span className="text-xs uppercase font-semibold">
                    {currentIssue.severity} Issue
                  </span>
                </div>
                <p className="font-medium">{currentIssue.question}</p>
                <p className="text-sm mt-1 opacity-80">
                  Original: <span className="font-medium">{currentIssue.originalValue}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Re-inspection Options */}
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Current Status
            </p>
            <div className="space-y-2">
              {currentCheckpoint.options.map((option) => {
                const isSelected = deltaResponses[currentIssue.checkpointId] === option.value;
                const isOriginal = currentIssue.originalValue === option.label;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectOption(currentIssue.checkpointId, option.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? getSeverityColor(option.severity)
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected ? "border-current bg-current" : "border-muted-foreground"
                        )}>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-background" />
                          )}
                        </div>
                        <span className={cn(
                          "font-medium",
                          isSelected ? "" : "text-foreground"
                        )}>
                          {option.label}
                        </span>
                      </div>
                      {isOriginal && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          Original
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change Detection Hint */}
          {deltaResponses[currentIssue.checkpointId] && (
            <div className={cn(
              "mt-4 p-3 rounded-lg text-sm",
              deltaResponses[currentIssue.checkpointId] !== 
                currentCheckpoint.options.find(o => o.label === currentIssue.originalValue)?.value
                ? "bg-warning/10 text-warning border border-warning/30"
                : "bg-success/10 text-success border border-success/30"
            )}>
              {deltaResponses[currentIssue.checkpointId] !== 
                currentCheckpoint.options.find(o => o.label === currentIssue.originalValue)?.value
                ? "⚠️ Status has changed from original inspection"
                : "✓ Status matches original inspection"
              }
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentIssueIndex === 0 ? "Cancel" : "Previous"}
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={!deltaResponses[currentIssue?.checkpointId]}
          >
            {currentIssueIndex === issues.length - 1 ? (
              <>
                Compare Results
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next Issue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeltaInspection;
