import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import URLScanner from "@/pages/URLScanner";
import ThreatIntel from "@/pages/ThreatIntel";
import AIDetection from "@/pages/AIDetection";
import AIAssistant from "@/pages/AIAssistant";
import Analytics from "@/pages/Analytics";
import SecureLogs from "@/pages/SecureLogs";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/scan" element={<AppLayout><URLScanner /></AppLayout>} />
          <Route path="/threats" element={<AppLayout><ThreatIntel /></AppLayout>} />
          <Route path="/detection" element={<AppLayout><AIDetection /></AppLayout>} />
          <Route path="/assistant" element={<AppLayout><AIAssistant /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/logs" element={<AppLayout><SecureLogs /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
