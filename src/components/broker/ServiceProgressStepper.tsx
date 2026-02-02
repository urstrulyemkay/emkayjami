import { Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceStage {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed";
  deadline?: string;
  isUrgent?: boolean;
}

interface ServiceProgressStepperProps {
  stages: ServiceStage[];
  className?: string;
}

const ServiceProgressStepper = ({ stages, className }: ServiceProgressStepperProps) => {
  const getStageIcon = (status: ServiceStage["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStageStyles = (status: ServiceStage["status"], isUrgent?: boolean) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white border-green-500";
      case "in_progress":
        return isUrgent
          ? "bg-amber-500 text-white border-amber-500"
          : "bg-primary text-primary-foreground border-primary";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progressPercent = (completedCount / stages.length) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{completedCount}/{stages.length} completed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Horizontal stepper */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
        
        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center z-10">
              {/* Icon circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  getStageStyles(stage.status, stage.isUrgent)
                )}
              >
                {getStageIcon(stage.status)}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs mt-2 text-center max-w-[60px] leading-tight",
                stage.status === "completed" && "text-green-600 font-medium",
                stage.status === "in_progress" && "text-primary font-medium",
                stage.status === "pending" && "text-muted-foreground"
              )}>
                {stage.label}
              </span>
              
              {/* Urgent indicator */}
              {stage.isUrgent && stage.status !== "completed" && (
                <span className="text-[10px] text-red-500 font-medium mt-0.5">
                  URGENT
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceProgressStepper;
