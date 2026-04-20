import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, LayoutDashboard, Search, Globe, Brain, Users,
  MessageSquare, BarChart3, Lock, Settings, Menu, X, ChevronRight, ScanText, History, Smartphone, Database
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInstallMonitor } from "@/hooks/useInstallMonitor";
import ParticleField from "@/components/effects/ParticleField";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, anim: "nav-ico-dashboard" },
  { path: "/scan", label: "URL Scanner", icon: Search, anim: "nav-ico-url" },
  { path: "/content", label: "Content Scanner", icon: ScanText, anim: "nav-ico-content" },
  { path: "/threats", label: "Threat Intel", icon: Globe, anim: "nav-ico-threat" },
  { path: "/detection", label: "AI Detection", icon: Brain, anim: "nav-ico-detection" },
  { path: "/assistant", label: "AI Assistant", icon: MessageSquare, anim: "nav-ico-assistant" },
  { path: "/community", label: "Community", icon: Users, anim: "nav-ico-community" },
  { path: "/analytics", label: "Analytics", icon: BarChart3, anim: "nav-ico-analytics" },
  { path: "/history", label: "Scan History", icon: History, anim: "nav-ico-history" },
  { path: "/app-monitor", label: "App Monitor", icon: Smartphone, anim: "nav-ico-monitor" },
  { path: "/leak-check", label: "Leak Monitor", icon: Database, anim: "nav-ico-leak" },
  { path: "/logs", label: "Secure Logs", icon: Lock, anim: "nav-ico-logs" },
  { path: "/settings", label: "Settings", icon: Settings, anim: "nav-ico-settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  useInstallMonitor(); // global background listener for native package installs

  return (
    <div className="flex h-screen overflow-hidden bg-background cyber-grid relative">
      <ParticleField />
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:transition-none`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="relative">
            <Shield className="h-7 w-7 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse-glow" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-foreground tracking-wider">AEGIS</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest">AI SECURITY SYSTEM</p>
          </div>
          <button className="ml-auto lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary glow-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : ""}`} />
                <span className="font-body">{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-display text-primary tracking-wider">SYSTEM ACTIVE</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Real-time protection enabled</p>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-display tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card/50 backdrop-blur-sm px-4 lg:px-6">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-display">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            MONITORING
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
