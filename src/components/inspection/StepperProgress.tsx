import { InspectionStep } from "@/data/inspectionCheckpoints";

interface StepperProgressProps {
  steps: InspectionStep[];
  currentStep: number;
  completedSteps: number[];
}

export function StepperProgress({
  steps,
  currentStep,
  completedSteps,
}: StepperProgressProps) {
  return (
    <div className="px-4 py-3 bg-card border-b border-border">
      {/* Step counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {steps[currentStep - 1]?.shortTitle}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                isCompleted
                  ? "bg-success"
                  : isCurrent
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            />
          );
        })}
      </div>

      {/* Step title and icon */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-2xl">{steps[currentStep - 1]?.icon}</span>
        <div>
          <h2 className="font-semibold text-foreground">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>
    </div>
  );
}
