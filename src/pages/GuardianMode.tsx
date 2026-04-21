import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Scan, MessageSquare, Smartphone, Globe, Bell, Zap, Lock } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import MatrixRain from "@/components/effects/MatrixRain";

interface Module {
  id: string;
  label: string;
  desc: string;
  icon: typeof Shield;
  enabled: boolean;
}

const defaultModules: Module[] = [
  { id: "url", label: "URL Scanner", desc: "Real-time phishing link detection", icon: Globe, enabled: true },
  { id: "sms", label: "SMS Protection", desc: "Detect scam OTP & fraud messages", icon: MessageSquare, enabled: true },
  { id: "app", label: "App Monitor", desc: "Auto-scan new app installations", icon: Smartphone, enabled: true },
  { id: "scan", label: "Content Scanner", desc: "Analyze suspicious text & images", icon: Scan, enabled: true },
  { id: "notif", label: "Instant Alerts", desc: "Push notifications for threats", icon: Bell, enabled: true },
  { id: "auto", label: "Auto Block", desc: "Automatically block detected threats", icon: Lock, enabled: false },
];

export default function GuardianMode() {
  const [modules, setModules] = useState(defaultModules);
  const allActive = modules.every((m) => m.enabled);
  const activeCount = modules.filter((m) => m.enabled).length;

  const toggle = (id: string) =>
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));

  return (
    <div className="space-y-6 relative">
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none overflow-hidden rounded-xl">
        <MatrixRain opacity={0.15} />
      </div>

      <PageTitle title="Sentinel Guardian Mode" subtitle="Full-time mobile protection — all shields in one view" icon={Shield} />

      {/* Shield status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass glass-sheen rounded-xl p-8 flex flex-col items-center text-center"
      >
        <motion.div
          animate={{
            boxShadow: allActive
              ? [
                  "0 0 0 0 hsl(160 100% 45% / 0)",
                  "0 0 40px 10px hsl(160 100% 45% / 0.4)",
                  "0 0 0 0 hsl(160 100% 45% / 0)",
                ]
              : [],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full p-6 bg-primary/10 mb-4"
        >
          <Shield className={`h-12 w-12 ${allActive ? "text-primary" : "text-warning"}`} />
        </motion.div>
        <h2 className={`font-display text-xl font-bold tracking-wider ${allActive ? "text-primary" : "text-warning"}`}>
          {allActive ? "FULL PROTECTION ACTIVE" : `${activeCount}/${modules.length} SHIELDS ACTIVE`}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {allActive
            ? "All protection modules are running — your device is fully guarded."
            : "Enable all modules for maximum protection."}
        </p>
      </motion.div>

      {/* Module toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.01 }}
            className="glass glass-sheen rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`rounded-lg p-2.5 ${mod.enabled ? "bg-primary/10" : "bg-secondary"}`}>
              <mod.icon className={`h-5 w-5 ${mod.enabled ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{mod.label}</p>
              <p className="text-xs text-muted-foreground">{mod.desc}</p>
            </div>
            <button
              onClick={() => toggle(mod.id)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${mod.enabled ? "bg-primary" : "bg-secondary"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${mod.enabled ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Live status */}
      <div className="glass glass-sheen rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm tracking-wider">LIVE STATUS</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Last threat scan", value: "Just now", ok: true },
            { label: "Threat database", value: "68.6M signatures", ok: true },
            { label: "AI models loaded", value: "4 active", ok: true },
            { label: "Federated learning", value: "156 nodes synced", ok: true },
            { label: "Protection uptime", value: "99.97%", ok: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${row.ok ? "bg-primary" : "bg-destructive"} animate-pulse-glow`} />
                <span className="text-foreground font-display">{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}