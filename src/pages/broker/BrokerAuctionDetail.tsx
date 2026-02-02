import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Star, MapPin, Clock, Zap, Check, AlertTriangle,
  ChevronRight, Play, Image as ImageIcon, Info, Heart,
  Bell, Share2, TrendingUp, Scale
} from "lucide-react";
import {
  LIVE_AUCTIONS,
  calculateEffectiveScore,
  formatTimeRemaining,
  getAuctionTypeConfig,
  getGradeColor,
} from "@/data/brokerMockData";

// Mock auction detail data
const MOCK_AUCTION_DETAIL = {
  id: "auction-1",
  vehicle: {
    make: "TVS",
    model: "Apache RTR 160",
    variant: "4V BS6",
    year: 2023,
    kms: 12450,
    city: "Bangalore",
    grade: "B",
    gradeDescription: "Good condition, minor wear",
    thumbnail: "/placeholder.svg",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    videoUrl: null,
  },
  auctionType: "quick",
  timeRemaining: 18 * 60 * 1000,
  endTime: new Date(Date.now() + 18 * 60 * 1000),
  currentHighestBid: 36500,
  currentHighestCommission: 800, // Added for accurate effective score calculation
  bidCount: 4,
  minimumBidIncrement: 500,
  documents: { rc: true, insurance: true, puc: true, challans: 0, loan: false },
  oemTrust: "high",
  inspection: {
    highlights: [
      { type: "positive", text: "Single owner, well-maintained" },
      { type: "positive", text: "No major accidents" },
      { type: "negative", text: "Brake pads 60% worn, needs replacement soon" },
      { type: "negative", text: "Minor rust on frame" },
    ],
    sections: {
      engine: {
        title: "Engine & Powertrain",
        items: [
          { label: "Engine starts", status: "good", note: "Easy start" },
          { label: "Oil condition", status: "good", note: "Clean" },
          { label: "Coolant level", status: "warning", note: "Low (needs top-up)" },
          { label: "Air filter", status: "good", note: "Clean" },
        ],
        notes: "Engine starts on first kick. Oil is clean but level slightly low.",
      },
      body: {
        title: "Body & Paint",
        items: [
          { label: "Paint condition", status: "warning", note: "Minor scratches" },
          { label: "Rust spots", status: "warning", note: "Minor rust on frame" },
          { label: "Dents/damage", status: "good", note: "No major dents" },
        ],
        notes: "Body solid. Few cosmetic scratches typical for 2-year bike.",
      },
      electrical: {
        title: "Electronics & Electrics",
        items: [
          { label: "Headlight", status: "good", note: "Working" },
          { label: "Tail light", status: "good", note: "Working" },
          { label: "Battery", status: "good", note: "Strong" },
        ],
        notes: "All electrical components tested and working.",
      },
      suspension: {
        title: "Suspension & Handling",
        items: [
          { label: "Front suspension", status: "good", note: "Smooth" },
          { label: "Rear suspension", status: "good", note: "Smooth" },
          { label: "Brakes", status: "warning", note: "Pads 60% worn" },
        ],
        notes: "Braking responsive but pads nearing end of life.",
      },
      tyres: {
        title: "Tyres & Wheels",
        items: [
          { label: "Front tyre tread", status: "warning", note: "3mm (replace soon)" },
          { label: "Rear tyre tread", status: "good", note: "5mm (good)" },
          { label: "Rim condition", status: "good", note: "No damage" },
        ],
        notes: "Rear tyre good. Front tyre tread low.",
      },
    },
  },
  rcTransferDeadline: "Within 6 months of purchase",
  penaltiesInfo: "Failure to transfer on time: -500 coins, -10 trust score",
};

const BrokerAuctionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { broker, isAuthenticated } = useBrokerAuth();
  const { toast } = useToast();

  const [timeLeft, setTimeLeft] = useState(MOCK_AUCTION_DETAIL.timeRemaining);
  const [bidSheetOpen, setBidSheetOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(
    MOCK_AUCTION_DETAIL.currentHighestBid + MOCK_AUCTION_DETAIL.minimumBidIncrement
  );
  const [commission, setCommission] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    if (MOCK_AUCTION_DETAIL.auctionType === "one_click") return;

    const interval = setInterval(() => {
      const remaining = MOCK_AUCTION_DETAIL.endTime.getTime() - Date.now();
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-500",
    };
    return colors[grade] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    if (status === "good") return <Check className="w-4 h-4 text-green-500" />;
    if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  // Use consistent effective score calculation from centralized data
  const effectiveScore = calculateEffectiveScore(bidAmount, commission);
  const currentHighestEffective = calculateEffectiveScore(
    MOCK_AUCTION_DETAIL.currentHighestBid, 
    MOCK_AUCTION_DETAIL.currentHighestCommission || 0
  );
  const bidRanking = effectiveScore > currentHighestEffective ? "HIGH" : effectiveScore > currentHighestEffective * 0.95 ? "MEDIUM" : "LOW";

  const handlePlaceBid = () => {
    if (bidAmount <= MOCK_AUCTION_DETAIL.currentHighestBid) {
      toast({
        title: "Invalid bid",
        description: `Bid must be higher than ₹${MOCK_AUCTION_DETAIL.currentHighestBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmBid = () => {
    setConfirmDialogOpen(false);
    setBidSheetOpen(false);
    toast({
      title: "✓ Bid placed!",
      description: `₹${bidAmount.toLocaleString()} + ₹${commission.toLocaleString()} commission`,
    });
  };

  const auction = MOCK_AUCTION_DETAIL;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">{auction.vehicle.make} {auction.vehicle.model}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {auction.vehicle.city}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsWatchlisted(!isWatchlisted)}
          >
            <Heart className={`w-5 h-5 ${isWatchlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-video bg-muted">
        <img
          src={auction.vehicle.thumbnail}
          alt={auction.vehicle.model}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Badge className="bg-black/70 text-white gap-1">
            <ImageIcon className="w-3 h-3" />
            {auction.vehicle.images.length}
          </Badge>
          {auction.vehicle.videoUrl && (
            <Badge className="bg-black/70 text-white gap-1">
              <Play className="w-3 h-3" />
              Video
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">
              {auction.vehicle.make} {auction.vehicle.model}
            </h2>
            <p className="text-muted-foreground">
              {auction.vehicle.variant} • {auction.vehicle.year}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {auction.vehicle.kms.toLocaleString()} km
            </p>
          </div>
          <div className={`${getGradeColor(auction.vehicle.grade)} text-white px-4 py-2 rounded-lg text-center`}>
            <span className="text-2xl font-bold">{auction.vehicle.grade}</span>
            <p className="text-xs">{auction.vehicle.gradeDescription}</p>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="space-y-2 mt-4">
          {auction.inspection.highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-2">
              {highlight.type === "positive" ? (
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <span className="text-sm">{highlight.text}</span>
            </div>
          ))}
        </div>

        {/* OEM Trust Badge */}
        {auction.oemTrust === "high" && (
          <Badge className="mt-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            ✓ High-trust OEM
          </Badge>
        )}
      </div>

      {/* Inspection Details */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Inspection Report</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {Object.entries(auction.inspection.sections).map(([key, section]) => (
            <AccordionItem key={key} value={key} className="border rounded-lg px-3">
              <AccordionTrigger className="text-sm font-medium py-3">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span>{item.note}</span>
                      </div>
                    </div>
                  ))}
                  {section.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{section.notes}"
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Documents Status */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Documents</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">RC Present</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">Insurance Valid</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">PUC Valid</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">Loan Clear</span>
          </div>
        </div>
      </div>

      {/* RC Transfer Warning */}
      <div className="p-4 border-b bg-amber-50 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              RC Transfer Obligation
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {auction.rcTransferDeadline}. {auction.penaltiesInfo}
            </p>
          </div>
        </div>
      </div>

      {/* Auction Status */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Auction Details</h3>
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Quick Auction
            </Badge>
            <span className={`text-lg font-mono font-bold ${timeLeft < 5 * 60 * 1000 ? "text-red-500" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Highest</p>
              <p className="text-2xl font-bold text-primary">
                ₹{auction.currentHighestBid.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bids</p>
              <p className="text-lg font-semibold">{auction.bidCount} brokers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-20">
        <Button
          className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          onClick={() => setBidSheetOpen(true)}
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Place Bid
        </Button>
      </div>

      {/* Bid Sheet */}
      <Sheet open={bidSheetOpen} onOpenChange={setBidSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle>Place Your Bid</SheetTitle>
            <SheetDescription>
              Current highest: ₹{auction.currentHighestBid.toLocaleString()} • Min: ₹{(auction.currentHighestBid + auction.minimumBidIncrement).toLocaleString()}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Bid Amount */}
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your bid amount (₹) *</Label>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="h-12 text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least ₹{(auction.currentHighestBid + auction.minimumBidIncrement).toLocaleString()}
              </p>
            </div>

            {/* Commission Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Commission to sales executive (₹)</Label>
                <div className="flex items-center gap-1">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Optional</span>
                </div>
              </div>
              <Slider
                value={[commission]}
                onValueChange={(values) => setCommission(values[0])}
                max={2000}
                step={100}
                className="py-4"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">₹0</span>
                <span className="text-lg font-semibold text-amber-600">
                  ₹{commission.toLocaleString()}
                </span>
                <span className="text-muted-foreground">₹2,000</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher commission can improve your bid ranking with OEM sales team.
              </p>
            </div>

            {/* Bid Summary */}
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span>Vehicle bid</span>
                <span className="font-semibold">₹{bidAmount.toLocaleString()}</span>
              </div>
              {commission > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Commission to exec</span>
                  <span className="font-semibold">₹{commission.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-medium">Total to pay DriveX</span>
                <span className="font-bold text-lg">₹{bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Bid ranking</span>
                <Badge className={
                  bidRanking === "HIGH" ? "bg-green-500" :
                  bidRanking === "MEDIUM" ? "bg-amber-500" : "bg-red-500"
                }>
                  {bidRanking}
                </Badge>
              </div>
            </div>

            {/* Place Bid Button */}
            <Button
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              onClick={handlePlaceBid}
            >
              Place Bid ₹{bidAmount.toLocaleString()}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Bid</DialogTitle>
            <DialogDescription>
              Please review your bid details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex justify-between">
              <span>Vehicle bid</span>
              <span className="font-semibold">₹{bidAmount.toLocaleString()}</span>
            </div>
            {commission > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Commission</span>
                <span className="font-semibold">₹{commission.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <p className="text-sm text-muted-foreground">
                ⚠️ This bid cannot be edited, but you can place higher bids later.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={confirmBid}
            >
              Confirm Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerAuctionDetail;
