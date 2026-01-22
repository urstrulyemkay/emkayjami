import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MockLogin from "./pages/MockLogin";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import NewInspection from "./pages/NewInspection";
import ImageCapture from "./pages/ImageCapture";
import VideoCapture from "./pages/VideoCapture";
import VoiceRecording from "./pages/VoiceRecording";
import InspectionSummary from "./pages/InspectionSummary";
import TrustDashboard from "./pages/TrustDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
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
        path="/trust"
        element={
          <ProtectedRoute>
            <TrustDashboard />
          </ProtectedRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
