// Shared app-install safety logic. Used by both the simulator and the
// native bridge listener so the rules stay consistent.

export type InstallSource = "playstore" | "unknown";
export type SafetyResult = "safe" | "warning" | "unsafe";

const RISKY_KEYWORDS = ["mod", "crack", "hack", "premium apk", "cracked", "patched"];

export interface SafetyCheck {
  result: SafetyResult;
  riskScore: number;
  reason: string;
}

export function evaluateApp(appName: string, source: InstallSource): SafetyCheck {
  const lower = appName.toLowerCase();
  const matched = RISKY_KEYWORDS.find((k) => lower.includes(k));
  if (matched) {
    return { result: "unsafe", riskScore: 90, reason: `Risky keyword: "${matched}"` };
  }
  if (source !== "playstore") {
    return { result: "warning", riskScore: 55, reason: "Installed from unknown source" };
  }
  return { result: "safe", riskScore: 10, reason: "Verified Play Store install" };
}

export function notificationForResult(result: SafetyResult, appName: string) {
  switch (result) {
    case "safe":
      return { title: "✅ App is safe to install", body: `${appName} verified.` };
    case "warning":
      return { title: "⚠️ Warning: this app may be unsafe", body: appName };
    case "unsafe":
      return { title: "🚨 Unsafe APK detected. Do not install", body: appName };
  }
}

export async function ensureWebNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export function showWebNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    // ignore
  }
}
