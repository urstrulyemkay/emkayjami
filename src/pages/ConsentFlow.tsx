import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  Gavel,
  Zap,
  QrCode,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const ConsentFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inspectionData = location.state || {};

  const [step, setStep] = useState<"qr_scan" | "waiting_approval" | "review" | "confirm">("qr_scan");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // QR Code / WhatsApp approval
  const [approvalToken] = useState(() => `INS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

  const defects = inspectionData.defects || [];
  const images = inspectionData.images || [];
  const videos = inspectionData.videos || [];

  // Calculate condition score (mock)
  const conditionScore = Math.max(0, 100 - defects.length * 8 - 
    defects.filter((d: any) => d.severity === "critical").length * 15 -
    defects.filter((d: any) => d.severity === "major").length * 10);

  // DriveX WhatsApp number (mock)
  const driveXWhatsAppNumber = "919876543210";
  
  // Generate WhatsApp deep link with pre-filled message
  const generateWhatsAppLink = () => {
    const vehicleInfo = inspectionData.vehicle 
      ? `${inspectionData.vehicle.make} ${inspectionData.vehicle.model}` 
      : "Vehicle";
    const registration = inspectionData.vehicle?.registration || "N/A";
    
    const message = encodeURIComponent(
      `Hi DriveX, I want to approve the inspection report.\n\nApproval Token: ${approvalToken}\nVehicle: ${vehicleInfo}\nRegistration: ${registration}\nCondition Score: ${conditionScore}/100\n\nPlease confirm my approval.`
    );
    return `https://wa.me/${driveXWhatsAppNumber}?text=${message}`;
  };

  const handleShowQR = () => {
    setStep("waiting_approval");
  };

  // Simulate customer approval via WhatsApp (in production, this would be a webhook)
  const handleCustomerApproved = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("review");
  };

  const handleConsent = async () => {
    if (!agreed) return;
    setLoading(true);
    // Would submit consent to backend with frozen hash
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep("confirm");
  };

  const handleLaunchAuction = () => {
    // Navigate to auction setup with inspection data
    navigate("/auction/setup", { 
      state: { 
        ...inspectionData,
        conditionScore,
        consentGiven: true,
        frozenAt: new Date().toISOString(),
      },
      replace: true 
    });
  };

  const handleBackToDashboard = () => {
    navigate("/", { replace: true });
  };

  // Skip consent for testing/QA purposes
  const handleSkipConsent = () => {
    navigate("/auction/setup", { 
      state: { 
        ...inspectionData,
        conditionScore,
        consentGiven: true,
        consentSkipped: true, // Flag for testing
        frozenAt: new Date().toISOString(),
      },
      replace: true 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          {step !== "confirm" && (
            <button
              onClick={() => {
                if (step === "qr_scan") navigate(-1);
                else if (step === "waiting_approval") setStep("qr_scan");
                else if (step === "review") setStep("waiting_approval");
              }}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {step === "confirm" ? "Consent Recorded" : "Customer Consent"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "qr_scan" && "Customer WhatsApp verification"}
              {step === "waiting_approval" && "Waiting for customer approval"}
              {step === "review" && "Review and confirm inspection report"}
              {step === "confirm" && "Inspection frozen and secured"}
            </p>
          </div>
        </div>
        {/* Skip button for testing */}
        {step !== "confirm" && (
          <Button
            onClick={handleSkipConsent}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1 text-warning hover:text-warning hover:bg-warning/10"
          >
            <Zap className="w-3 h-3" />
            Skip
          </Button>
        )}
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
                The customer can approve the inspection by scanning this QR code with their phone
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
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images Captured</span>
                <span className="text-foreground font-medium">{images.length}/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Videos Captured</span>
                <span className="text-foreground font-medium">{videos.length}/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defects Logged</span>
                <span className="text-foreground font-medium">{defects.length}</span>
              </div>
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
          </div>
        )}

        {/* Review Step */}
        {step === "review" && (
          <div className="space-y-6">
            {/* Condition Score */}
            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">Condition Score</p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${conditionScore * 3.52} 352`}
                    className={conditionScore >= 70 ? "text-success" : conditionScore >= 40 ? "text-warning" : "text-destructive"}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-foreground">
                  {conditionScore}
                </span>
              </div>
              <p className={`font-medium ${conditionScore >= 70 ? "text-success" : conditionScore >= 40 ? "text-warning" : "text-destructive"}`}>
                {conditionScore >= 70 ? "Good Condition" : conditionScore >= 40 ? "Fair Condition" : "Poor Condition"}
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images Captured</span>
                <span className="text-foreground font-medium">{images.length}/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Videos Captured</span>
                <span className="text-foreground font-medium">{videos.length}/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defects Logged</span>
                <span className="text-foreground font-medium">{defects.length}</span>
              </div>
            </div>

            {/* Defects Warning */}
            {defects.length > 0 && (
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Defects Recorded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {defects.length} defect(s) have been documented. By consenting, you acknowledge awareness of these issues.
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
                  I confirm that I have reviewed the inspection report and all recorded evidence. 
                  I understand this report will be frozen and cannot be modified after consent.
                </span>
              </label>
            </div>

            <Button
              onClick={handleConsent}
              disabled={!agreed || loading}
              className="w-full h-14"
            >
              {loading ? "Processing..." : "Confirm & Lock Report"}
              <FileCheck className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Confirmation Step - Updated with Auction Launch */}
        {step === "confirm" && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Consent Recorded
              </h2>
              <p className="text-muted-foreground">
                The inspection report has been frozen and secured with a tamper-proof hash.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">Report Hash</p>
              <p className="text-sm font-mono text-foreground break-all">
                {`0x${Math.random().toString(16).slice(2, 18)}...${Math.random().toString(16).slice(2, 10)}`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm text-success font-medium">
                +50 Coins & +5 Trust Score
              </p>
              <p className="text-xs text-success/80 mt-1">
                Earned for completing inspection with consent
              </p>
            </div>

            {/* Auction Launch CTA */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Gavel className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">
                Ready to Sell?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Launch an auction to get the best price from verified brokers
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleLaunchAuction} className="w-full h-14 gap-2">
                <Gavel className="w-5 h-5" />
                Launch Auction
              </Button>
              <Button onClick={handleBackToDashboard} variant="outline" className="w-full h-12">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentFlow;