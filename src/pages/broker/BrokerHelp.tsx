import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrokerAuth } from "@/contexts/BrokerAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ArrowLeft, HelpCircle, MessageSquare, Phone, Mail,
  FileText, AlertTriangle, Clock, CheckCircle, Send,
  ChevronRight, Search, Shield, Coins, Gavel, Car
} from "lucide-react";
import BrokerBottomNav from "@/components/broker/BrokerBottomNav";
import { useToast } from "@/hooks/use-toast";
import { useSoundNotifications } from "@/hooks/useSoundNotifications";
// Grievance categories
const GRIEVANCE_CATEGORIES = [
  {
    id: "auction_dispute",
    label: "Auction Dispute",
    icon: Gavel,
    description: "Issues with auction results, bid rejection, or unfair allocation",
    priority: "high",
  },
  {
    id: "vehicle_mismatch",
    label: "Vehicle Mismatch",
    icon: Car,
    description: "Vehicle condition differs from inspection report",
    priority: "high",
  },
  {
    id: "payment_issue",
    label: "Payment / Wallet Issue",
    icon: Coins,
    description: "Coin balance, refunds, or transaction problems",
    priority: "medium",
  },
  {
    id: "strike_appeal",
    label: "Strike Appeal",
    icon: AlertTriangle,
    description: "Appeal a strike or penalty on your account",
    priority: "high",
  },
  {
    id: "trust_score",
    label: "Trust Score Query",
    icon: Shield,
    description: "Questions about trust score calculation or changes",
    priority: "low",
  },
  {
    id: "technical",
    label: "Technical Issue",
    icon: HelpCircle,
    description: "App bugs, login issues, or feature problems",
    priority: "medium",
  },
  {
    id: "other",
    label: "Other",
    icon: MessageSquare,
    description: "General questions or feedback",
    priority: "low",
  },
];

// FAQ items
const FAQ_ITEMS = [
  {
    question: "How is my trust score calculated?",
    answer: "Your trust score is based on several factors: RC transfer compliance (40%), Bid commitment (30%), Payment timeliness (20%), and Platform behavior (10%). Completing transactions on time and maintaining good standing helps improve your score.",
  },
  {
    question: "What happens if I win an auction but can't complete the purchase?",
    answer: "Failing to complete a won auction results in a strike and coin penalty. If you have a genuine emergency, contact support immediately before the payment deadline. We review cases individually and may waive penalties for valid reasons.",
  },
  {
    question: "How do I transfer RC within the deadline?",
    answer: "You have 6 months from purchase to complete RC transfer. Upload transfer proof in the app. Late transfers result in -500 coins and -10 trust score. Extensions can be requested through the Help section for valid reasons.",
  },
  {
    question: "Why was my bid rejected?",
    answer: "Bids may be rejected if: insufficient coin balance, account has 3+ strikes, trust score below minimum for auction type, or technical connectivity issues. Check your account status and try again.",
  },
  {
    question: "How do I appeal a strike?",
    answer: "Go to Profile > Strikes and tap 'Appeal' on the relevant strike. Provide evidence and explanation. Appeals are reviewed within 48 hours. Successful appeals restore coins and trust score.",
  },
  {
    question: "When will I receive my coins refund?",
    answer: "Coin refunds for cancelled auctions or successful appeals are processed within 24-48 hours. Check your Wallet > Transactions for status. Contact support if not received within 72 hours.",
  },
  {
    question: "How do effective scores work in bidding?",
    answer: "Your effective score = 85% bid amount + 15% commission. Higher commission improves your ranking. This ensures fair competition while rewarding brokers who offer better value.",
  },
  {
    question: "What are the different auction types?",
    answer: "Quick (15-60 min): Fast-paced bidding. Flexible (30 min): Standard format. Extended (days): Longer consideration. One-Click: Instant allocation at fixed price. Each has different coin requirements.",
  },
];

const BrokerHelp = () => {
  const navigate = useNavigate();
  const { broker } = useBrokerAuth();
  const { toast } = useToast();
  const { playSound } = useSoundNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSheetOpen, setTicketSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    category: "",
    subject: "",
    description: "",
    relatedAuctionId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter FAQ based on search
  const filteredFAQ = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenTicket = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTicketForm((prev) => ({ ...prev, category: categoryId }));
    setTicketSheetOpen(true);
  };

  const handleSubmitTicket = async () => {
    if (!ticketForm.category || !ticketForm.subject || !ticketForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      playSound('error');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate ticket submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been created. We'll respond within 24-48 hours.",
    });
    playSound('success');
    
    setTicketSheetOpen(false);
    setTicketForm({ category: "", subject: "", description: "", relatedAuctionId: "" });
    setIsSubmitting(false);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-destructive/10 text-destructive border-0">Priority</Badge>;
      case "medium":
        return <Badge variant="secondary">Standard</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="broker-header text-white">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => navigate("/broker")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Help & Support</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Quick Contact */}
      <div className="px-4 -mt-3">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Need immediate help?</p>
              <p className="font-semibold text-foreground">Call our support team</p>
            </div>
            <Button className="gap-2 rounded-xl">
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          </div>
        </div>
      </div>

      {/* Grievance Categories */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Report an Issue</h2>
        <div className="grid grid-cols-2 gap-3">
          {GRIEVANCE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="broker-card p-4 text-left"
                onClick={() => handleOpenTicket(category.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-xl bg-muted">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  {getPriorityBadge(category.priority)}
                </div>
                <h3 className="font-medium text-sm text-foreground">{category.label}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        
        {searchQuery && filteredFAQ.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No results found for "{searchQuery}"</p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQ.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Contact Options */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Other Ways to Reach Us</h2>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <Mail className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Email Support</p>
                <p className="text-sm text-muted-foreground">support@drivex.in</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <MessageSquare className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">WhatsApp</p>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">View My Tickets</p>
                <p className="text-sm text-muted-foreground">Track submitted issues</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* SLA Info */}
      <div className="px-4 mt-6 mb-4">
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Response Times</span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Priority issues: Within 4 hours</p>
            <p>• Standard issues: Within 24 hours</p>
            <p>• General queries: Within 48 hours</p>
          </div>
        </div>
      </div>

      {/* Ticket Submission Sheet */}
      <Sheet open={ticketSheetOpen} onOpenChange={setTicketSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Submit Support Ticket</SheetTitle>
            <SheetDescription>
              {selectedCategory && 
                GRIEVANCE_CATEGORIES.find((c) => c.id === selectedCategory)?.description
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto pb-20">
            {/* Category */}
            <div className="space-y-2">
              <Label>Issue Type</Label>
              <Select
                value={ticketForm.category}
                onValueChange={(value) => setTicketForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {GRIEVANCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                placeholder="Brief description of your issue"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            {/* Related Auction ID (optional) */}
            {(ticketForm.category === "auction_dispute" || 
              ticketForm.category === "vehicle_mismatch") && (
              <div className="space-y-2">
                <Label>Auction ID (if applicable)</Label>
                <Input
                  placeholder="e.g., AUC-2026-001234"
                  value={ticketForm.relatedAuctionId}
                  onChange={(e) => setTicketForm((prev) => ({ ...prev, relatedAuctionId: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Please provide details about your issue. Include any relevant dates, amounts, or reference numbers."
                value={ticketForm.description}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[120px] rounded-xl"
              />
            </div>

            {/* Info Box */}
            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">What happens next?</p>
                  <p className="text-muted-foreground mt-1">
                    Our team will review your ticket and respond within the SLA period. 
                    You'll receive updates via SMS and in-app notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-12 rounded-xl"
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BrokerBottomNav activeTab="help" />
    </div>
  );
};

export default BrokerHelp;
