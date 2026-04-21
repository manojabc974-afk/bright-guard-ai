import { motion } from "framer-motion";
import { Shield, Bell, Cpu, Wifi, Lock, Eye, Volume2 } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import { Settings } from "lucide-react";

const settings = [
  { section: "Protection", items: [
    { label: "Real-Time Scanning", desc: "Continuously monitor for threats", enabled: true, icon: Shield },
    { label: "Auto-Block Threats", desc: "Automatically prevent detected attacks", enabled: true, icon: Lock },
    { label: "Background Service", desc: "Run protection service in background", enabled: true, icon: Cpu },
  ]},
  { section: "Notifications", items: [
    { label: "Phishing Alerts", desc: "Alert when phishing is detected", enabled: true, icon: Bell },
    { label: "App Install Alerts", desc: "Alert on new app installations", enabled: true, icon: Bell },
    { label: "Voice Alerts", desc: "Text-to-speech threat notifications", enabled: false, icon: Volume2 },
  ]},
  { section: "AI & Privacy", items: [
    { label: "Federated Learning", desc: "Contribute to distributed model training", enabled: true, icon: Cpu },
    { label: "Offline Detection", desc: "Enable local-only threat detection", enabled: true, icon: Wifi },
    { label: "Behavior Analysis", desc: "Analyze app behavior patterns", enabled: true, icon: Eye },
  ]},
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle title="Settings" subtitle="Configure security preferences and AI features" icon={Settings} />

      {settings.map((section) => (
        <div key={section.section} className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-sm tracking-wider">{section.section.toUpperCase()}</h3>
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="rounded-lg bg-secondary p-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${item.enabled ? "bg-primary" : "bg-secondary"}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${item.enabled ? "left-[22px]" : "left-0.5"}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
