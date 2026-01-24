import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { 
  ArrowLeft, Trophy, Check, Users, Timer, TrendingUp, ChevronRight, 
  Calendar as CalendarIcon, Clock, Camera, Upload, X, FileText, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bid } from "@/data/auctionTypes";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuctionActions } from "@/hooks/useAuctionActions";

interface ResultState {
  vehicle: {
    make: string;
    model: string;
    year: number;
    registration: string;
  };
  winningBid: Bid | null;
  totalBids: number;
  averageBid: number;
  slaMetTime: Date | null;
  auctionType: string;
  inspectionId?: string;
}

const AuctionResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const resultState = location.state as ResultState | null;
  
  // Initialize hook with inspectionId from state
  const {
    pickupSchedule,
    documents,
    isLoading,
    isSaving,
    savePickupSchedule,
    uploadDocument,
    removeDocument,
  } = useAuctionActions(resultState?.inspectionId || null);
  
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);

  // Sync completed actions with persisted data
  useEffect(() => {
    const newCompleted = new Set<string>();
    if (pickupSchedule) {
      newCompleted.add("3");
      setScheduleDate(pickupSchedule.pickupDate);
      setScheduleTime(pickupSchedule.pickupTime);
    }
    if (documents.length > 0) {
      newCompleted.add("4");
    }
    if (newCompleted.size > 0) {
      setCompletedActions((prev) => new Set([...prev, ...newCompleted]));
    }
  }, [pickupSchedule, documents]);

  if (!resultState || !resultState.winningBid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No auction results available.</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { vehicle, winningBid, totalBids, averageBid, slaMetTime } = resultState;

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  ];

  const handleScheduleConfirm = async () => {
    if (scheduleDate && scheduleTime) {
      const success = await savePickupSchedule(scheduleDate, scheduleTime);
      if (success) {
        setCompletedActions((prev) => new Set(prev).add("3"));
        setShowScheduleDialog(false);
        toast({
          title: "Pickup Scheduled",
          description: `${format(scheduleDate, "PPP")} at ${scheduleTime}`,
        });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await uploadDocument(file);
      }
      toast({
        title: "Documents Added",
        description: `${files.length} file(s) uploaded`,
      });
    }
    // Reset input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      // Rename file for camera captures
      const renamedFile = new File(
        [file],
        `Photo_${format(new Date(), "yyyyMMdd_HHmmss")}.jpg`,
        { type: file.type }
      );
      await uploadDocument(renamedFile);
      toast({
        title: "Photo Captured",
        description: "Document photo added",
      });
    }
    // Reset input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    await removeDocument(docId);
  };

  const handleDocumentsConfirm = () => {
    if (documents.length > 0) {
      setCompletedActions((prev) => new Set(prev).add("4"));
      setShowDocumentsDialog(false);
      toast({
        title: "Documents Collected",
        description: `${documents.length} document(s) saved`,
      });
    }
  };

  const toggleAction = (actionId: string) => {
    // For scheduling and documents, open dialogs instead of toggling
    if (actionId === "3" && !completedActions.has("3")) {
      setShowScheduleDialog(true);
      return;
    }
    if (actionId === "4" && !completedActions.has("4")) {
      setShowDocumentsDialog(true);
      return;
    }
    
    setCompletedActions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  const getActionDetails = (actionId: string) => {
    if (actionId === "3" && completedActions.has("3") && scheduleDate && scheduleTime) {
      return `${format(scheduleDate, "MMM d")} at ${scheduleTime}`;
    }
    if (actionId === "4" && completedActions.has("4") && documents.length > 0) {
      return `${documents.length} document(s)`;
    }
    return null;
  };

  const nextActions = [
    { id: "1", text: "Customer approved quotation" },
    { id: "2", text: "Confirm sale with winning broker" },
    { id: "3", text: "Schedule pickup and parking" },
    { id: "4", text: "Collect documents from customer" },
  ];

  const allActionsCompleted = completedActions.size === nextActions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 pt-12 pb-4">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Auction Results</h1>
      </header>

      <div className="px-6 pb-8 space-y-6">
        {/* Success Card */}
        <div className="p-6 rounded-2xl bg-success/10 border border-success text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Auction Complete!</h2>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} • {vehicle.registration}
          </p>
        </div>

        {/* Winning Bid Card */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Winning Bid</p>
            <p className="text-5xl font-bold text-foreground">
              ₹{winningBid.amount.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-success">
                +₹{winningBid.incentive.toLocaleString()} incentive
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalBids}</p>
              <p className="text-xs text-muted-foreground">Total Bids</p>
            </div>
            <div className="text-center border-x border-border">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-foreground">
                ₹{(averageBid / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Timer className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-success">
                {slaMetTime ? "✓" : "—"}
              </p>
              <p className="text-xs text-muted-foreground">SLA Met</p>
            </div>
          </div>
        </div>

        {/* Broker Info */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Winning Broker</p>
              <p className="font-medium text-foreground">{winningBid.brokerName}</p>
            </div>
            <div className="px-2 py-1 rounded-full bg-secondary text-xs text-foreground">
              Level 4
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Broker ID: {winningBid.brokerId} • Won at {winningBid.timestamp.toLocaleTimeString()}
          </p>
        </div>

        {/* Next Actions */}
        <section>
          <h2 className="font-medium text-foreground mb-3">Next Actions</h2>
          <div className="space-y-2">
            {nextActions.map((action) => {
              const isDone = completedActions.has(action.id);
              const details = getActionDetails(action.id);
              return (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border bg-card text-left transition-all ${
                    isDone ? "border-success bg-success/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone ? "bg-success border-success" : "border-muted-foreground"
                  }`}>
                    {isDone && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className={`${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {action.text}
                    </span>
                    {details && (
                      <p className="text-xs text-success mt-0.5">{details}</p>
                    )}
                  </div>
                  {!isDone && (
                    action.id === "3" ? (
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    ) : action.id === "4" ? (
                      <Camera className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Schedule Pickup Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Schedule Pickup</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Date Picker */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Time
                </label>
                <Select value={scheduleTime} onValueChange={setScheduleTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time slot">
                      {scheduleTime || (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Choose time slot
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleScheduleConfirm}
                disabled={!scheduleDate || !scheduleTime || isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm Schedule"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Documents Collection Dialog */}
        <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Collect Documents</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />

              {/* Upload buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 h-20 flex-col gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <span className="text-xs">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-20 flex-col gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  <span className="text-xs">Upload File</span>
                </Button>
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-foreground">
                    Documents ({documents.length})
                  </p>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-secondary"
                    >
                      {doc.preview ? (
                        <img
                          src={doc.preview}
                          alt={doc.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <span className="flex-1 text-sm text-foreground truncate">
                        {doc.name}
                      </span>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-1 rounded-full hover:bg-destructive/10"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        ) : (
                          <X className="w-4 h-4 text-destructive" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleDocumentsConfirm}
                disabled={documents.length === 0}
                className="w-full"
              >
                Confirm Documents ({documents.length})
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Coin Reward */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning">
          <span className="text-3xl">💰</span>
          <div>
            <p className="font-medium text-foreground">+150 Coins Earned!</p>
            <p className="text-sm text-muted-foreground">
              Quick sale bonus + SLA achievement
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/inspection/consent", { state: { vehicle, winningBid } })}
            className="w-full h-14 text-base font-medium"
            size="lg"
          >
            Proceed to Customer Approval
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuctionResult;
