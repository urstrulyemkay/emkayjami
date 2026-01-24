import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Camera, RefreshCw, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepperProgress } from "@/components/inspection/StepperProgress";
import { SimpleCheckpointCard } from "@/components/inspection/SimpleCheckpointCard";
import { SectionVoiceRecorder } from "@/components/inspection/SectionVoiceRecorder";
import {
  INSPECTION_STEPS,
  calculateStepCompletion,
  calculateOverallCompletion,
} from "@/data/inspectionCheckpoints";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const DeltaInspectionStepper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const pendingVehicle = location.state as PendingVehicle | null;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [voiceNotes, setVoiceNotes] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sectionTranscripts, setSectionTranscripts] = useState<Record<number, string>>({});
  const [showOriginal, setShowOriginal] = useState(true);

  // Pre-fill with original responses
  useEffect(() => {
    if (pendingVehicle?.originalResponses) {
      setResponses({ ...pendingVehicle.originalResponses });
    }
  }, [pendingVehicle?.originalResponses]);

  // Redirect if no vehicle data
  useEffect(() => {
    if (!pendingVehicle) {
      navigate("/auctions");
    }
  }, [pendingVehicle, navigate]);

  const currentStepData = INSPECTION_STEPS[currentStep - 1];
  const stepCompletion = currentStepData ? calculateStepCompletion(currentStep, responses) : 0;
  const overallCompletion = calculateOverallCompletion(responses);

  // Check if a response differs from original
  const hasChanged = useCallback((checkpointId: string) => {
    if (!pendingVehicle) return false;
    const original = pendingVehicle.originalResponses[checkpointId];
    const current = responses[checkpointId];
    return original !== undefined && current !== undefined && original !== current;
  }, [pendingVehicle, responses]);

  // Check if this is a new response (not in original)
  const isNewResponse = useCallback((checkpointId: string) => {
    if (!pendingVehicle) return false;
    return pendingVehicle.originalResponses[checkpointId] === undefined && responses[checkpointId] !== undefined;
  }, [pendingVehicle, responses]);

  // Get the original value label for a checkpoint
  const getOriginalLabel = useCallback((checkpointId: string) => {
    if (!pendingVehicle) return null;
    const originalValue = pendingVehicle.originalResponses[checkpointId];
    if (!originalValue) return null;
    
    for (const step of INSPECTION_STEPS) {
      const checkpoint = step.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) {
        const option = checkpoint.options.find(o => o.value === originalValue);
        return option?.label || originalValue;
      }
    }
    return originalValue;
  }, [pendingVehicle]);

  // Get severity of a response
  const getResponseSeverity = useCallback((checkpointId: string, value: string) => {
    for (const step of INSPECTION_STEPS) {
      const checkpoint = step.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) {
        const option = checkpoint.options.find(o => o.value === value);
        return option?.severity || "ok";
      }
    }
    return "ok";
  }, []);

  const handleSelectOption = useCallback((checkpointId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [checkpointId]: value,
    }));
  }, []);

  const handleVoiceAutoFill = useCallback((checkpointId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [checkpointId]: value,
    }));
  }, []);

  const handleTranscriptReceived = useCallback((transcript: string) => {
    setSectionTranscripts((prev) => ({
      ...prev,
      [currentStep]: (prev[currentStep] || "") + " " + transcript,
    }));
  }, [currentStep]);

  // Mark all checkpoints in current step as same as original
  const handleKeepOriginal = useCallback(() => {
    if (!pendingVehicle || !currentStepData) return;
    const newResponses: Record<string, string> = {};
    
    currentStepData.checkpoints.forEach((checkpoint) => {
      const originalValue = pendingVehicle.originalResponses[checkpoint.id];
      if (originalValue) {
        newResponses[checkpoint.id] = originalValue;
      }
    });

    setResponses((prev) => ({ ...prev, ...newResponses }));
    toast({
      title: "Kept original values",
      description: `${Object.keys(newResponses).length} fields unchanged from first inspection`,
    });
  }, [currentStepData, pendingVehicle, toast]);

  // Mark all as OK (for when issues are resolved)
  const handleMarkAllGood = useCallback(() => {
    if (!currentStepData) return;
    const newResponses: Record<string, string> = {};
    
    currentStepData.checkpoints.forEach((checkpoint) => {
      const okOption = checkpoint.options.find((opt) => opt.severity === "ok") || checkpoint.options[0];
      if (okOption) {
        newResponses[checkpoint.id] = okOption.value;
      }
    });

    setResponses((prev) => ({ ...prev, ...newResponses }));
    toast({
      title: "All marked as Good",
      description: `${currentStepData.checkpoints.length} fields marked OK`,
    });
  }, [currentStepData, toast]);

  const canProceed = useCallback(() => {
    if (!currentStepData) return false;
    const requiredCheckpoints = currentStepData.checkpoints.filter((c) => c.required);
    return requiredCheckpoints.every((c) => responses[c.id] !== undefined);
  }, [currentStepData, responses]);

  const handleNext = useCallback(() => {
    if (!canProceed() || !pendingVehicle) {
      toast({
        title: "Incomplete step",
        description: "Please answer all required questions",
        variant: "destructive",
      });
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentStep < INSPECTION_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // All steps completed - proceed to delta comparison
      navigate("/inspection/delta-comparison", {
        state: {
          vehicle: pendingVehicle.vehicle,
          firstInspectionDate: pendingVehicle.firstInspectionDate,
          originalResponses: pendingVehicle.originalResponses,
          deltaResponses: responses,
          isDeltaFromFullInspection: true,
        },
      });
    }
  }, [canProceed, pendingVehicle, completedSteps, currentStep, navigate, responses, toast]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  }, [currentStep, navigate]);

  if (!pendingVehicle || !currentStepData) {
    return null;
  }

  // Count changes in current step
  const changesInStep = currentStepData.checkpoints.filter(c => hasChanged(c.id) || isNewResponse(c.id)).length;

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
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-warning" />
            <h1 className="text-lg font-semibold text-foreground">
              Re-inspection
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {pendingVehicle.vehicle.make} {pendingVehicle.vehicle.model} • {pendingVehicle.vehicle.registration}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{overallCompletion}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </header>

      {/* Delta Info Banner */}
      <div className="mx-4 mb-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-warning text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Comparing with inspection from {new Date(pendingVehicle.firstInspectionDate).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1 text-xs text-warning hover:text-warning/80"
          >
            {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showOriginal ? "Hide" : "Show"} Original
          </button>
        </div>
        {changesInStep > 0 && (
          <p className="text-xs text-warning/80 mt-1">
            {changesInStep} change(s) detected in this section
          </p>
        )}
      </div>

      {/* Stepper Progress */}
      <StepperProgress
        steps={INSPECTION_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Section Actions */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleKeepOriginal}
            className="flex-1 text-xs border-warning/50 text-warning hover:bg-warning/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Keep Original
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllGood}
            className="flex-1 text-xs"
          >
            Mark All OK
          </Button>
        </div>
        
        <SectionVoiceRecorder
          stepTitle={currentStepData.shortTitle}
          checkpoints={currentStepData.checkpoints}
          responses={responses}
          onAutoFill={handleVoiceAutoFill}
          onTranscriptReceived={handleTranscriptReceived}
          onMarkAllGood={handleMarkAllGood}
          onAutoFillTest={() => {}}
        />
      </div>

      {/* Checkpoints with Delta Indicators */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          {currentStepData.checkpoints.map((checkpoint) => {
            const originalLabel = getOriginalLabel(checkpoint.id);
            const changed = hasChanged(checkpoint.id);
            const isNew = isNewResponse(checkpoint.id);
            const originalSeverity = pendingVehicle.originalResponses[checkpoint.id] 
              ? getResponseSeverity(checkpoint.id, pendingVehicle.originalResponses[checkpoint.id])
              : null;
            const currentSeverity = responses[checkpoint.id]
              ? getResponseSeverity(checkpoint.id, responses[checkpoint.id])
              : null;
            
            // Determine if this is an improvement or worsening
            const severityOrder = { ok: 0, minor: 1, major: 2, critical: 3 };
            const isImproved = originalSeverity && currentSeverity && 
              severityOrder[currentSeverity as keyof typeof severityOrder] < severityOrder[originalSeverity as keyof typeof severityOrder];
            const isWorsened = originalSeverity && currentSeverity && 
              severityOrder[currentSeverity as keyof typeof severityOrder] > severityOrder[originalSeverity as keyof typeof severityOrder];

            return (
              <div key={checkpoint.id} className="relative">
                {/* Original Value Reference */}
                {showOriginal && originalLabel && (
                  <div className={cn(
                    "mb-1 px-3 py-1.5 rounded-t-lg text-xs flex items-center justify-between",
                    changed 
                      ? isImproved 
                        ? "bg-success/10 border border-b-0 border-success/30 text-success"
                        : isWorsened
                          ? "bg-destructive/10 border border-b-0 border-destructive/30 text-destructive"
                          : "bg-warning/10 border border-b-0 border-warning/30 text-warning"
                      : "bg-secondary/50 border border-b-0 border-border text-muted-foreground"
                  )}>
                    <span>Original: <strong>{originalLabel}</strong></span>
                    {changed && (
                      <span className="font-medium">
                        {isImproved ? "↑ Improved" : isWorsened ? "↓ Worsened" : "Changed"}
                      </span>
                    )}
                  </div>
                )}
                
                {/* New Issue Indicator */}
                {isNew && (
                  <div className="mb-1 px-3 py-1.5 rounded-t-lg text-xs bg-info/10 border border-b-0 border-info/30 text-info flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-medium">NEW ISSUE - Not in original inspection</span>
                  </div>
                )}
                
                <div className={cn(
                  showOriginal && (originalLabel || isNew) && "rounded-t-none",
                  changed && "ring-2 ring-warning/50 rounded-xl",
                  isNew && "ring-2 ring-info/50 rounded-xl"
                )}>
                  <SimpleCheckpointCard
                    checkpoint={checkpoint}
                    selectedValue={responses[checkpoint.id]}
                    onSelect={(value) => handleSelectOption(checkpoint.id, value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={!canProceed()}
          >
            {currentStep === INSPECTION_STEPS.length ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Compare Delta
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeltaInspectionStepper;
