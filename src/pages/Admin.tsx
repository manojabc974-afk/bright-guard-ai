import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, BarChart3, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import PageTitle from "@/components/ui/PageTitle";

interface Stats {
  totalUsers: number;
  totalScans: number;
  totalThreats: number;
  totalReports: number;
}

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalScans: 0, totalThreats: 0, totalReports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "admin")
      .maybeSingle();
    const admin = !!data;
    setIsAdmin(admin);

    if (admin) {
      await loadStats();
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const [scans, reports, profiles] = await Promise.all([
      supabase.from("scan_results").select("status", { count: "exact", head: true }),
      supabase.from("community_reports").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    const { count: threatCount } = await supabase
      .from("scan_results")
      .select("*", { count: "exact", head: true })
      .in("status", ["phishing", "suspicious"]);

    setStats({
      totalUsers: profiles.count ?? 0,
      totalScans: scans.count ?? 0,
      totalThreats: threatCount ?? 0,
      totalReports: reports.count ?? 0,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-accent" },
    { label: "Total Scans", value: stats.totalScans, icon: BarChart3, color: "text-primary" },
    { label: "Threats Detected", value: stats.totalThreats, icon: AlertTriangle, color: "text-destructive" },
    { label: "Community Reports", value: stats.totalReports, icon: ShieldCheck, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Admin Panel" subtitle="System-wide monitoring & user management" icon={ShieldCheck} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass glass-sheen rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`h-5 w-5 ${c.color}`} />
              <span className="text-xs text-muted-foreground font-display tracking-wider">{c.label}</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{c.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass glass-sheen rounded-xl p-6">
        <h3 className="font-display text-sm tracking-wider mb-4">ADMIN ACTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "View All Scan Results", desc: "Browse the complete scan database" },
            { label: "Moderate Community Reports", desc: "Review and manage threat reports" },
            { label: "User Role Management", desc: "Assign admin or moderator roles" },
            { label: "System Health", desc: "Monitor backend services and uptime" },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-lg bg-secondary/50 hover:bg-secondary/70 p-4 transition-colors cursor-pointer"
            >
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Admin access is role-based and verified server-side. To grant admin access, add a row to the user_roles table.
      </p>
    </div>
  );
}