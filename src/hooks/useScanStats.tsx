import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ScanStats {
  totalScans: number;
  threats: number;
  safeApps: number;
  securityScore: number;
  recentScans: { url: string; status: string; score: number; created_at: string }[];
}

export function useScanStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    threats: 0,
    safeApps: 0,
    securityScore: 100,
    recentScans: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("scan_results")
        .select("url, status, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
        return;
      }

      const scans = data || [];
      const threats = scans.filter(s => s.status === "phishing" || s.status === "suspicious").length;
      const safe = scans.filter(s => s.status === "safe").length;
      const avgScore = scans.length > 0
        ? Math.round(100 - (scans.reduce((sum, s) => sum + s.score, 0) / scans.length))
        : 100;

      setStats({
        totalScans: scans.length,
        threats,
        safeApps: safe,
        securityScore: Math.max(0, Math.min(100, avgScore)),
        recentScans: scans.slice(0, 10),
      });
      setLoading(false);
    };

    fetchStats();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("scan_results_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scan_results" }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { stats, loading };
}
