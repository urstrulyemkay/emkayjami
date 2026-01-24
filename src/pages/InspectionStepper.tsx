import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Camera, Video, Mic } from "lucide-react";
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
      // All steps completed - proceed to media capture
      navigate("/inspection/capture", {
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

      {/* Section Voice Recorder - At the top of checkpoints */}
      <div className="px-4 pt-4">
        <SectionVoiceRecorder
          stepTitle={currentStepData.shortTitle}
          checkpoints={currentStepData.checkpoints}
          responses={responses}
          onAutoFill={handleVoiceAutoFill}
          onTranscriptReceived={handleTranscriptReceived}
        />
      </div>

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
                <Camera className="w-4 h-4 mr-2" />
                Capture Photos
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