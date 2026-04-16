import { motion } from "framer-motion";
import { Globe, TrendingUp, Shield, Database, Activity, Map } from "lucide-react";

const globalThreats = [
  { region: "North America", level: "Medium", attacks: 1243, trend: "+5%", type: "Phishing" },
  { region: "Europe", level: "High", attacks: 2891, trend: "+12%", type: "Ransomware" },
  { region: "Asia Pacific", level: "Critical", attacks: 5432, trend: "+23%", type: "Zero-Day" },
  { region: "South America", level: "Low", attacks: 567, trend: "-3%", type: "Malware" },
  { region: "Middle East", level: "High", attacks: 1876, trend: "+8%", type: "APT" },
];

const levelColors: Record<string, string> = {
  Critical: "text-destructive",
  High: "text-warning",
  Medium: "text-threat",
  Low: "text-primary",
};

const intelFeeds = [
  { name: "PhishTank API", status: "Connected", entries: "12.4M", lastSync: "2 min ago" },
  { name: "VirusTotal", status: "Connected", entries: "8.7M", lastSync: "5 min ago" },
  { name: "MITRE ATT&CK", status: "Connected", entries: "2.3K", lastSync: "1h ago" },
  { name: "AlienVault OTX", status: "Connected", entries: "45.2M", lastSync: "8 min ago" },
  { name: "Federated Nodes", status: "Syncing", entries: "156 nodes", lastSync: "Real-time" },
];

export default function ThreatIntel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">GLOBAL THREAT INTELLIGENCE</h1>
        <p className="text-sm text-muted-foreground mt-1">Federated threat data from worldwide nodes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-destructive/10 p-2.5"><Activity className="h-5 w-5 text-destructive" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">12,009</p>
            <p className="text-xs text-muted-foreground">Global threats today</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5"><Shield className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">11,847</p>
            <p className="text-xs text-muted-foreground">Threats blocked</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-accent/10 p-2.5"><Database className="h-5 w-5 text-accent" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">68.6M</p>
            <p className="text-xs text-muted-foreground">Threat signatures</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-4 w-4 text-accent" />
            <h3 className="font-display text-sm tracking-wider">REGIONAL THREAT MAP</h3>
          </div>
          <div className="space-y-3">
            {globalThreats.map((t, i) => (
              <motion.div
                key={t.region}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{t.region}</p>
                  <p className="text-xs text-muted-foreground">{t.type} dominant</p>
                </div>
                <span className={`text-xs font-display font-bold ${levelColors[t.level]}`}>{t.level.toUpperCase()}</span>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-foreground">{t.attacks.toLocaleString()}</p>
                  <p className={`text-[10px] ${t.trend.startsWith("+") ? "text-destructive" : "text-primary"}`}>{t.trend}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm tracking-wider">INTELLIGENCE FEEDS</h3>
          </div>
          <div className="space-y-3">
            {intelFeeds.map((feed, i) => (
              <motion.div
                key={feed.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3"
              >
                <div className={`h-2 w-2 rounded-full ${feed.status === "Connected" ? "bg-primary" : "bg-accent"} animate-pulse-glow`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{feed.name}</p>
                  <p className="text-xs text-muted-foreground">{feed.entries} entries</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-display ${feed.status === "Connected" ? "text-primary" : "text-accent"}`}>{feed.status.toUpperCase()}</span>
                  <p className="text-[10px] text-muted-foreground">{feed.lastSync}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
