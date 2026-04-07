import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BrokerAuthProvider } from "@/contexts/BrokerAuthContext";
import MockLogin from "./pages/MockLogin";
import Auth from "./pages/Auth";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import NewInspection from "./pages/NewInspection";
import InspectionStepper from "./pages/InspectionStepper";
import ImageCapture from "./pages/ImageCapture";
import VideoCapture from "./pages/VideoCapture";
import VoiceRecording from "./pages/VoiceRecording";
import InspectionSummary from "./pages/InspectionSummary";
import ConsentFlow from "./pages/ConsentFlow";
import TrustDashboard from "./pages/TrustDashboard";
import AuctionSetup from "./pages/AuctionSetup";
import AuctionLive from "./pages/AuctionLive";
import AuctionResult from "./pages/AuctionResult";
import AuctionsList from "./pages/AuctionsList";
import DeltaInspection from "./pages/DeltaInspection";
import DeltaInspectionStepper from "./pages/DeltaInspectionStepper";
import DeltaComparison from "./pages/DeltaComparison";
import DeltaConsentFlow from "./pages/DeltaConsentFlow";
import NotFound from "./pages/NotFound";

// Broker pages
import BrokerLogin from "./pages/broker/BrokerLogin";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerAuctionDetail from "./pages/broker/BrokerAuctionDetail";
import BrokerBids from "./pages/broker/BrokerBids";
import BrokerWallet from "./pages/broker/BrokerWallet";
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerHelp from "./pages/broker/BrokerHelp";
import BrokerWonVehicleDetail from "./pages/broker/BrokerWonVehicleDetail";

// Ops pages
import OpsLogin from "./pages/ops/OpsLogin";
import OpsDashboard from "./pages/ops/OpsDashboard";
import OpsOemDirectory from "./pages/ops/OpsOemDirectory";
import OpsOemDetail from "./pages/ops/OpsOemDetail";
import OpsOemNew from "./pages/ops/OpsOemNew";
import OpsBrokerDirectory from "./pages/ops/OpsBrokerDirectory";
import OpsBrokerDetail from "./pages/ops/OpsBrokerDetail";
import OpsKycReview from "./pages/ops/OpsKycReview";
import OpsOnboardingPipeline from "./pages/ops/OpsOnboardingPipeline";
import OpsLiveAuctions from "./pages/ops/OpsLiveAuctions";
import OpsDealTracker from "./pages/ops/OpsDealTracker";
import OpsDeltaReview from "./pages/ops/OpsDeltaReview";
import OpsCascadeMonitor from "./pages/ops/OpsCascadeMonitor";
import OpsPickupQueue from "./pages/ops/OpsPickupQueue";
import OpsRunnerDashboard from "./pages/ops/OpsRunnerDashboard";
import OpsSettlements from "./pages/ops/OpsSettlements";
import OpsPaymentExceptions from "./pages/ops/OpsPaymentExceptions";
import OpsServiceRequests from "./pages/ops/OpsServiceRequests";
import OpsRtoTracking from "./pages/ops/OpsRtoTracking";

const queryClient = new QueryClient();

// Protected route wrapper for executives
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App routes component (needs to be inside AuthProvider)
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <MockLogin />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === "executive" ? (
              <ExecutiveDashboard />
            ) : (
              <Navigate to="/login" replace />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/new"
        element={
          <ProtectedRoute>
            <NewInspection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/stepper"
        element={
          <ProtectedRoute>
            <InspectionStepper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/capture"
        element={
          <ProtectedRoute>
            <ImageCapture />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/video"
        element={
          <ProtectedRoute>
            <VideoCapture />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/voice"
        element={
          <ProtectedRoute>
            <VoiceRecording />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/summary"
        element={
          <ProtectedRoute>
            <InspectionSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/consent"
        element={
          <ProtectedRoute>
            <ConsentFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trust"
        element={
          <ProtectedRoute>
            <TrustDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auction/setup"
        element={
          <ProtectedRoute>
            <AuctionSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auction/live"
        element={
          <ProtectedRoute>
            <AuctionLive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auction/result"
        element={
          <ProtectedRoute>
            <AuctionResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auctions"
        element={
          <ProtectedRoute>
            <AuctionsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/delta"
        element={
          <ProtectedRoute>
            <DeltaInspectionStepper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/delta-old"
        element={
          <ProtectedRoute>
            <DeltaInspection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/delta-comparison"
        element={
          <ProtectedRoute>
            <DeltaComparison />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inspection/delta-consent"
        element={
          <ProtectedRoute>
            <DeltaConsentFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={<Auth />}
      />
      
      {/* Broker Routes - wrapped in BrokerAuthProvider */}
      <Route path="/broker/login" element={<BrokerLogin />} />
      <Route path="/broker" element={<BrokerDashboard />} />
      <Route path="/broker/auction/:slug" element={<BrokerAuctionDetail />} />
      <Route path="/broker/bids" element={<BrokerBids />} />
      <Route path="/broker/wallet" element={<BrokerWallet />} />
      <Route path="/broker/profile" element={<BrokerProfile />} />
      <Route path="/broker/help" element={<BrokerHelp />} />
      <Route path="/broker/won/:id" element={<BrokerWonVehicleDetail />} />

      {/* Ops Routes */}
      <Route path="/ops/login" element={<OpsLogin />} />
      <Route path="/ops/dashboard" element={<OpsDashboard />} />
      <Route path="/ops/entities/oem" element={<OpsOemDirectory />} />
      <Route path="/ops/entities/oem/new" element={<OpsOemNew />} />
      <Route path="/ops/entities/oem/:id" element={<OpsOemDetail />} />
      <Route path="/ops/entities/brokers" element={<OpsBrokerDirectory />} />
      <Route path="/ops/entities/brokers/:id" element={<OpsBrokerDetail />} />
      <Route path="/ops/entities/kyc" element={<OpsKycReview />} />
      <Route path="/ops/entities/onboarding" element={<OpsOnboardingPipeline />} />
      <Route path="/ops/auctions/live" element={<OpsLiveAuctions />} />
      <Route path="/ops/auctions/deals" element={<OpsDealTracker />} />
      <Route path="/ops/auctions/delta" element={<OpsDeltaReview />} />
      <Route path="/ops/auctions/cascade" element={<OpsCascadeMonitor />} />
      <Route path="/ops/logistics/pickups" element={<OpsPickupQueue />} />
      <Route path="/ops/logistics/runners" element={<OpsRunnerDashboard />} />
      <Route path="/ops/finance/settlements" element={<OpsSettlements />} />
      <Route path="/ops/finance/exceptions" element={<OpsPaymentExceptions />} />
      <Route path="/ops/docs/services" element={<OpsServiceRequests />} />
      <Route path="/ops/docs/rto" element={<OpsRtoTracking />} />
      <Route path="/ops/*" element={<OpsDashboard />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrokerAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </BrokerAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
