import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  ArrowLeft, MapPin, Clock, Zap, Check, AlertTriangle,
  Play, Image as ImageIcon, Info, Heart,
  Share2, TrendingUp, Scale, Calendar, Target
} from "lucide-react";
import { useRealtimeBids } from "@/hooks/useRealtimeBids";
import LiveBidFeed from "@/components/broker/LiveBidFeed";
import { calculateEffectiveScore } from "@/data/brokerMockData";

interface AuctionData {
  id: string;
  auction_type: string;
  status: string;
  start_time: string;
  end_time: string;
  current_highest_bid: number | null;
  current_highest_commission: number | null;
  bid_count: number | null;
  minimum_bid_increment: number | null;
  geo_targeting_city: string | null;
  inspections: {
    id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number | null;
    odometer_reading: number | null;
    vehicle_color: string | null;
    condition_score: number | null;
  } | null;
}

const BrokerAuctionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { broker, isAuthenticated } = useBrokerAuth();
  const { toast } = useToast();

  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidSheetOpen, setBidSheetOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [commission, setCommission] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time bids hook
  const {
    currentHighestBid,
    currentHighestCommission,
    bidCount,
    bids,
    myBid,
    isWinning,
    placeBid,
    loading: bidsLoading,
  } = useRealtimeBids(id || "", broker?.id);

  // Fetch auction details
  useEffect(() => {
    const fetchAuction = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("auctions")
        .select(`
          id, auction_type, status, start_time, end_time,
          current_highest_bid, current_highest_commission, bid_count,
          minimum_bid_increment, geo_targeting_city,
          inspections (
            id, vehicle_make, vehicle_model, vehicle_year,
            odometer_reading, vehicle_color, condition_score
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching auction:", error);
        // Fall back to mock for demo if not found
        setLoading(false);
        return;
      }

      setAuction(data as unknown as AuctionData);
      setBidAmount((data.current_highest_bid || 0) + (data.minimum_bid_increment || 500));
      setLoading(false);
    };

    fetchAuction();
  }, [id]);

  // Update timer
  useEffect(() => {
    if (!auction || auction.auction_type === "one_click") return;

    const interval = setInterval(() => {
      const endTime = new Date(auction.end_time);
      const remaining = endTime.getTime() - Date.now();
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Update bid amount when highest bid changes
  useEffect(() => {
    if (currentHighestBid > 0 && !myBid) {
      setBidAmount(currentHighestBid + 500);
    }
  }, [currentHighestBid, myBid]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getGradeFromScore = (score: number | null): string => {
    if (!score) return "C";
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "E";
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

  const getAuctionTypeIcon = (type: string) => {
    switch (type) {
      case "quick": return <Zap className="w-3 h-3" />;
      case "flexible": return <Scale className="w-3 h-3" />;
      case "extended": return <Calendar className="w-3 h-3" />;
      case "one_click": return <Target className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getAuctionTypeName = (type: string) => {
    const names: Record<string, string> = {
      quick: "Quick Auction",
      flexible: "Flexible Auction",
      extended: "Extended Auction",
      one_click: "One-Click Buy",
    };
    return names[type] || "Auction";
  };

  // Calculate effective score and ranking
  const effectiveScore = calculateEffectiveScore(bidAmount, commission);
  const currentHighestEffective = calculateEffectiveScore(currentHighestBid, currentHighestCommission);
  const bidRanking = effectiveScore > currentHighestEffective ? "HIGH" : 
                     effectiveScore > currentHighestEffective * 0.95 ? "MEDIUM" : "LOW";

  const handlePlaceBid = () => {
    if (bidAmount <= currentHighestBid) {
      toast({
        title: "Invalid bid",
        description: `Bid must be higher than ₹${currentHighestBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmBid = async () => {
    setIsSubmitting(true);
    try {
      await placeBid(bidAmount, commission);
      setConfirmDialogOpen(false);
      setBidSheetOpen(false);
      toast({
        title: "✓ Bid placed successfully!",
        description: `₹${bidAmount.toLocaleString()} + ₹${commission.toLocaleString()} commission`,
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Failed to place bid",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Auction not found</p>
        <Button onClick={() => navigate("/broker")}>Back to Dashboard</Button>
      </div>
    );
  }

  const grade = getGradeFromScore(auction.inspections?.condition_score);
  const minBidIncrement = auction.minimum_bid_increment || 500;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold">
              {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {auction.geo_targeting_city || "Bangalore"}
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
          src="/placeholder.svg"
          alt={auction.inspections?.vehicle_model || "Vehicle"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Badge className="bg-black/70 text-white gap-1">
            <ImageIcon className="w-3 h-3" />
            4
          </Badge>
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">
              {auction.inspections?.vehicle_make} {auction.inspections?.vehicle_model}
            </h2>
            <p className="text-muted-foreground">
              {auction.inspections?.vehicle_year}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {(auction.inspections?.odometer_reading || 0).toLocaleString()} km
            </p>
          </div>
          <div className={`${getGradeColor(grade)} text-white px-4 py-2 rounded-lg text-center`}>
            <span className="text-2xl font-bold">{grade}</span>
          </div>
        </div>

        {/* My Bid Status */}
        {myBid && (
          <div className={`rounded-xl p-4 mb-4 ${isWinning ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Your Bid</p>
                <p className="text-xl font-bold">
                  ₹{myBid.bid_amount.toLocaleString()}
                  {myBid.commission_amount > 0 && (
                    <span className="text-amber-600 text-sm"> + ₹{myBid.commission_amount.toLocaleString()}</span>
                  )}
                </p>
              </div>
              <Badge className={isWinning ? "bg-green-500 text-white" : "bg-amber-500 text-white"}>
                {isWinning ? "WINNING" : "OUTBID"}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Live Bid Feed */}
      <div className="p-4 border-b">
        <LiveBidFeed
          bids={bids}
          currentHighestBid={currentHighestBid}
          bidCount={bidCount}
          myBrokerId={broker?.id}
        />
      </div>

      {/* Auction Status */}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Auction Details</h3>
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="gap-1">
              {getAuctionTypeIcon(auction.auction_type)}
              {getAuctionTypeName(auction.auction_type)}
            </Badge>
            {auction.auction_type !== "one_click" && (
              <span className={`text-lg font-mono font-bold ${timeLeft < 5 * 60 * 1000 ? "text-red-500" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Highest</p>
              <p className="text-2xl font-bold text-primary">
                ₹{currentHighestBid.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bids</p>
              <p className="text-lg font-semibold">{bidCount} brokers</p>
            </div>
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
              Within 6 months of purchase. Failure: -500 coins, -10 trust score
            </p>
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
          {myBid ? "Increase Bid" : "Place Bid"}
        </Button>
      </div>

      {/* Bid Sheet */}
      <Sheet open={bidSheetOpen} onOpenChange={setBidSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{myBid ? "Increase Your Bid" : "Place Your Bid"}</SheetTitle>
            <SheetDescription>
              Current highest: ₹{currentHighestBid.toLocaleString()} • Min: ₹{(currentHighestBid + minBidIncrement).toLocaleString()}
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
                Must be at least ₹{(currentHighestBid + minBidIncrement).toLocaleString()}
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
                <span className="font-bold text-lg">₹{(bidAmount + commission).toLocaleString()}</span>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing..." : `Place Bid ₹${bidAmount.toLocaleString()}`}
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
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total</span>
              <span>₹{(bidAmount + commission).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <p className="text-sm text-muted-foreground">
                ⚠️ This bid cannot be edited, but you can place higher bids later.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600"
              onClick={confirmBid}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming..." : "Confirm Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokerAuctionDetail;
