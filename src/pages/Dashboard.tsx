import { Shield, Scan, AlertTriangle, CheckCircle, Zap, Cpu } from "lucide-react";
import SecurityScore from "@/components/dashboard/SecurityScore";
import StatCard from "@/components/dashboard/StatCard";
import ThreatFeed from "@/components/dashboard/ThreatFeed";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { motion } from "framer-motion";
import { useScanStats } from "@/hooks/useScanStats";

export default function Dashboard() {
  const { stats, loading } = useScanStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">COMMAND CENTER</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time threat monitoring & AI-powered protection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="URLS SCANNED" value={loading ? "..." : stats.totalScans.toLocaleString()} icon={Scan} variant="accent" subtitle="Your scan history" />
        <StatCard title="THREATS DETECTED" value={loading ? "..." : stats.threats.toString()} icon={AlertTriangle} variant="destructive" subtitle="Phishing & suspicious" />
        <StatCard title="SAFE URLS" value={loading ? "..." : stats.safeApps.toString()} icon={CheckCircle} variant="success" subtitle={stats.totalScans > 0 ? `${Math.round((stats.safeApps / stats.totalScans) * 100)}% safe rate` : "No scans yet"} />
        <StatCard title="AI MODELS ACTIVE" value="4" icon={Cpu} variant="accent" subtitle="BERT · LSTM · FL · ZD" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SecurityScore score={stats.securityScore} />
          
          <motion.div 
            className="glass rounded-xl p-5 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display text-sm text-foreground tracking-wider mb-3">AI CAPABILITIES</h3>
            <div className="space-y-2.5">
              {[
                { label: "Federated Learning", status: "Active", color: "text-primary" },
                { label: "Zero-Day Detection", status: "Active", color: "text-primary" },
                { label: "Deep Learning (BERT)", status: "Active", color: "text-primary" },
                { label: "Offline Detection", status: "Ready", color: "text-accent" },
                { label: "Behavior Analysis", status: "Active", color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full bg-current ${item.color} animate-pulse-glow`} />
                    <span className={`font-display ${item.color}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <ActivityChart />
          <ThreatFeed />
        </div>
      </div>

      {/* Protection systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Auto Prevention", desc: "Blocking threats automatically", active: true },
          { icon: Zap, title: "Real-Time Alerts", desc: "Instant notifications enabled", active: true },
          { icon: Cpu, title: "Blockchain Logs", desc: "Tamper-proof audit trail", active: true },
        ].map((sys) => (
          <motion.div
            key={sys.title}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-4 flex items-center gap-4"
          >
            <div className="rounded-lg bg-primary/10 p-2.5">
              <sys.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{sys.title}</p>
              <p className="text-xs text-muted-foreground">{sys.desc}</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
