import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import URLScanner from "@/pages/URLScanner";
import ContentScanner from "@/pages/ContentScanner";
import ThreatIntel from "@/pages/ThreatIntel";
import AIDetection from "@/pages/AIDetection";
import AIAssistant from "@/pages/AIAssistant";
import Analytics from "@/pages/Analytics";
import Community from "@/pages/Community";
import SecureLogs from "@/pages/SecureLogs";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background cyber-grid">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background cyber-grid">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
    <Route path="/scan" element={<ProtectedRoute><AppLayout><URLScanner /></AppLayout></ProtectedRoute>} />
    <Route path="/content" element={<ProtectedRoute><AppLayout><ContentScanner /></AppLayout></ProtectedRoute>} />
    <Route path="/threats" element={<ProtectedRoute><AppLayout><ThreatIntel /></AppLayout></ProtectedRoute>} />
    <Route path="/detection" element={<ProtectedRoute><AppLayout><AIDetection /></AppLayout></ProtectedRoute>} />
    <Route path="/assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
    <Route path="/community" element={<ProtectedRoute><AppLayout><Community /></AppLayout></ProtectedRoute>} />
    <Route path="/logs" element={<ProtectedRoute><AppLayout><SecureLogs /></AppLayout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
