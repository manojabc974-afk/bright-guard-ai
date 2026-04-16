import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

interface ThreatItem {
  id: string;
  type: "phishing" | "malware" | "safe" | "suspicious";
  source: string;
  description: string;
  timestamp: string;
  score: number;
}

const threatConfig = {
  phishing: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "PHISHING" },
  malware: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "MALWARE" },
  suspicious: { icon: AlertTriangle, color: "text-threat", bg: "bg-threat/10", label: "SUSPICIOUS" },
  safe: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", label: "SAFE" },
};

const mockThreats: ThreatItem[] = [
  { id: "1", type: "phishing", source: "URL Scan", description: "Fake login page detected: secure-bank-login.xyz", timestamp: "2 min ago", score: 95 },
  { id: "2", type: "malware", source: "App Monitor", description: "Suspicious APK: flashlight_pro_v3.apk", timestamp: "8 min ago", score: 78 },
  { id: "3", type: "safe", source: "Notification", description: "Google Play Store update verified", timestamp: "15 min ago", score: 5 },
  { id: "4", type: "suspicious", source: "QR Scanner", description: "Shortened URL redirects to unknown domain", timestamp: "22 min ago", score: 62 },
  { id: "5", type: "phishing", source: "SMS Scanner", description: "OTP phishing attempt: verify-account.net", timestamp: "35 min ago", score: 91 },
];

export default function ThreatFeed() {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm text-foreground tracking-wider">LIVE THREAT FEED</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Real-time
        </div>
      </div>
      <div className="space-y-3">
        {mockThreats.map((threat, i) => {
          const config = threatConfig[threat.type];
          return (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary transition-colors"
            >
              <div className={`rounded-md p-1.5 ${config.bg}`}>
                <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-display font-bold ${config.color} tracking-wider`}>{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">via {threat.source}</span>
                </div>
                <p className="text-xs text-foreground/80 truncate">{threat.description}</p>
                <span className="text-[10px] text-muted-foreground">{threat.timestamp}</span>
              </div>
              <div className={`text-xs font-display font-bold ${config.color}`}>{threat.score}%</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
