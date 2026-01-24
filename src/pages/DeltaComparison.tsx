import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus, FileCheck, AlertOctagon, Plus, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INSPECTION_STEPS,
  type Checkpoint,
} from "@/data/inspectionCheckpoints";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface DeltaComparisonState {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  firstInspectionDate: Date;
  originalResponses: Record<string, string>;
  deltaResponses: Record<string, string>;
  isDeltaFromFullInspection?: boolean;
  originalIssues?: Array<{
    checkpointId: string;
    severity: "minor" | "major" | "critical";
    stepId: number;
    question: string;
    originalValue: string;
  }>;
}

type ChangeType = "improved" | "worsened" | "unchanged" | "new_issue" | "resolved";

interface ComparisonItem {
  checkpointId: string;
  question: string;
  stepName: string;
  stepId: number;
  originalValue: string | null;
  originalSeverity: "ok" | "minor" | "major" | "critical" | null;
  newValue: string;
  newSeverity: "ok" | "minor" | "major" | "critical";
  changeType: ChangeType;
}

// Calculate condition score from responses (0-100)
const calculateConditionScore = (responses: Record<string, string>): number => {
  const severityPoints = { ok: 0, minor: 5, major: 15, critical: 30 };
  let totalDeductions = 0;
  let checkpointCount = 0;

  for (const step of INSPECTION_STEPS) {
    for (const checkpoint of step.checkpoints) {
      const value = responses[checkpoint.id];
      if (value) {
        checkpointCount++;
        const option = checkpoint.options.find(o => o.value === value);
        const severity = option?.severity || "ok";
        totalDeductions += severityPoints[severity];
      }
    }
  }

  // Base score is 100, minus deductions (capped at 0)
  const score = Math.max(0, 100 - totalDeductions);
  return Math.round(score);
};

// Get score grade label
const getScoreGrade = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: "Excellent", color: "text-success" };
  if (score >= 75) return { label: "Good", color: "text-success" };
  if (score >= 60) return { label: "Fair", color: "text-warning" };
  if (score >= 40) return { label: "Poor", color: "text-orange-500" };
  return { label: "Critical", color: "text-destructive" };
};

const DeltaComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const comparisonData = location.state as DeltaComparisonState | null;
  const [showNewIssueConfirm, setShowNewIssueConfirm] = useState(false);
  const [confirmedNewIssues, setConfirmedNewIssues] = useState<string[]>([]);

  const findCheckpoint = (checkpointId: string): Checkpoint | undefined => {
    for (const step of INSPECTION_STEPS) {
      const checkpoint = step.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) return checkpoint;
    }
    return undefined;
  };

  const getStepForCheckpoint = (checkpointId: string): { stepId: number; stepName: string } => {
    for (const step of INSPECTION_STEPS) {
      if (step.checkpoints.some(c => c.id === checkpointId)) {
        return { stepId: step.id, stepName: step.shortTitle };
      }
    }
    return { stepId: 0, stepName: "Unknown" };
  };

  const getOptionDetails = (checkpointId: string, value: string) => {
    const checkpoint = findCheckpoint(checkpointId);
    if (!checkpoint) return { label: value, severity: "ok" as const };
    const option = checkpoint.options.find(o => o.value === value);
    return {
      label: option?.label || value,
      severity: option?.severity || "ok" as const,
    };
  };

  const severityOrder = { ok: 0, minor: 1, major: 2, critical: 3 };

  // Build comprehensive comparison from all responses
  const comparisons = useMemo<ComparisonItem[]>(() => {
    if (!comparisonData) return [];

    const items: ComparisonItem[] = [];
    const processedIds = new Set<string>();

    // Process all delta responses
    Object.entries(comparisonData.deltaResponses).forEach(([checkpointId, newValue]) => {
      const checkpoint = findCheckpoint(checkpointId);
      if (!checkpoint) return;
      
      processedIds.add(checkpointId);
      
      const originalValue = comparisonData.originalResponses[checkpointId];
      const { stepId, stepName } = getStepForCheckpoint(checkpointId);
      
      const newDetails = getOptionDetails(checkpointId, newValue);
      const originalDetails = originalValue ? getOptionDetails(checkpointId, originalValue) : null;

      // Skip if both are "ok" and unchanged
      if (originalDetails?.severity === "ok" && newDetails.severity === "ok") {
        return;
      }

      let changeType: ChangeType = "unchanged";
      
      if (!originalValue) {
        // New issue that wasn't in original inspection
        if (newDetails.severity !== "ok") {
          changeType = "new_issue";
        } else {
          return; // Skip new OK responses
        }
      } else if (originalDetails && newDetails.severity === "ok" && originalDetails.severity !== "ok") {
        // Issue was resolved
        changeType = "resolved";
      } else if (originalDetails) {
        const origSev = severityOrder[originalDetails.severity];
        const newSev = severityOrder[newDetails.severity];
        
        if (newSev < origSev) {
          changeType = "improved";
        } else if (newSev > origSev) {
          changeType = "worsened";
        } else {
          changeType = "unchanged";
        }
      }

      // Only add if there's something noteworthy
      if (changeType !== "unchanged" || (originalDetails && originalDetails.severity !== "ok")) {
        items.push({
          checkpointId,
          question: checkpoint.question,
          stepName,
          stepId,
          originalValue: originalDetails?.label || null,
          originalSeverity: originalDetails?.severity || null,
          newValue: newDetails.label,
          newSeverity: newDetails.severity,
          changeType,
        });
      }
    });

    // Sort by severity and change type
    return items.sort((a, b) => {
      const typeOrder = { new_issue: 0, worsened: 1, unchanged: 2, improved: 3, resolved: 4 };
      return typeOrder[a.changeType] - typeOrder[b.changeType];
    });
  }, [comparisonData]);

  // Calculate condition scores
  const originalScore = useMemo(() => {
    if (!comparisonData) return 0;
    return calculateConditionScore(comparisonData.originalResponses);
  }, [comparisonData]);

  const newScore = useMemo(() => {
    if (!comparisonData) return 0;
    return calculateConditionScore(comparisonData.deltaResponses);
  }, [comparisonData]);

  const scoreDifference = newScore - originalScore;
  const scoreDecreased = scoreDifference < 0;
  const originalGrade = getScoreGrade(originalScore);
  const newGrade = getScoreGrade(newScore);

  const newIssues = comparisons.filter(c => c.changeType === "new_issue");
  const worsened = comparisons.filter(c => c.changeType === "worsened");
  const improved = comparisons.filter(c => c.changeType === "improved");
  const resolved = comparisons.filter(c => c.changeType === "resolved");
  const unchanged = comparisons.filter(c => c.changeType === "unchanged");

  const hasProblematicChanges = newIssues.length > 0 || worsened.length > 0;
  const unconfirmedNewIssues = newIssues.filter(i => !confirmedNewIssues.includes(i.checkpointId));
  const [showScoreConfirm, setShowScoreConfirm] = useState(false);
  const [scoreConfirmed, setScoreConfirmed] = useState(false);

  if (!comparisonData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No comparison data available</p>
          <Button onClick={() => navigate("/auctions")}>Back to Auctions</Button>
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string | null, size = "w-4 h-4") => {
    switch (severity) {
      case "critical":
        return <XCircle className={cn(size, "text-destructive")} />;
      case "major":
        return <AlertTriangle className={cn(size, "text-warning")} />;
      case "minor":
        return <AlertCircle className={cn(size, "text-info")} />;
      default:
        return <CheckCircle2 className={cn(size, "text-success")} />;
    }
  };

  const getChangeIcon = (changeType: ChangeType) => {
    switch (changeType) {
      case "improved":
      case "resolved":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "worsened":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      case "new_issue":
        return <Plus className="w-5 h-5 text-info" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleConfirmNewIssues = () => {
    setConfirmedNewIssues(newIssues.map(i => i.checkpointId));
    setShowNewIssueConfirm(false);
    toast({
      title: "New issues confirmed",
      description: `${newIssues.length} new issue(s) have been attributed to the customer's possession period`,
    });
  };

  const handleApproveHandover = () => {
    // First check for score decrease
    if (scoreDecreased && !scoreConfirmed) {
      setShowScoreConfirm(true);
      return;
    }
    
    // Then check for new issues
    if (unconfirmedNewIssues.length > 0) {
      setShowNewIssueConfirm(true);
      return;
    }
    
    toast({
      title: "Handover Approved",
      description: "Delta inspection completed successfully",
    });
    navigate("/auctions", {
      state: { deltaCompleted: true, vehicleId: comparisonData.vehicle.registration },
    });
  };

  const handleConfirmScoreDecrease = () => {
    setScoreConfirmed(true);
    setShowScoreConfirm(false);
    
    // Continue to check for new issues
    if (unconfirmedNewIssues.length > 0) {
      setShowNewIssueConfirm(true);
    } else {
      toast({
        title: "Handover Approved",
        description: "Delta inspection completed with noted condition changes",
      });
      navigate("/auctions", {
        state: { deltaCompleted: true, vehicleId: comparisonData.vehicle.registration },
      });
    }
  };

  const handleFlagIssues = () => {
    toast({
      title: "Issues Flagged",
      description: "This vehicle has been flagged for liability review",
      variant: "destructive",
    });
    navigate("/auctions", {
      state: { deltaFlagged: true, vehicleId: comparisonData.vehicle.registration },
    });
  };

  const renderComparisonSection = (title: string, items: ComparisonItem[], icon: React.ReactNode, bgClass: string, borderClass: string) => {
    if (items.length === 0) return null;
    
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className={cn("text-sm font-semibold", 
            title.includes("Worsened") || title.includes("New") ? "text-destructive" :
            title.includes("Improved") || title.includes("Resolved") ? "text-success" :
            "text-muted-foreground"
          )}>{title} ({items.length})</h3>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.checkpointId} className={cn("p-4 rounded-xl", bgClass, borderClass)}>
              <div className="flex items-start gap-3">
                {getChangeIcon(item.changeType)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {item.stepName}
                    </span>
                    {item.changeType === "new_issue" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-info/20 text-info">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">{item.question}</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    {item.originalValue ? (
                      <>
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(item.originalSeverity)}
                          <span className={cn(
                            "text-muted-foreground",
                            item.changeType !== "unchanged" && "line-through"
                          )}>{item.originalValue}</span>
                        </div>
                        <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Not in original</span>
                    )}
                    <div className="flex items-center gap-1">
                      {getSeverityIcon(item.newSeverity)}
                      <span className={cn(
                        "font-medium",
                        item.changeType === "improved" || item.changeType === "resolved" ? "text-success" :
                        item.changeType === "worsened" || item.changeType === "new_issue" ? "text-destructive" :
                        "text-foreground"
                      )}>{item.newValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-4 bg-background">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">
            Delta Comparison
          </h1>
          <p className="text-sm text-muted-foreground">
            {comparisonData.vehicle.make} {comparisonData.vehicle.model} • {comparisonData.vehicle.registration}
          </p>
        </div>
      </header>

      {/* Vehicle Condition Score Comparison */}
      <div className="px-6 pb-4">
        <div className={cn(
          "p-4 rounded-xl border",
          scoreDecreased ? "border-destructive/50 bg-destructive/5" : 
          scoreDifference > 0 ? "border-success/50 bg-success/5" : 
          "border-border bg-card"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className={cn(
              "w-5 h-5",
              scoreDecreased ? "text-destructive" : 
              scoreDifference > 0 ? "text-success" : 
              "text-muted-foreground"
            )} />
            <h3 className="text-sm font-semibold text-foreground">Vehicle Condition Score</h3>
          </div>
          
          <div className="flex items-center justify-between">
            {/* First Inspection Score */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">First Inspection</p>
              <p className={cn("text-3xl font-bold", originalGrade.color)}>{originalScore}</p>
              <p className={cn("text-xs font-medium", originalGrade.color)}>{originalGrade.label}</p>
            </div>
            
            {/* Arrow with difference */}
            <div className="flex flex-col items-center px-4">
              {scoreDecreased ? (
                <>
                  <TrendingDown className="w-8 h-8 text-destructive" />
                  <span className="text-sm font-bold text-destructive">{scoreDifference}</span>
                </>
              ) : scoreDifference > 0 ? (
                <>
                  <TrendingUp className="w-8 h-8 text-success" />
                  <span className="text-sm font-bold text-success">+{scoreDifference}</span>
                </>
              ) : (
                <>
                  <Minus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">No change</span>
                </>
              )}
            </div>
            
            {/* Second Inspection Score */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Re-inspection</p>
              <p className={cn("text-3xl font-bold", newGrade.color)}>{newScore}</p>
              <p className={cn("text-xs font-medium", newGrade.color)}>{newGrade.label}</p>
            </div>
          </div>
          
          {scoreDecreased && (
            <div className="mt-3 pt-3 border-t border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Vehicle condition has deteriorated by {Math.abs(scoreDifference)} points
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-4 gap-2">
          <div className={cn(
            "p-3 rounded-xl border text-center",
            newIssues.length > 0 ? "border-info bg-info/5" : "border-border bg-card"
          )}>
            <Plus className={cn(
              "w-5 h-5 mx-auto mb-1",
              newIssues.length > 0 ? "text-info" : "text-muted-foreground"
            )} />
            <p className="text-xl font-bold text-foreground">{newIssues.length}</p>
            <p className="text-xs text-muted-foreground">New</p>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            worsened.length > 0 ? "border-destructive bg-destructive/5" : "border-border bg-card"
          )}>
            <TrendingDown className={cn(
              "w-5 h-5 mx-auto mb-1",
              worsened.length > 0 ? "text-destructive" : "text-muted-foreground"
            )} />
            <p className="text-xl font-bold text-foreground">{worsened.length}</p>
            <p className="text-xs text-muted-foreground">Worse</p>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            improved.length > 0 ? "border-success bg-success/5" : "border-border bg-card"
          )}>
            <TrendingUp className={cn(
              "w-5 h-5 mx-auto mb-1",
              improved.length > 0 ? "text-success" : "text-muted-foreground"
            )} />
            <p className="text-xl font-bold text-foreground">{improved.length}</p>
            <p className="text-xs text-muted-foreground">Better</p>
          </div>
          
          <div className={cn(
            "p-3 rounded-xl border text-center",
            resolved.length > 0 ? "border-success bg-success/5" : "border-border bg-card"
          )}>
            <CheckCircle2 className={cn(
              "w-5 h-5 mx-auto mb-1",
              resolved.length > 0 ? "text-success" : "text-muted-foreground"
            )} />
            <p className="text-xl font-bold text-foreground">{resolved.length}</p>
            <p className="text-xs text-muted-foreground">Fixed</p>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {newIssues.length > 0 && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-info/10 border border-info/30 flex items-start gap-3">
          <Plus className="w-6 h-6 text-info flex-shrink-0" />
          <div>
            <p className="font-semibold text-info">New Issues Detected</p>
            <p className="text-sm text-info/80">
              {newIssues.length} issue(s) were not present in the original inspection. 
              These may have occurred during the customer's possession.
            </p>
          </div>
        </div>
      )}

      {worsened.length > 0 && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive">Condition Worsened</p>
            <p className="text-sm text-destructive/80">
              {worsened.length} issue(s) have deteriorated since the first inspection.
            </p>
          </div>
        </div>
      )}

      {/* Comparison List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
        {renderComparisonSection(
          "New Issues",
          newIssues,
          <Plus className="w-4 h-4 text-info" />,
          "bg-info/5",
          "border border-info/30"
        )}
        
        {renderComparisonSection(
          "Worsened",
          worsened,
          <TrendingDown className="w-4 h-4 text-destructive" />,
          "bg-destructive/5",
          "border border-destructive/30"
        )}
        
        {renderComparisonSection(
          "Resolved",
          resolved,
          <CheckCircle2 className="w-4 h-4 text-success" />,
          "bg-success/5",
          "border border-success/30"
        )}
        
        {renderComparisonSection(
          "Improved",
          improved,
          <TrendingUp className="w-4 h-4 text-success" />,
          "bg-success/5",
          "border border-success/30"
        )}
        
        {renderComparisonSection(
          "Unchanged Issues",
          unchanged,
          <Minus className="w-4 h-4 text-muted-foreground" />,
          "bg-card",
          "border border-border"
        )}

        {comparisons.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Changes Detected</h3>
            <p className="text-muted-foreground">
              The vehicle condition matches the original inspection.
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        {hasProblematicChanges ? (
          <>
            <Button
              onClick={handleFlagIssues}
              className="w-full h-14 bg-destructive hover:bg-destructive/90"
            >
              <AlertOctagon className="w-5 h-5 mr-2" />
              Flag for Liability Review
            </Button>
            <Button
              onClick={handleApproveHandover}
              variant="outline"
              className="w-full h-12"
            >
              Approve Handover Anyway
            </Button>
          </>
        ) : (
          <Button
            onClick={handleApproveHandover}
            className="w-full h-14 bg-success hover:bg-success/90"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Approve Vehicle Handover
          </Button>
        )}
      </div>

      {/* New Issues Confirmation Dialog */}
      <AlertDialog open={showNewIssueConfirm} onOpenChange={setShowNewIssueConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm New Issues</AlertDialogTitle>
            <AlertDialogDescription>
              You've identified {newIssues.length} new issue(s) that were not present in the original inspection:
              <ul className="mt-2 space-y-1">
                {newIssues.map(issue => (
                  <li key={issue.checkpointId} className="flex items-center gap-2">
                    {getSeverityIcon(issue.newSeverity, "w-3 h-3")}
                    <span>{issue.question.replace("?", "")}: {issue.newValue}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-medium">
                Do you confirm these issues occurred during the customer's possession?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewIssues}>
              Confirm & Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Score Decrease Confirmation Dialog */}
      <AlertDialog open={showScoreConfirm} onOpenChange={setShowScoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Vehicle Condition Deteriorated
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  The vehicle condition score has decreased from the first inspection:
                </p>
                
                <div className="flex items-center justify-center gap-6 py-4 bg-destructive/5 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{originalScore}</p>
                    <p className="text-xs text-muted-foreground">First Inspection</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-destructive" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-destructive">{newScore}</p>
                    <p className="text-xs text-muted-foreground">Re-inspection</p>
                  </div>
                </div>
                
                <p className="text-sm">
                  <strong className="text-destructive">Score dropped by {Math.abs(scoreDifference)} points.</strong>
                  {" "}This indicates the vehicle quality has worsened during the customer's possession.
                </p>
                
                <p className="text-sm font-medium">
                  Are you sure you want to approve the handover with this condition change?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmScoreDecrease}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeltaComparison;
