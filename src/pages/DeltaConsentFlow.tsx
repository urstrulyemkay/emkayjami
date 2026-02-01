import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  TrendingDown,
  IndianRupee,
  MessageSquare,
  Gauge,
  QrCode,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { QRCodeSVG } from "qrcode.react";

interface DeltaConsentState {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  originalScore: number;
  newScore: number;
  scoreDifference: number;
  newIssuesCount: number;
  worsenedCount: number;
  improvedCount: number;
  resolvedCount: number;
  originalPrice?: number;
  newPrice?: number;
}

type ConsentStep = "qr_scan" | "waiting_approval" | "review" | "price_negotiation" | "confirm" | "rejected";

const DeltaConsentFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const consentData = location.state as DeltaConsentState | null;

  const [step, setStep] = useState<ConsentStep>("qr_scan");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // QR Code / WhatsApp approval
  const [approvalToken] = useState(() => `DELTA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  
  // Price negotiation
  const [showPriceOffer, setShowPriceOffer] = useState(false);
  const [newPriceOffer, setNewPriceOffer] = useState("");
  const [priceAccepted, setPriceAccepted] = useState(false);
  
  // Rejection flow
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState<string>("");

  const rejectionCategories = [
    { id: "price_too_low", label: "Price is too low" },
    { id: "disagree_condition", label: "Disagree with condition assessment" },
    { id: "new_issues_dispute", label: "Disputing new issues found" },
    { id: "need_more_time", label: "Need more time to decide" },
    { id: "other", label: "Other reason" },
  ];

  // DriveX WhatsApp number (mock)
  const driveXWhatsAppNumber = "919876543210";
  
  // Generate WhatsApp deep link with pre-filled message
  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(
      `Hi DriveX, I want to approve the re-inspection report.\n\nApproval Token: ${approvalToken}\nVehicle: ${consentData?.vehicle.make} ${consentData?.vehicle.model}\nRegistration: ${consentData?.vehicle.registration}\n\nPlease confirm my approval.`
    );
    return `https://wa.me/${driveXWhatsAppNumber}?text=${message}`;
  };

  if (!consentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No consent data available</p>
          <Button onClick={() => navigate("/auctions")}>Back to Auctions</Button>
        </div>
      </div>
    );
  }

  const { 
    vehicle, 
    originalScore, 
    newScore, 
    scoreDifference, 
    newIssuesCount, 
    worsenedCount,
    improvedCount,
    resolvedCount 
  } = consentData;

  const scoreDecreased = scoreDifference < 0;
  const hasNewIssues = newIssuesCount > 0 || worsenedCount > 0;
  const originalPrice = consentData.originalPrice || 85000;
  const suggestedNewPrice = scoreDecreased 
    ? Math.round(originalPrice * (1 + scoreDifference / 100)) 
    : originalPrice;

  const handleShowQR = () => {
    setIsWaitingForApproval(true);
    setStep("waiting_approval");
  };

  // Simulate customer approval via WhatsApp (in production, this would be a webhook)
  const handleCustomerApproved = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast({
      title: "Customer Verified",
      description: "WhatsApp approval received successfully",
    });
    setStep("review");
  };

  const handleProceedToPrice = () => {
    if (scoreDecreased) {
      setStep("price_negotiation");
    } else {
      handleFinalConsent();
    }
  };

  const handleAcceptPrice = () => {
    setPriceAccepted(true);
    const finalPrice = newPriceOffer ? parseInt(newPriceOffer) : suggestedNewPrice;
    toast({
      title: "Price Accepted",
      description: `New price of ₹${finalPrice.toLocaleString()} has been recorded`,
    });
    handleFinalConsent();
  };

  const handleFinalConsent = async () => {
    setLoading(true);
    // Would submit consent to backend
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep("confirm");
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectionCategory) {
      toast({
        title: "Please select a reason",
        description: "You must select a category for rejection",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // Would save rejection reason to backend
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setShowRejectDialog(false);
    setStep("rejected");
  };

  const handleBackToDashboard = () => {
    navigate("/auctions", { 
      replace: true,
      state: { 
        deltaCompleted: step === "confirm",
        deltaRejected: step === "rejected",
        vehicleId: vehicle.registration 
      }
    });
  };

  const getScoreGrade = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: "Excellent", color: "text-success" };
    if (score >= 75) return { label: "Good", color: "text-success" };
    if (score >= 60) return { label: "Fair", color: "text-warning" };
    if (score >= 40) return { label: "Poor", color: "text-orange-500" };
    return { label: "Critical", color: "text-destructive" };
  };

  const originalGrade = getScoreGrade(originalScore);
  const newGrade = getScoreGrade(newScore);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          {step !== "confirm" && step !== "rejected" && (
            <button
              onClick={() => {
                if (step === "qr_scan") navigate(-1);
                else if (step === "waiting_approval") setStep("qr_scan");
                else if (step === "review") setStep("waiting_approval");
                else if (step === "price_negotiation") setStep("review");
              }}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {step === "confirm" ? "Handover Approved" : 
               step === "rejected" ? "Handover Declined" :
               "Customer Approval"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {vehicle.make} {vehicle.model} • {vehicle.registration}
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 pb-8">
        {/* QR Scan Step */}
        {step === "qr_scan" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                WhatsApp Approval
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                The customer can approve the re-inspection by scanning this QR code with their phone
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG 
                    value={generateWhatsAppLink()} 
                    size={180}
                    level="M"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan to open WhatsApp with pre-filled approval message
                </p>
              </div>
            </div>

            {/* Quick Summary */}
            <div className={cn(
              "p-4 rounded-xl border",
              scoreDecreased ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Gauge className={cn("w-5 h-5", scoreDecreased ? "text-destructive" : "text-success")} />
                <span className="text-sm font-medium text-foreground">Re-inspection Summary</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score Change:</span>
                <span className={cn("font-semibold", scoreDecreased ? "text-destructive" : "text-success")}>
                  {originalScore} → {newScore} ({scoreDifference > 0 ? "+" : ""}{scoreDifference})
                </span>
              </div>
              {hasNewIssues && (
                <p className="text-xs text-destructive mt-2">
                  {newIssuesCount} new issue(s) and {worsenedCount} worsened condition(s) detected
                </p>
              )}
            </div>

            <Button
              onClick={handleShowQR}
              className="w-full h-14"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Customer is Scanning
            </Button>
          </div>
        )}

        {/* Waiting for WhatsApp Approval */}
        {step === "waiting_approval" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Waiting for Approval
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask the customer to send the WhatsApp message to complete approval
              </p>
              
              <div className="p-4 bg-secondary rounded-xl mb-4">
                <p className="text-xs text-muted-foreground mb-1">Approval Token</p>
                <p className="text-sm font-mono text-foreground">{approvalToken}</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                <Shield className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-xs text-success text-left">
                  Once the customer sends the message on WhatsApp, click below to confirm
                </p>
              </div>
            </div>

            {/* Show QR again option */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Show QR Code Again</span>
              </div>
              <div className="flex justify-center p-3 bg-white rounded-lg">
                <QRCodeSVG 
                  value={generateWhatsAppLink()} 
                  size={120}
                  level="M"
                />
              </div>
            </div>

            <Button
              onClick={handleCustomerApproved}
              disabled={loading}
              className="w-full h-14"
            >
              {loading ? "Verifying..." : "Customer Approved via WhatsApp"}
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleReject}
              variant="outline"
              className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Customer Declined
            </Button>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && (
          <div className="space-y-6">
            {/* Condition Score Comparison */}
            <div className={cn(
              "p-4 rounded-xl border",
              scoreDecreased ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Gauge className={cn("w-5 h-5", scoreDecreased ? "text-destructive" : "text-success")} />
                <h3 className="text-sm font-semibold text-foreground">Vehicle Condition</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Original</p>
                  <p className={cn("text-2xl font-bold", originalGrade.color)}>{originalScore}</p>
                  <p className={cn("text-xs", originalGrade.color)}>{originalGrade.label}</p>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  {scoreDecreased ? (
                    <>
                      <TrendingDown className="w-6 h-6 text-destructive" />
                      <span className="text-sm font-bold text-destructive">{scoreDifference}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-success" />
                      <span className="text-xs text-success">Maintained</span>
                    </>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current</p>
                  <p className={cn("text-2xl font-bold", newGrade.color)}>{newScore}</p>
                  <p className={cn("text-xs", newGrade.color)}>{newGrade.label}</p>
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Changes Detected</h3>
              
              {newIssuesCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    New Issues
                  </span>
                  <span className="font-medium text-destructive">{newIssuesCount}</span>
                </div>
              )}
              
              {worsenedCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-warning flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Worsened Conditions
                  </span>
                  <span className="font-medium text-warning">{worsenedCount}</span>
                </div>
              )}
              
              {improvedCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Improvements
                  </span>
                  <span className="font-medium text-success">{improvedCount}</span>
                </div>
              )}
              
              {resolvedCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved Issues
                  </span>
                  <span className="font-medium text-success">{resolvedCount}</span>
                </div>
              )}
            </div>

            {/* Warning for new issues */}
            {hasNewIssues && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Condition Changes Detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New issues have been identified during re-inspection. By proceeding, the customer acknowledges these changes occurred during their possession.
                  </p>
                </div>
              </div>
            )}

            {/* Consent Checkbox */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I have reviewed the re-inspection report and acknowledge the current vehicle condition. 
                  {hasNewIssues && " I accept responsibility for the new issues detected."}
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleProceedToPrice}
                disabled={!agreed || loading}
                className="w-full h-14"
              >
                {scoreDecreased ? "Review Price Adjustment" : "Approve Handover"}
                <FileCheck className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={handleReject}
                variant="outline"
                className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Decline & Dispute
              </Button>
            </div>
          </div>
        )}

        {/* Price Negotiation Step */}
        {step === "price_negotiation" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6 text-warning" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Price Adjustment
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Due to condition changes, the vehicle value has been adjusted
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm text-muted-foreground">Original Price</span>
                  <span className="text-lg font-semibold text-foreground">₹{originalPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <span className="text-sm text-warning">Adjusted Price</span>
                  <span className="text-lg font-bold text-warning">₹{suggestedNewPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span>Reduction of ₹{(originalPrice - suggestedNewPrice).toLocaleString()} based on {Math.abs(scoreDifference)} point decrease</span>
                </div>
              </div>
            </div>

            {/* Counter Offer Option */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <button
                onClick={() => setShowPriceOffer(!showPriceOffer)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-medium text-foreground">Make a counter offer?</span>
                <span className="text-sm text-primary">{showPriceOffer ? "Hide" : "Show"}</span>
              </button>
              
              {showPriceOffer && (
                <div className="mt-4 space-y-3">
                  <Input
                    type="number"
                    placeholder="Enter your offer"
                    value={newPriceOffer}
                    onChange={(e) => setNewPriceOffer(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    The counter offer will be recorded and considered by the OEM team
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAcceptPrice}
                disabled={loading}
                className="w-full h-14"
              >
                {loading ? "Processing..." : `Accept ${newPriceOffer ? "Counter Offer" : "Adjusted Price"}`}
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={handleReject}
                variant="outline"
                className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Decline
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Handover Approved
              </h2>
              <p className="text-muted-foreground">
                The customer has approved the re-inspection report and the vehicle handover is complete.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final Condition Score</span>
                <span className={cn("font-semibold", newGrade.color)}>{newScore} ({newGrade.label})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final Price</span>
                <span className="font-semibold text-foreground">
                  ₹{(newPriceOffer ? parseInt(newPriceOffer) : suggestedNewPrice).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved At</span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Approval Reference</p>
              <p className="text-sm font-mono text-foreground break-all">
                {`DELTA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`}
              </p>
            </div>

            <Button onClick={handleBackToDashboard} className="w-full h-14">
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Rejection Confirmation */}
        {step === "rejected" && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Handover Declined
              </h2>
              <p className="text-muted-foreground">
                The customer has declined the re-inspection report. The reason has been recorded.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border text-left">
              <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
              <p className="text-sm font-medium text-foreground">
                {rejectionCategories.find(c => c.id === rejectionCategory)?.label || "Not specified"}
              </p>
              {rejectionReason && (
                <>
                  <p className="text-xs text-muted-foreground mt-3 mb-1">Additional Details</p>
                  <p className="text-sm text-foreground">{rejectionReason}</p>
                </>
              )}
            </div>

            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning font-medium">
                Case Escalated
              </p>
              <p className="text-xs text-warning/80 mt-1">
                This case has been escalated for review by the OEM team
              </p>
            </div>

            <Button onClick={handleBackToDashboard} variant="outline" className="w-full h-14">
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="max-w-sm mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-destructive" />
              Reason for Declining
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason and provide additional details if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {rejectionCategories.map((cat) => (
                <label
                  key={cat.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    rejectionCategory === cat.id 
                      ? "border-destructive bg-destructive/5" 
                      : "border-border hover:bg-secondary"
                  )}
                >
                  <input
                    type="radio"
                    name="rejection"
                    value={cat.id}
                    checked={rejectionCategory === cat.id}
                    onChange={(e) => setRejectionCategory(e.target.value)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    rejectionCategory === cat.id ? "border-destructive" : "border-muted-foreground"
                  )}>
                    {rejectionCategory === cat.id && (
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{cat.label}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Additional Details (Optional)
              </label>
              <Textarea
                placeholder="Provide more details about your concern..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="h-24"
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRejection}
              disabled={!rejectionCategory || loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Submitting..." : "Submit & Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeltaConsentFlow;
