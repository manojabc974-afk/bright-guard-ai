import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart, Activity, Loader2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfDay } from "date-fns";
import PageTitle from "@/components/ui/PageTitle";

const tooltipStyle = {
  contentStyle: { background: 'hsl(220, 18%, 7%)', border: '1px solid hsl(220, 15%, 14%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210, 20%, 92%)' },
};

interface Scan {
  url: string;
  status: string;
  score: number;
  created_at: string;
}

export default function Analytics() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("scan_results")
        .select("url, status, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);
      setScans((data as Scan[]) || []);
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel("analytics_scans")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scan_results" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Build last-7-days data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const dayScans = scans.filter((s) => startOfDay(new Date(s.created_at)).getTime() === day.getTime());
    const threats = dayScans.filter((s) => s.status === "phishing" || s.status === "suspicious").length;
    return {
      day: format(day, "EEE"),
      scans: dayScans.length,
      threats,
      blocked: threats,
    };
  });

  const total = scans.length;
  const phishing = scans.filter((s) => s.status === "phishing").length;
  const suspicious = scans.filter((s) => s.status === "suspicious").length;
  const safe = scans.filter((s) => s.status === "safe").length;

  const threatTypes = [
    { name: "Phishing", value: phishing, color: "hsl(0, 85%, 55%)" },
    { name: "Suspicious", value: suspicious, color: "hsl(38, 95%, 55%)" },
    { name: "Safe", value: safe, color: "hsl(160, 100%, 45%)" },
  ].filter((t) => t.value > 0);

  const detectionRate = total > 0 ? ((phishing + suspicious) / total * 100).toFixed(1) : "0.0";
  const avgScore = total > 0 ? Math.round(scans.reduce((s, x) => s + x.score, 0) / total) : 0;

  // Top risky domains
  const domainMap = new Map<string, { count: number; avgScore: number; total: number }>();
  scans.forEach((s) => {
    try {
      const domain = new URL(s.url).hostname;
      const cur = domainMap.get(domain) || { count: 0, avgScore: 0, total: 0 };
      cur.count += 1;
      cur.total += s.score;
      cur.avgScore = Math.round(cur.total / cur.count);
      domainMap.set(domain, cur);
    } catch { /* invalid url */ }
  });
  const topRisky = Array.from(domainMap.entries())
    .map(([domain, v]) => ({ domain, count: v.count, score: v.avgScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const radarData = [
    { subject: "Phishing", A: total > 0 ? Math.round((phishing / total) * 100) : 0 },
    { subject: "Suspicious", A: total > 0 ? Math.round((suspicious / total) * 100) : 0 },
    { subject: "Safe Rate", A: total > 0 ? Math.round((safe / total) * 100) : 0 },
    { subject: "Avg Risk", A: avgScore },
    { subject: "Coverage", A: Math.min(100, total) },
    { subject: "Activity", A: Math.min(100, weeklyData.reduce((s, d) => s + d.scans, 0) * 5) },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Advanced Analytics" subtitle="Live insights from your scan history — updates in real-time" icon={BarChart3} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Scans", value: total.toString(), icon: BarChart3, change: `${weeklyData[6]?.scans || 0} today` },
          { label: "Threats Found", value: (phishing + suspicious).toString(), icon: TrendingUp, change: `${detectionRate}% rate` },
          { label: "Avg Risk Score", value: `${avgScore}`, icon: Activity, change: avgScore < 30 ? "Low risk" : avgScore < 70 ? "Medium" : "High" },
          { label: "Safe URLs", value: safe.toString(), icon: PieChart, change: total > 0 ? `${Math.round((safe/total)*100)}%` : "—" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-display tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-primary mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">7-DAY SCAN ACTIVITY</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scans" fill="hsl(160, 100%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="threats" fill="hsl(0, 85%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">THREAT DISTRIBUTION</h3>
          <div className="h-56 flex items-center">
            {threatTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground mx-auto">No scan data yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={threatTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {threatTypes.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </RPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[120px]">
                  {threatTypes.map((t) => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                      <span className="text-xs text-muted-foreground">{t.name}</span>
                      <span className="text-xs font-display text-foreground ml-auto">{t.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">SECURITY POSTURE</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 15%, 14%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="hsl(160, 100%, 45%)" fill="hsl(160, 100%, 45%)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">SCAN TREND</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 14%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="scans" stroke="hsl(200, 100%, 50%)" fill="url(#trend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {topRisky.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-sm tracking-wider mb-4">TOP RISKY DOMAINS</h3>
          <div className="space-y-2">
            {topRisky.map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <span className="font-mono text-xs text-foreground flex-1 truncate">{d.domain}</span>
                <span className="text-xs text-muted-foreground">{d.count}x</span>
                <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${d.score > 70 ? "bg-destructive" : d.score > 30 ? "bg-warning" : "bg-primary"}`} style={{ width: `${d.score}%` }} />
                </div>
                <span className={`text-xs font-display w-8 text-right ${d.score > 70 ? "text-destructive" : d.score > 30 ? "text-warning" : "text-primary"}`}>{d.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
