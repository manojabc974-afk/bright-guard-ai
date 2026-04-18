import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Clock, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  { id: "m1", type: "phishing", source: "URL Scan", description: "Fake login page detected: secure-bank-login.xyz", timestamp: "2 min ago", score: 95 },
  { id: "m2", type: "safe", source: "Notification", description: "Google Play Store update verified", timestamp: "15 min ago", score: 5 },
  { id: "m3", type: "phishing", source: "SMS Scanner", description: "OTP phishing attempt: verify-account.net", timestamp: "35 min ago", score: 91 },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ThreatFeed() {
  const { user } = useAuth();
  const [installs, setInstalls] = useState<ThreatItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("app_installs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setInstalls(
        (data ?? []).map((d) => ({
          id: d.id,
          type:
            d.result === "unsafe"
              ? "malware"
              : d.result === "warning"
              ? "suspicious"
              : "safe",
          source: "App Monitor",
          description: `${d.app_name} (${d.reason ?? "—"})`,
          timestamp: timeAgo(d.created_at),
          score: d.risk_score,
        }))
      );
    };
    load();
    const ch = supabase
      .channel("threatfeed_installs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_installs", filter: `user_id=eq.${user.id}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const items = [...installs, ...mockThreats].slice(0, 6);

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
        {items.map((threat, i) => {
          const config = threatConfig[threat.type];
          const isInstall = threat.source === "App Monitor";
          return (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary transition-colors"
            >
              <div className={`rounded-md p-1.5 ${config.bg}`}>
                {isInstall ? (
                  <Smartphone className={`h-3.5 w-3.5 ${config.color}`} />
                ) : (
                  <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                )}
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
