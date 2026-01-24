import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus, FileCheck, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INSPECTION_STEPS,
  type Checkpoint,
} from "@/data/inspectionCheckpoints";

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
  originalIssues: Array<{
    checkpointId: string;
    severity: "minor" | "major" | "critical";
    stepId: number;
    question: string;
    originalValue: string;
  }>;
}

type ChangeType = "improved" | "worsened" | "unchanged" | "new_issue";

interface ComparisonItem {
  checkpointId: string;
  question: string;
  stepName: string;
  originalValue: string;
  originalSeverity: "ok" | "minor" | "major" | "critical";
  newValue: string;
  newSeverity: "ok" | "minor" | "major" | "critical";
  changeType: ChangeType;
}

const DeltaComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const comparisonData = location.state as DeltaComparisonState | null;

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

  const findCheckpoint = (checkpointId: string): Checkpoint | undefined => {
    for (const step of INSPECTION_STEPS) {
      const checkpoint = step.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) return checkpoint;
    }
    return undefined;
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

  const getStepName = (stepId: number) => {
    const step = INSPECTION_STEPS.find(s => s.id === stepId);
    return step?.shortTitle || "Unknown";
  };

  const severityOrder = { ok: 0, minor: 1, major: 2, critical: 3 };

  // Build comparison items
  const comparisons: ComparisonItem[] = comparisonData.originalIssues.map(issue => {
    const originalDetails = getOptionDetails(issue.checkpointId, 
      Object.entries(comparisonData.originalResponses).find(([k]) => k === issue.checkpointId)?.[1] || "");
    const newDetails = getOptionDetails(issue.checkpointId, comparisonData.deltaResponses[issue.checkpointId] || "");
    
    let changeType: ChangeType = "unchanged";
    if (severityOrder[newDetails.severity] < severityOrder[originalDetails.severity]) {
      changeType = "improved";
    } else if (severityOrder[newDetails.severity] > severityOrder[originalDetails.severity]) {
      changeType = "worsened";
    }

    return {
      checkpointId: issue.checkpointId,
      question: issue.question,
      stepName: getStepName(issue.stepId),
      originalValue: issue.originalValue,
      originalSeverity: originalDetails.severity,
      newValue: newDetails.label,
      newSeverity: newDetails.severity,
      changeType,
    };
  });

  const improved = comparisons.filter(c => c.changeType === "improved");
  const worsened = comparisons.filter(c => c.changeType === "worsened");
  const unchanged = comparisons.filter(c => c.changeType === "unchanged");

  const getSeverityIcon = (severity: string, size = "w-4 h-4") => {
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
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "worsened":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleApproveHandover = () => {
    // In production, this would save to database
    navigate("/auctions", {
      state: { deltaCompleted: true, vehicleId: comparisonData.vehicle.registration },
    });
  };

  const handleFlagIssues = () => {
    // Navigate to detailed issue review
    navigate("/auctions", {
      state: { deltaFlagged: true, vehicleId: comparisonData.vehicle.registration },
    });
  };

  const hasNewIssues = worsened.length > 0;

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

      {/* Summary Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={cn(
            "p-4 rounded-xl border text-center",
            improved.length > 0 ? "border-success bg-success/5" : "border-border bg-card"
          )}>
            <TrendingUp className={cn(
              "w-6 h-6 mx-auto mb-1",
              improved.length > 0 ? "text-success" : "text-muted-foreground"
            )} />
            <p className="text-2xl font-bold text-foreground">{improved.length}</p>
            <p className="text-xs text-muted-foreground">Improved</p>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border text-center",
            unchanged.length > 0 ? "border-border bg-card" : "border-border bg-card"
          )}>
            <Minus className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{unchanged.length}</p>
            <p className="text-xs text-muted-foreground">Unchanged</p>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border text-center",
            worsened.length > 0 ? "border-destructive bg-destructive/5" : "border-border bg-card"
          )}>
            <TrendingDown className={cn(
              "w-6 h-6 mx-auto mb-1",
              worsened.length > 0 ? "text-destructive" : "text-muted-foreground"
            )} />
            <p className="text-2xl font-bold text-foreground">{worsened.length}</p>
            <p className="text-xs text-muted-foreground">Worsened</p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {hasNewIssues && (
        <div className="mx-6 mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive">New Issues Detected</p>
            <p className="text-sm text-destructive/80">
              {worsened.length} issue(s) have worsened since the first inspection. 
              This may indicate damage during the customer's possession.
            </p>
          </div>
        </div>
      )}

      {/* Comparison List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
        {/* Worsened Items */}
        {worsened.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">Worsened ({worsened.length})</h3>
            </div>
            <div className="space-y-2">
              {worsened.map((item) => (
                <div key={item.checkpointId} className="p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                  <div className="flex items-start gap-3">
                    {getChangeIcon(item.changeType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {item.stepName}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">{item.question}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(item.originalSeverity)}
                          <span className="text-muted-foreground">{item.originalValue}</span>
                        </div>
                        <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(item.newSeverity)}
                          <span className="font-medium text-foreground">{item.newValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improved Items */}
        {improved.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold text-success">Improved ({improved.length})</h3>
            </div>
            <div className="space-y-2">
              {improved.map((item) => (
                <div key={item.checkpointId} className="p-4 rounded-xl bg-success/5 border border-success/30">
                  <div className="flex items-start gap-3">
                    {getChangeIcon(item.changeType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {item.stepName}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2">{item.question}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(item.originalSeverity)}
                          <span className="text-muted-foreground line-through">{item.originalValue}</span>
                        </div>
                        <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(item.newSeverity)}
                          <span className="font-medium text-success">{item.newValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unchanged Items */}
        {unchanged.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Minus className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Unchanged ({unchanged.length})</h3>
            </div>
            <div className="space-y-2">
              {unchanged.map((item) => (
                <div key={item.checkpointId} className="p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(item.originalSeverity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.question}</p>
                      <p className="text-xs text-muted-foreground">{item.stepName} • {item.originalValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        {hasNewIssues ? (
          <>
            <Button
              onClick={handleFlagIssues}
              className="w-full h-14 bg-destructive hover:bg-destructive/90"
            >
              <AlertOctagon className="w-5 h-5 mr-2" />
              Flag Issues & Assign Liability
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
    </div>
  );
};

export default DeltaComparison;
