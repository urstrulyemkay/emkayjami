import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RCTransferCountdownProps {
  deadline: string;
  status: "pending" | "in_progress" | "completed";
  className?: string;
}

const RCTransferCountdown = ({ deadline, status, className }: RCTransferCountdownProps) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const wonDate = new Date(deadlineDate);
  wonDate.setMonth(wonDate.getMonth() - 6); // RC deadline is 6 months from won date
  
  const totalDays = 180; // 6 months
  const remainingMs = deadlineDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const elapsedDays = totalDays - remainingDays;
  const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  
  const isOverdue = remainingDays < 0;
  const isUrgent = remainingDays <= 30 && remainingDays > 0;
  const isCompleted = status === "completed";

  const getStatusColor = () => {
    if (isCompleted) return "text-green-600";
    if (isOverdue) return "text-red-600";
    if (isUrgent) return "text-amber-600";
    return "text-primary";
  };

  const getProgressColor = () => {
    if (isCompleted) return "bg-green-500";
    if (isOverdue) return "bg-red-500";
    if (isUrgent) return "bg-amber-500";
    return "bg-primary";
  };

  if (isCompleted) {
    return (
      <Card className={cn("border-green-200 bg-green-50/50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <p className="font-semibold text-green-700">RC Transfer Complete</p>
              <p className="text-sm text-green-600">
                Registration certificate transferred successfully
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      isOverdue && "border-red-300 bg-red-50/50",
      isUrgent && !isOverdue && "border-amber-300 bg-amber-50/50",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {(isOverdue || isUrgent) ? (
              <AlertTriangle className={cn("w-5 h-5", getStatusColor())} />
            ) : (
              <Clock className="w-5 h-5 text-primary" />
            )}
            RC Transfer Deadline
          </CardTitle>
          <span className={cn("text-sm font-medium", getStatusColor())}>
            {isOverdue 
              ? `${Math.abs(remainingDays)} days overdue` 
              : `${remainingDays} days left`}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Large countdown display */}
        <div className="text-center py-4">
          <div className={cn("text-5xl font-bold", getStatusColor())}>
            {isOverdue ? `-${Math.abs(remainingDays)}` : remainingDays}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isOverdue ? "days past deadline" : "days remaining"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Won Date</span>
            <span>Deadline: {deadlineDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", getProgressColor())}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{elapsedDays} days elapsed</span>
            <span className={getStatusColor()}>
              {isOverdue ? "OVERDUE" : `${remainingDays}/${totalDays} days`}
            </span>
          </div>
        </div>

        {/* Warning message */}
        {(isOverdue || isUrgent) && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            isOverdue ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
          )}>
            {isOverdue ? (
              <>
                <p className="font-semibold">⚠️ Deadline Exceeded</p>
                <p className="mt-1">
                  Penalties may apply: -500 coins, -10 trust score.
                  Please complete the RC transfer immediately.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">⏰ Deadline Approaching</p>
                <p className="mt-1">
                  Less than 30 days remaining. Upload RC transfer proof to avoid penalties.
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RCTransferCountdown;
