import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  evaluateApp,
  notificationForResult,
  showWebNotification,
  type InstallSource,
} from "@/lib/appSafety";
import { toast } from "sonner";

interface NativeInstallEvent {
  appName: string;
  packageName: string;
  installSource: InstallSource;
  result: "safe" | "warning" | "unsafe";
  riskScore: number;
  reason: string;
  timestamp: number;
}

/**
 * Listens for the native `packageInstalled` event emitted by the Kotlin
 * SentinelInstallMonitor plugin. In Lovable preview / web (no Capacitor),
 * this hook is a no-op — use `simulateInstall()` to demo the flow.
 */
export function useInstallMonitor() {
  const { user } = useAuth();
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cleanup: (() => void) | undefined;

    (async () => {
      // Dynamically attempt to load Capacitor — falls through silently on web.
      try {
        const cap = await import("@capacitor/core").catch(() => null);
        if (!cap || !cap.Capacitor?.isNativePlatform?.()) return;

        const Sentinel = cap.registerPlugin<{
          startMonitoring: () => Promise<{ monitoring: boolean }>;
          stopMonitoring: () => Promise<void>;
          addListener: (
            event: "packageInstalled",
            cb: (e: NativeInstallEvent) => void
          ) => Promise<{ remove: () => void }>;
        }>("SentinelInstallMonitor");

        await Sentinel.startMonitoring();
        setMonitoring(true);

        const handle = await Sentinel.addListener("packageInstalled", async (e) => {
          await persistInstall(user.id, e);
          const n = notificationForResult(e.result, e.appName);
          showWebNotification(n.title, n.body);
          toast(n.title, { description: e.reason });
        });

        cleanup = () => {
          handle.remove();
          Sentinel.stopMonitoring().catch(() => {});
        };
      } catch (err) {
        console.warn("[InstallMonitor] native plugin unavailable:", err);
      }
    })();

    return () => cleanup?.();
  }, [user]);

  /** Simulate a package install — for web/preview demo. */
  const simulateInstall = async (appName: string, source: InstallSource) => {
    if (!user) return;
    const check = evaluateApp(appName, source);
    const event: NativeInstallEvent = {
      appName,
      packageName: appName.toLowerCase().replace(/\s+/g, ".") + ".app",
      installSource: source,
      ...check,
      timestamp: Date.now(),
    };
    await persistInstall(user.id, event);
    const n = notificationForResult(event.result, event.appName);
    showWebNotification(n.title, n.body);
    toast(n.title, { description: event.reason });
  };

  return { monitoring, simulateInstall };
}

async function persistInstall(userId: string, e: NativeInstallEvent) {
  const { error } = await supabase.from("app_installs").insert({
    user_id: userId,
    app_name: e.appName,
    package_name: e.packageName,
    install_source: e.installSource,
    result: e.result,
    risk_score: e.riskScore,
    reason: e.reason,
  });
  if (error) console.error("[InstallMonitor] persist failed:", error);
}
