import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, ShieldAlert, ShieldX, Trash2, PlayCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInstallMonitor } from "@/hooks/useInstallMonitor";
import { ensureWebNotificationPermission } from "@/lib/appSafety";
import { toast } from "sonner";

interface AppInstall {
  id: string;
  app_name: string;
  package_name: string;
  install_source: string;
  result: "safe" | "warning" | "unsafe";
  risk_score: number;
  reason: string | null;
  created_at: string;
}

const resultConfig = {
  safe: { icon: Shield, color: "text-primary", bg: "bg-primary/10", label: "SAFE" },
  warning: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10", label: "WARNING" },
  unsafe: { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10", label: "UNSAFE" },
};

export default function AppMonitor() {
  const { user } = useAuth();
  const { monitoring, simulateInstall } = useInstallMonitor();
  const [installs, setInstalls] = useState<AppInstall[]>([]);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState("");
  const [permsGranted, setPermsGranted] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchInstalls();
    const channel = supabase
      .channel("app_installs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_installs", filter: `user_id=eq.${user.id}` },
        () => fetchInstalls()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchInstalls = async () => {
    const { data, error } = await supabase
      .from("app_installs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.error(error);
    else setInstalls((data ?? []) as AppInstall[]);
    setLoading(false);
  };

  const requestPermissions = async () => {
    const granted = await ensureWebNotificationPermission();
    setPermsGranted(granted);
    if (granted) {
      toast.success("Notification permission granted");
    } else {
      toast.error("Notification permission denied", {
        description: "Enable notifications in your browser settings to receive alerts.",
      });
    }
  };

  const handleSimulate = (source: "playstore" | "unknown") => {
    if (!appName.trim()) {
      toast.error("Enter an app name first");
      return;
    }
    simulateInstall(appName.trim(), source);
    setAppName("");
  };

  const deleteOne = async (id: string) => {
    await supabase.from("app_installs").delete().eq("id", id);
  };

  const recentAlerts = installs.filter((i) => i.result !== "safe").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">APP INSTALL MONITOR</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time detection of newly installed apps with safety analysis
        </p>
      </div>

      {/* Permissions setup */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm tracking-wider">PERMISSIONS</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { label: "Notification Access", granted: permsGranted, action: requestPermissions },
            { label: "Install Package Monitoring", granted: monitoring, native: true },
            { label: "App Usage Access", granted: monitoring, native: true },
            { label: "Unknown Source Detection", granted: monitoring, native: true },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
            >
              <span className="text-foreground/80">{p.label}</span>
              {p.granted ? (
                <Badge variant="outline" className="text-primary border-primary/40">
                  Granted
                </Badge>
              ) : p.native ? (
                <Badge variant="outline" className="text-muted-foreground">
                  Native only
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={p.action}>
                  Request
                </Button>
              )}
            </div>
          ))}
        </div>
        {!monitoring && (
          <p className="text-[11px] text-muted-foreground mt-3">
            Install package monitoring is only available in the native Android build.
            Use the simulator below to test the flow in the browser.
          </p>
        )}
      </div>

      {/* Simulator */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle className="h-4 w-4 text-accent" />
          <h3 className="font-display text-sm tracking-wider">SIMULATE INSTALL</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="App name (try 'Premium APK Mod')"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
          <Button onClick={() => handleSimulate("playstore")} variant="outline">
            From Play Store
          </Button>
          <Button onClick={() => handleSimulate("unknown")} variant="outline">
            From Unknown Source
          </Button>
        </div>
      </div>

      {/* Recent alerts */}
      {recentAlerts.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-3">RECENT ALERTS</h3>
          <div className="space-y-2">
            {recentAlerts.map((a, i) => {
              const cfg = resultConfig[a.result];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                >
                  <div className={`rounded-md p-1.5 ${cfg.bg}`}>
                    <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.app_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.reason}</p>
                  </div>
                  <span className={`text-xs font-display font-bold ${cfg.color}`}>
                    {a.risk_score}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm tracking-wider">INSTALLED APPS HISTORY</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">{installs.length} entries</span>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : installs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No app installs detected yet. Simulate one above or install the native build.
          </p>
        ) : (
          <div className="space-y-2">
            {installs.map((a) => {
              const cfg = resultConfig[a.result];
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 p-3 transition-colors"
                >
                  <div className={`rounded-md p-1.5 ${cfg.bg}`}>
                    <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{a.app_name}</p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${cfg.color} border-current/30`}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {a.install_source === "playstore" ? "Play Store" : "Unknown source"} ·{" "}
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteOne(a.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
