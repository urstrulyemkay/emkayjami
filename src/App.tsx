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
const queryClient = new QueryClient();

// Protected route wrapper for executives
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
      <Route path="/broker/auction/:id" element={<BrokerAuctionDetail />} />
      <Route path="/broker/bids" element={<BrokerBids />} />
      <Route path="/broker/wallet" element={<BrokerWallet />} />
      <Route path="/broker/profile" element={<BrokerProfile />} />
      <Route path="/broker/help" element={<BrokerHelp />} />
      <Route path="/broker/won/:id" element={<BrokerWonVehicleDetail />} />
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
