import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { useServiceTracking } from "@/hooks/useServiceTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Package,
  FileText,
  UserCheck,
  Shield,
  Car,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Building2,
  IndianRupee,
} from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import ServiceProgressStepper, { ServiceStage } from "@/components/broker/ServiceProgressStepper";
import ServiceStageCard from "@/components/broker/ServiceStageCard";
import RCTransferCountdown from "@/components/broker/RCTransferCountdown";
import ServiceUploadSheet from "@/components/broker/ServiceUploadSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Image mapping by vehicle make
const VEHICLE_IMAGES: Record<string, string> = {
  "Honda": "/vehicles/activa1.jpg",
  "TVS": "/vehicles/pulsar5.jpg",
  "Bajaj": "/vehicles/pulsar2.jpg",
  "Royal Enfield": "/vehicles/royalenfield1.jpg",
  "Yamaha": "/vehicles/pulsar5.jpg",
  "Hero": "/vehicles/activa2.jpg",
  "Suzuki": "/vehicles/activa7.jpg",
  "KTM": "/vehicles/duke390.jpg",
};

const getVehicleImage = (make: string): string => {
  return VEHICLE_IMAGES[make] || "/vehicles/activa1.jpg";
};

// Service stage guidance data
const SERVICE_GUIDANCE = {
  payment: {
    title: "Complete Payment",
    steps: [
      "Pay the winning bid amount + commission to DriveX",
      "Use bank transfer, UPI, or NEFT/RTGS",
      "Keep payment receipt for records",
      "Payment confirmation within 24 hours"
    ],
    requirements: [
      "Valid bank account or UPI ID",
      "Sufficient balance for bid + commission amount"
    ],
    timeline: "Complete within 48 hours of winning",
    helpline: "+91 99XX XXX XXX"
  },
  pickup: {
    title: "Vehicle Pickup",
    steps: [
      "Schedule pickup slot from available dates",
      "Visit DriveX yard with valid ID proof",
      "Inspect vehicle before taking delivery",
      "Sign handover documents and collect keys"
    ],
    requirements: [
      "Aadhaar card or driving license",
      "Payment completion confirmation",
      "Printed or digital winning confirmation"
    ],
    timeline: "Schedule within 3 days, pickup within 7 days",
    helpline: "+91 99XX XXX XXX"
  },
  delivery: {
    title: "Delivery Tracking",
    steps: [
      "Track vehicle delivery status in real-time",
      "Coordinate with assigned driver",
      "Inspect vehicle upon delivery",
      "Confirm delivery to complete this step"
    ],
    requirements: [
      "Valid delivery address",
      "Available contact number",
      "Someone to receive the vehicle"
    ],
    timeline: "2-5 days after pickup confirmation",
    helpline: "+91 99XX XXX XXX"
  },
  rc_transfer: {
    title: "RC Transfer (CRITICAL)",
    steps: [
      "Collect original RC from DriveX",
      "Visit local RTO with required documents",
      "Submit Form 29 and Form 30",
      "Pay transfer fees at RTO",
      "Collect new RC in buyer's name",
      "Upload proof to complete"
    ],
    requirements: [
      "Original RC book",
      "Form 29 (Transfer of ownership)",
      "Form 30 (Intimation of transfer)",
      "Valid insurance",
      "PUC certificate",
      "Address proof of new owner",
      "ID proof of both parties"
    ],
    timeline: "MUST complete within 6 months of purchase",
    penalty: "Failure results in -500 coins and -10 trust score",
    helpline: "+91 99XX XXX XXX"
  },
  name_transfer: {
    title: "Name Transfer",
    steps: [
      "After RC transfer, update insurance",
      "Update name in RTO records",
      "Get NOC if required for inter-state transfer",
      "Upload completed transfer documents"
    ],
    requirements: [
      "Transferred RC in new name",
      "Insurance policy in new name",
      "NOC from previous RTO (if applicable)"
    ],
    timeline: "Complete within 30 days after RC transfer",
    helpline: "+91 99XX XXX XXX"
  },
  insurance: {
    title: "Insurance Update",
    steps: [
      "Transfer existing policy to your name, OR",
      "Purchase new comprehensive insurance",
      "Ensure coverage starts from delivery date",
      "Upload insurance document as proof"
    ],
    requirements: [
      "Vehicle RC copy",
      "ID proof",
      "Previous insurance details (if transferring)"
    ],
    timeline: "Complete before or immediately after delivery",
    helpline: "+91 99XX XXX XXX"
  }
};

const BrokerWonVehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { broker, isAuthenticated, isLoading: authLoading } = useBrokerAuth();
  const {
    vehicle,
    documents,
    loading,
    saving,
    updateServiceStatus,
    uploadProof,
    getRemainingDays,
    isMockData,
  } = useServiceTracking(id);

  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [uploadServiceType, setUploadServiceType] = useState<string>("");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/broker/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading || !broker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Vehicle not found</p>
        <Button onClick={() => navigate("/broker/bids")}>Back to Bids</Button>
      </div>
    );
  }

  const remainingDays = getRemainingDays();
  const isUrgent = remainingDays <= 30 && vehicle.rc_transfer_status !== "completed";

  // Calculate overall progress
  const stagesComplete = [
    vehicle.payment_status === "completed",
    vehicle.pickup_status === "completed",
    vehicle.delivery_status === "completed",
    vehicle.rc_transfer_status === "completed",
    vehicle.name_transfer_status === "completed",
  ].filter(Boolean).length;
  const overallProgress = Math.round((stagesComplete / 5) * 100);

  // Build stages for stepper
  const stages: ServiceStage[] = [
    { id: "payment", label: "Payment", status: vehicle.payment_status as ServiceStage["status"] },
    { id: "pickup", label: "Pickup", status: vehicle.pickup_status as ServiceStage["status"] },
    { id: "delivery", label: "Delivery", status: vehicle.delivery_status as ServiceStage["status"] },
    { id: "rc_transfer", label: "RC Transfer", status: vehicle.rc_transfer_status as ServiceStage["status"], isUrgent },
    { id: "name_transfer", label: "Name Transfer", status: vehicle.name_transfer_status as ServiceStage["status"] },
  ];

  const handleOpenUpload = (serviceType: string) => {
    setUploadServiceType(serviceType);
    setUploadSheetOpen(true);
  };

  const handleUpload = async (file: File, serviceType: string): Promise<boolean> => {
    if (isMockData) {
      toast.success("Demo: Document upload simulated successfully!");
      return true;
    }
    const result = await uploadProof(serviceType as any, file);
    if (result) {
      toast.success("Document uploaded successfully");
      return true;
    } else {
      toast.error("Failed to upload document");
      return false;
    }
  };

  const handleStatusUpdate = async (
    serviceType: "payment" | "pickup" | "delivery" | "rc_transfer" | "name_transfer" | "insurance",
    status: string
  ) => {
    if (isMockData) {
      toast.success(`Demo: ${serviceType.replace("_", " ")} status updated!`);
      return;
    }
    const success = await updateServiceStatus(serviceType, status);
    if (success) {
      toast.success(`${serviceType.replace("_", " ")} status updated`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const getDocumentsForService = (serviceType: string) => {
    return documents.filter((d) => d.service_type === serviceType);
  };

  const renderGuidanceCard = (stageId: string) => {
    const guidance = SERVICE_GUIDANCE[stageId as keyof typeof SERVICE_GUIDANCE];
    if (!guidance) return null;

    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            How to Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Steps */}
          <div>
            <p className="font-medium mb-2">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              {guidance.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Requirements */}
          <div>
            <p className="font-medium mb-2">Required Documents:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {guidance.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{guidance.timeline}</span>
          </div>

          {/* Penalty warning for RC transfer */}
          {"penalty" in guidance && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">{guidance.penalty}</span>
            </div>
          )}

          {/* Helpline */}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={`tel:${guidance.helpline.replace(/\s/g, "")}`}>
              <Phone className="w-4 h-4 mr-2" />
              Call Helpline: {guidance.helpline}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  };

  const inspection = vehicle.auction?.inspections;
  const bidAmount = vehicle.bid?.bid_amount || 0;
  const commissionAmount = vehicle.bid?.commission_amount || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/broker/bids")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Service Tracking</h1>
            <p className="text-sm text-muted-foreground">
              {inspection?.vehicle_make} {inspection?.vehicle_model}
            </p>
          </div>
          {isMockData && (
            <Badge variant="secondary" className="text-xs">Demo Mode</Badge>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Vehicle Summary Card */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
              <img 
                src={getVehicleImage(inspection?.vehicle_make || "Honda")} 
                alt={`${inspection?.vehicle_make} ${inspection?.vehicle_model}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">
                {inspection?.vehicle_make} {inspection?.vehicle_model}
              </h2>
              <p className="text-sm text-muted-foreground">
                {inspection?.vehicle_year} • {inspection?.vehicle_registration}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Won on {new Date(vehicle.won_at).toLocaleDateString("en-IN")}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Payment Summary */}
          <div className="flex justify-between mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Winning Bid</p>
              <p className="font-semibold">₹{bidAmount.toLocaleString()}</p>
            </div>
            {commissionAmount > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-semibold text-amber-600">
                  +₹{commissionAmount.toLocaleString()}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold">
                ₹{(bidAmount + commissionAmount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className={`text-sm font-semibold ${overallProgress === 100 ? "text-green-600" : ""}`}>
                {stagesComplete}/5 Complete ({overallProgress}%)
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>

        {/* Service Progress Stepper */}
        <ServiceProgressStepper stages={stages} />

        {/* RC Transfer Countdown (Critical) */}
        <RCTransferCountdown
          deadline={vehicle.rc_transfer_deadline}
          status={vehicle.rc_transfer_status as "pending" | "in_progress" | "completed"}
        />

        {/* Service Stage Cards with Accordion */}
        <div className="space-y-4">
          <h3 className="font-semibold">Service Details</h3>

          <Accordion
            type="single"
            collapsible
            value={expandedStage || undefined}
            onValueChange={(val) => setExpandedStage(val || null)}
          >
            {/* Payment */}
            <AccordionItem value="payment" className="border rounded-xl mb-3 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.payment_status === "completed" ? "bg-green-100 text-green-600" :
                    vehicle.payment_status === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Payment</p>
                    <p className="text-xs text-muted-foreground">Pay ₹{(bidAmount + commissionAmount).toLocaleString()}</p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.payment_status === "completed" ? "bg-green-500" :
                  vehicle.payment_status === "in_progress" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.payment_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {vehicle.payment_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("payment")}
                <ServiceStageCard
                  title="Payment"
                  description="Complete payment to DriveX"
                  status={vehicle.payment_status as any}
                  icon={<CreditCard className="w-5 h-5" />}
                  completedAt={vehicle.payment_completed_at}
                  actionLabel={vehicle.payment_status === "pending" ? "Confirm Payment" : undefined}
                  onAction={() => handleStatusUpdate("payment", "completed")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Pickup */}
            <AccordionItem value="pickup" className="border rounded-xl mb-3 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.pickup_status === "completed" ? "bg-green-100 text-green-600" :
                    vehicle.pickup_status === "scheduled" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Vehicle Pickup</p>
                    <p className="text-xs text-muted-foreground">Collect from DriveX yard</p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.pickup_status === "completed" ? "bg-green-500" :
                  vehicle.pickup_status === "scheduled" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.pickup_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {vehicle.pickup_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("pickup")}
                <ServiceStageCard
                  title="Vehicle Pickup"
                  description="Schedule and confirm vehicle pickup"
                  status={vehicle.pickup_status as any}
                  icon={<Truck className="w-5 h-5" />}
                  completedAt={vehicle.pickup_completed_at}
                  actionLabel={
                    vehicle.pickup_status === "pending"
                      ? "Schedule Pickup"
                      : vehicle.pickup_status === "scheduled"
                      ? "Confirm Pickup"
                      : undefined
                  }
                  onAction={() =>
                    handleStatusUpdate(
                      "pickup",
                      vehicle.pickup_status === "pending" ? "scheduled" : "completed"
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>

            {/* Delivery */}
            <AccordionItem value="delivery" className="border rounded-xl mb-3 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.delivery_status === "completed" ? "bg-green-100 text-green-600" :
                    vehicle.delivery_status === "in_transit" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Delivery</p>
                    <p className="text-xs text-muted-foreground">Vehicle delivery tracking</p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.delivery_status === "completed" ? "bg-green-500" :
                  vehicle.delivery_status === "in_transit" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.delivery_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {vehicle.delivery_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("delivery")}
                <ServiceStageCard
                  title="Delivery"
                  description="Track vehicle delivery to your location"
                  status={vehicle.delivery_status as any}
                  icon={<Package className="w-5 h-5" />}
                  completedAt={vehicle.delivered_at}
                  actionLabel={
                    vehicle.delivery_status === "in_transit" ? "Confirm Delivery" : undefined
                  }
                  onAction={() => handleStatusUpdate("delivery", "completed")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* RC Transfer - Critical */}
            <AccordionItem value="rc_transfer" className={`border rounded-xl mb-3 overflow-hidden ${isUrgent ? "border-destructive" : ""}`}>
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.rc_transfer_status === "completed" ? "bg-green-100 text-green-600" :
                    isUrgent ? "bg-destructive/10 text-destructive" :
                    vehicle.rc_transfer_status === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">RC Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      {remainingDays} days remaining • Deadline: {new Date(vehicle.rc_transfer_deadline).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.rc_transfer_status === "completed" ? "bg-green-500" :
                  isUrgent ? "bg-destructive" : 
                  vehicle.rc_transfer_status === "in_progress" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.rc_transfer_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {isUrgent && vehicle.rc_transfer_status !== "completed" ? "URGENT" : vehicle.rc_transfer_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("rc_transfer")}
                <ServiceStageCard
                  title="RC Transfer"
                  description="Transfer Registration Certificate within 6 months"
                  status={vehicle.rc_transfer_status as any}
                  icon={<FileText className="w-5 h-5" />}
                  deadline={vehicle.rc_transfer_deadline}
                  completedAt={vehicle.rc_transferred_at}
                  isUrgent={isUrgent}
                  showUpload={vehicle.rc_transfer_status !== "completed"}
                  onUpload={() => handleOpenUpload("rc_transfer")}
                  documents={getDocumentsForService("rc_transfer")}
                  actionLabel={
                    vehicle.rc_transfer_status === "in_progress" ? "Mark Complete" : undefined
                  }
                  onAction={() => handleStatusUpdate("rc_transfer", "completed")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Name Transfer */}
            <AccordionItem value="name_transfer" className="border rounded-xl mb-3 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.name_transfer_status === "completed" ? "bg-green-100 text-green-600" :
                    vehicle.name_transfer_status === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Name Transfer</p>
                    <p className="text-xs text-muted-foreground">Complete RTO ownership transfer</p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.name_transfer_status === "completed" ? "bg-green-500" :
                  vehicle.name_transfer_status === "in_progress" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.name_transfer_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {vehicle.name_transfer_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("name_transfer")}
                <ServiceStageCard
                  title="Name Transfer"
                  description="Complete ownership transfer in RTO records"
                  status={vehicle.name_transfer_status as any}
                  icon={<UserCheck className="w-5 h-5" />}
                  completedAt={vehicle.name_transferred_at}
                  showUpload={vehicle.name_transfer_status !== "completed"}
                  onUpload={() => handleOpenUpload("name_transfer")}
                  documents={getDocumentsForService("name_transfer")}
                  actionLabel={
                    vehicle.name_transfer_status === "in_progress" ? "Mark Complete" : undefined
                  }
                  onAction={() => handleStatusUpdate("name_transfer", "completed")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Insurance */}
            <AccordionItem value="insurance" className="border rounded-xl mb-3 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    vehicle.insurance_status === "completed" ? "bg-green-100 text-green-600" :
                    vehicle.insurance_status === "in_progress" ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Insurance</p>
                    <p className="text-xs text-muted-foreground">Transfer or purchase new insurance</p>
                  </div>
                </div>
                <Badge className={`mr-2 ${
                  vehicle.insurance_status === "completed" ? "bg-green-500" :
                  vehicle.insurance_status === "in_progress" ? "" : "bg-secondary text-secondary-foreground"
                }`}>
                  {vehicle.insurance_status === "completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                  {vehicle.insurance_status}
                </Badge>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {renderGuidanceCard("insurance")}
                <ServiceStageCard
                  title="Insurance"
                  description="Transfer existing policy or get new insurance"
                  status={vehicle.insurance_status as any}
                  icon={<Shield className="w-5 h-5" />}
                  showUpload={vehicle.insurance_status !== "completed"}
                  onUpload={() => handleOpenUpload("insurance")}
                  documents={getDocumentsForService("insurance")}
                  actionLabel={
                    vehicle.insurance_status !== "completed" ? "Mark Complete" : undefined
                  }
                  onAction={() => handleStatusUpdate("insurance", "completed")}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Help Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Need Help?</p>
                <p className="text-sm text-muted-foreground">Our service team is here to assist you</p>
              </div>
              <Button size="sm" asChild>
                <a href="tel:+919900000000">Call Now</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Sheet */}
      <ServiceUploadSheet
        open={uploadSheetOpen}
        onOpenChange={setUploadSheetOpen}
        serviceType={uploadServiceType}
        onUpload={handleUpload}
      />

      <BrokerBottomNav activeTab="bids" />
    </div>
  );
};

export default BrokerWonVehicleDetail;
