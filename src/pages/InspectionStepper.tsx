import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Video, Mic, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepperProgress } from "@/components/inspection/StepperProgress";
import { SimpleCheckpointCard } from "@/components/inspection/SimpleCheckpointCard";
import { SectionVoiceRecorder } from "@/components/inspection/SectionVoiceRecorder";
import { Badge } from "@/components/ui/badge";
import {
  INSPECTION_STEPS,
  calculateStepCompletion,
  calculateOverallCompletion,
} from "@/data/inspectionCheckpoints";
import { useToast } from "@/hooks/use-toast";

interface InspectionState {
  registration: string;
  make: string;
  model: string;
  year: number;
  color: string;
  engineCC: number;
  customerName?: string;
  customerPhone?: string;
  odometerReading?: number;
}

const InspectionStepper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const vehicleData = location.state as InspectionState | null;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [voiceNotes, setVoiceNotes] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sectionTranscripts, setSectionTranscripts] = useState<Record<number, string>>({});

  // Redirect if no vehicle data
  useEffect(() => {
    if (!vehicleData) {
      navigate("/inspection/new");
    }
  }, [vehicleData, navigate]);

  const currentStepData = INSPECTION_STEPS[currentStep - 1];
  const stepCompletion = calculateStepCompletion(currentStep, responses);
  const overallCompletion = calculateOverallCompletion(responses);

  // Collect ALL checkpoints across ALL steps for the global voice recorder
  const allCheckpoints = useMemo(
    () => INSPECTION_STEPS.flatMap((step) => step.checkpoints),
    []
  );

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

  // Mark all checkpoints across ALL steps as "OK/Good"
  const handleMarkAllGood = useCallback(() => {
    const newResponses: Record<string, string> = {};
    
    INSPECTION_STEPS.forEach((step) => {
      step.checkpoints.forEach((checkpoint) => {
        const okOption = checkpoint.options.find((opt) => opt.severity === "ok") || checkpoint.options[0];
        if (okOption) {
          newResponses[checkpoint.id] = okOption.value;
        }
      });
    });

    setResponses((prev) => ({ ...prev, ...newResponses }));
    toast({
      title: "All marked as Good",
      description: `${Object.keys(newResponses).length} fields filled across all steps`,
    });
  }, [toast]);

  // Auto-fill with random realistic values for testing (all steps)
  const handleAutoFillTest = useCallback(() => {
    const newResponses: Record<string, string> = {};
    
    INSPECTION_STEPS.forEach((step) => {
      step.checkpoints.forEach((checkpoint) => {
        const rand = Math.random();
        let targetSeverity: "ok" | "minor" | "major" | "critical" = "ok";
        
        if (rand > 0.98) targetSeverity = "critical";
        else if (rand > 0.90) targetSeverity = "major";
        else if (rand > 0.70) targetSeverity = "minor";
        
        const matchingOption = checkpoint.options.find((opt) => opt.severity === targetSeverity);
        const fallbackOption = checkpoint.options.find((opt) => opt.severity === "ok") || checkpoint.options[0];
        
        newResponses[checkpoint.id] = (matchingOption || fallbackOption).value;
      });
    });

    setResponses((prev) => ({ ...prev, ...newResponses }));
    toast({
      title: "Test data filled",
      description: `${Object.keys(newResponses).length} fields auto-filled across all steps`,
    });
  }, [toast]);

  const canProceed = () => {
    const requiredCheckpoints = currentStepData.checkpoints.filter((c) => c.required);
    return requiredCheckpoints.every((c) => responses[c.id] !== undefined);
  };

  const handleNext = () => {
    if (!canProceed()) {
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
      // All steps completed - proceed to consent flow
      navigate("/inspection/consent", {
        state: {
          ...vehicleData,
          checkpointResponses: responses,
          voiceNotes,
          sectionTranscripts,
        },
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    } else {
      navigate(-1);
    }
  };

  if (!vehicleData) {
    return null;
  }

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
            {vehicleData.make} {vehicleData.model}
          </h1>
          <p className="text-sm text-muted-foreground">
            {vehicleData.registration}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{overallCompletion}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </header>

      {/* Stepper Progress */}
      <StepperProgress
        steps={INSPECTION_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Voice Recorder - Only on Step 1, fills ALL steps */}
      {currentStep === 1 && (
        <div className="px-4 pt-4">
          <SectionVoiceRecorder
            stepTitle="All Sections"
            checkpoints={allCheckpoints}
            responses={responses}
            onAutoFill={handleVoiceAutoFill}
            onTranscriptReceived={handleTranscriptReceived}
            onMarkAllGood={handleMarkAllGood}
            onAutoFillTest={handleAutoFillTest}
          />
        </div>
      )}

      {/* Verification banner on steps 2-6 */}
      {currentStep > 1 && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Verification Mode</p>
              <p className="text-xs text-muted-foreground">
                Review voice-filled responses below. Tap any field to correct it.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stepCompletion}%
            </Badge>
          </div>
        </div>
      )}

      {/* Checkpoints */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          {currentStepData.checkpoints.map((checkpoint) => (
            <SimpleCheckpointCard
              key={checkpoint.id}
              checkpoint={checkpoint}
              selectedValue={responses[checkpoint.id]}
              onSelect={(value) => handleSelectOption(checkpoint.id, value)}
            />
          ))}
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
                <Check className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Quick actions for current step */}
        {currentStep === INSPECTION_STEPS.length && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate("/inspection/video", { state: vehicleData })}
            >
              <Video className="w-3 h-3 mr-1" />
              Videos
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate("/inspection/voice", { state: vehicleData })}
            >
              <Mic className="w-3 h-3 mr-1" />
              Voice Notes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionStepper;