import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { useServiceTracking } from "@/hooks/useServiceTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import ServiceProgressStepper, { ServiceStage } from "@/components/broker/ServiceProgressStepper";
import ServiceStageCard from "@/components/broker/ServiceStageCard";
import RCTransferCountdown from "@/components/broker/RCTransferCountdown";
import ServiceUploadSheet from "@/components/broker/ServiceUploadSheet";

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
  } = useServiceTracking(id);

  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [uploadServiceType, setUploadServiceType] = useState<string>("");

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

  // Build stages for stepper
  const stages: ServiceStage[] = [
    {
      id: "payment",
      label: "Payment",
      status: vehicle.payment_status as ServiceStage["status"],
    },
    {
      id: "pickup",
      label: "Pickup",
      status: vehicle.pickup_status as ServiceStage["status"],
    },
    {
      id: "delivery",
      label: "Delivery",
      status: vehicle.delivery_status as ServiceStage["status"],
    },
    {
      id: "rc_transfer",
      label: "RC Transfer",
      status: vehicle.rc_transfer_status as ServiceStage["status"],
      isUrgent,
    },
    {
      id: "name_transfer",
      label: "Name Transfer",
      status: vehicle.name_transfer_status as ServiceStage["status"],
    },
  ];

  const handleOpenUpload = (serviceType: string) => {
    setUploadServiceType(serviceType);
    setUploadSheetOpen(true);
  };

  const handleUpload = async (file: File, serviceType: string): Promise<boolean> => {
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
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Vehicle Summary Card */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Car className="w-8 h-8 text-muted-foreground" />
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
        </div>

        {/* Service Progress Stepper */}
        <ServiceProgressStepper stages={stages} />

        {/* RC Transfer Countdown (Critical) */}
        <RCTransferCountdown
          deadline={vehicle.rc_transfer_deadline}
          status={vehicle.rc_transfer_status as "pending" | "in_progress" | "completed"}
        />

        {/* Service Stage Cards */}
        <div className="space-y-4">
          <h3 className="font-semibold">Service Details</h3>

          {/* Payment */}
          <ServiceStageCard
            title="Payment"
            description="Complete payment to DriveX"
            status={vehicle.payment_status as any}
            icon={<CreditCard className="w-5 h-5" />}
            completedAt={vehicle.payment_completed_at}
            actionLabel={vehicle.payment_status === "pending" ? "Confirm Payment" : undefined}
            onAction={() => handleStatusUpdate("payment", "completed")}
          />

          {/* Pickup */}
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

          {/* Delivery */}
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

          {/* RC Transfer */}
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
          >
            {vehicle.rc_transfer_status !== "completed" && (
              <p className="text-xs text-muted-foreground">
                ⚠️ Failure to transfer RC within 6 months results in -500 coins and -10 trust score
              </p>
            )}
          </ServiceStageCard>

          {/* Name Transfer */}
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

          {/* Insurance */}
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
        </div>
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
