import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, ShieldAlert, ShieldCheck, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ensureWebNotificationPermission, showWebNotification } from "@/lib/appSafety";
import { toast } from "sonner";

interface LeakScan {
  id: string;
  check_type: string;
  checked_value: string;
  found: boolean;
  breach_count: number;
  breaches: string[];
  created_at: string;
}

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!d) return e;
  return `${u.slice(0, 2)}***@${d}`;
}

export default function LeakCheck() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState<"email" | "password" | null>(null);
  const [history, setHistory] = useState<LeakScan[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
    ensureWebNotificationPermission();
    const ch = supabase
      .channel("leak_scans_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leak_scans", filter: `user_id=eq.${user.id}` },
        fetchHistory
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("leak_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory(((data ?? []) as any[]).map((d) => ({
      ...d,
      breaches: Array.isArray(d.breaches) ? d.breaches : [],
    })));
  };

  const runCheck = async (type: "email" | "password", value: string) => {
    if (!value.trim()) {
      toast.error(`Enter ${type === "email" ? "an email" : "a password"} first`);
      return;
    }
    if (!user) return;
    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("check-leak", {
        body: { type, value },
      });
      if (error) throw error;

      const found = !!data.found;
      const breachCount = data.breach_count ?? (data.breaches?.length ?? 0);
      const checkedValue = type === "email" ? maskEmail(value) : "••••••••";

      await supabase.from("leak_scans").insert({
        user_id: user.id,
        check_type: type,
        checked_value: checkedValue,
        found,
        breach_count: breachCount,
        breaches: data.breaches ?? [],
      });

      if (found) {
        const title = "🚨 Data leak detected!";
        const body =
          type === "email"
            ? `${value} found in ${data.breaches.length} breach${data.breaches.length !== 1 ? "es" : ""}`
            : `Password seen ${breachCount.toLocaleString()} times in breaches`;
        toast.error(title, { description: body, duration: 8000 });
        showWebNotification(title, body);
      } else {
        toast.success("✅ No leaks found", {
          description: type === "email" ? "This email is clean" : "This password is not in known breaches",
        });
      }

      if (type === "password") setPassword("");
    } catch (e: any) {
      toast.error("Check failed", { description: e.message });
    } finally {
      setLoading(null);
    }
  };

  const deleteOne = async (id: string) => {
    await supabase.from("leak_scans").delete().eq("id", id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">DARK WEB LEAK MONITOR</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check if your email or password has appeared in known data breaches
        </p>
      </div>

      <div className="glass rounded-xl p-5">
        <Tabs defaultValue="email">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-3.5 w-3.5" /> Email
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <KeyRound className="h-3.5 w-3.5" /> Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Powered by XposedOrNot — checks 12+ billion leaked records.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCheck("email", email)}
              />
              <Button onClick={() => runCheck("email", email)} disabled={loading === "email"}>
                {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Powered by HaveIBeenPwned — uses k-anonymity. Only the first 5 chars of a SHA-1
              hash are sent. Your password never leaves your device.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter password to check"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runCheck("password", password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={() => runCheck("password", password)} disabled={loading === "password"}>
                {loading === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm tracking-wider">SCAN HISTORY</h3>
          <span className="text-[11px] text-muted-foreground">{history.length} scans</span>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No scans yet. Run a check above.</p>
        ) : (
          <div className="space-y-2">
            {history.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 p-3 transition-colors"
              >
                <div
                  className={`rounded-md p-1.5 ${
                    s.found ? "bg-destructive/10" : "bg-primary/10"
                  }`}
                >
                  {s.found ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground">{s.checked_value}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        s.found ? "text-destructive border-destructive/40" : "text-primary border-primary/40"
                      }`}
                    >
                      {s.check_type.toUpperCase()}
                    </Badge>
                    {s.found && (
                      <Badge variant="outline" className="text-[9px] text-destructive border-destructive/40">
                        {s.breach_count} {s.check_type === "password" ? "occurrences" : "breaches"}
                      </Badge>
                    )}
                  </div>
                  {s.found && s.breaches.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {s.breaches.slice(0, 5).join(", ")}
                      {s.breaches.length > 5 ? ` +${s.breaches.length - 5} more` : ""}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => deleteOne(s.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Note: phone-number, image, and Aadhaar leak checks were intentionally not included.
        No legal & accurate public API exists for them, and Aadhaar checks against third-party
        breach databases are restricted under India's DPDP & Aadhaar Acts.
      </p>
    </div>
  );
}
