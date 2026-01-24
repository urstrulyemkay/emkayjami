import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Send,
  Gavel
} from "lucide-react";

const ConsentFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inspectionData = location.state || {};

  const [step, setStep] = useState<"phone" | "otp" | "review" | "confirm">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const defects = inspectionData.defects || [];
  const images = inspectionData.images || [];
  const videos = inspectionData.videos || [];

  // Calculate condition score (mock)
  const conditionScore = Math.max(0, 100 - defects.length * 8 - 
    defects.filter((d: any) => d.severity === "critical").length * 15 -
    defects.filter((d: any) => d.severity === "major").length * 10);

  const handleSendOtp = async () => {
    setLoading(true);
    // Mock OTP send
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    // Mock OTP verification
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-6">
        {step !== "confirm" && (
          <button
            onClick={() => {
              if (step === "phone") navigate(-1);
              else if (step === "otp") setStep("phone");
              else if (step === "review") setStep("otp");
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
            {step === "phone" && "Verify customer phone number"}
            {step === "otp" && "Enter OTP sent to customer"}
            {step === "review" && "Review and confirm inspection report"}
            {step === "confirm" && "Inspection frozen and secured"}
          </p>
        </div>
      </header>

      <div className="px-6 pb-8">
        {/* Phone Step */}
        {step === "phone" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Customer Verification
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the customer's phone number to send a verification OTP
              </p>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
              />
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={phone.length < 10 || loading}
              className="w-full h-14"
            >
              {loading ? "Sending..." : "Send OTP"}
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Enter OTP
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit OTP sent to {phone}
              </p>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-12 text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="w-full h-14"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <button
              onClick={handleSendOtp}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary"
            >
              Resend OTP
            </button>
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