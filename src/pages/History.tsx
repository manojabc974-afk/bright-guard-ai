import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { History as HistoryIcon, Search, Trash2, ExternalLink, Loader2, Shield, AlertTriangle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";

interface Scan {
  id: string;
  url: string;
  status: string;
  score: number;
  explanation: string | null;
  created_at: string;
}

type Filter = "all" | "safe" | "suspicious" | "phishing";

const statusMeta: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  safe: { icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  phishing: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function History() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const fetchScans = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("scan_results")
      .select("id, url, status, score, explanation, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Failed to load history");
    } else {
      setScans((data as Scan[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScans();
    const channel = supabase
      .channel("history_scans")
      .on("postgres_changes", { event: "*", schema: "public", table: "scan_results" }, () => fetchScans())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    return scans.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (query && !s.url.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [scans, filter, query]);

  const handleDelete = async (id: string) => {
    const prev = scans;
    setScans(scans.filter((s) => s.id !== id));
    const { error } = await supabase.from("scan_results").delete().eq("id", id);
    if (error) {
      setScans(prev);
      toast.error("Could not delete entry");
    } else {
      toast.success("Entry removed");
    }
  };

  const handleClearAll = async () => {
    if (!user || !confirm("Delete all scan history? This cannot be undone.")) return;
    const { error } = await supabase.from("scan_results").delete().eq("user_id", user.id);
    if (error) toast.error("Failed to clear history");
    else { setScans([]); toast.success("History cleared"); }
  };

  const counts = {
    all: scans.length,
    safe: scans.filter((s) => s.status === "safe").length,
    suspicious: scans.filter((s) => s.status === "suspicious").length,
    phishing: scans.filter((s) => s.status === "phishing").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold tracking-wider flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary" /> SCAN HISTORY
          </h1>
          <p className="text-sm text-muted-foreground mt-1">All your past scans, stored securely in your database</p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-display tracking-wider text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors"
          >
            CLEAR ALL
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search URLs..."
            className="w-full glass rounded-lg pl-10 pr-3 py-2.5 text-sm bg-transparent border border-border focus:border-primary outline-none"
          />
        </div>
        <div className="flex gap-1 glass rounded-lg p-1">
          {(["all", "safe", "suspicious", "phishing"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-display tracking-wider rounded-md transition-colors ${
                filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.toUpperCase()} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <HistoryIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            {scans.length === 0 ? "No scans yet — run your first URL scan to start building history." : "No results match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => {
            const meta = statusMeta[s.status] || statusMeta.safe;
            const Icon = meta.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="glass rounded-xl p-4 flex items-center gap-3 group"
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${meta.bg}`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground truncate">{s.url}</span>
                    <span className={`text-[10px] font-display tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  {s.explanation && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.explanation}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(s.created_at), "PPp")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-display font-bold ${meta.color}`}>{s.score}</p>
                    <p className="text-[10px] text-muted-foreground tracking-wider">RISK</p>
                  </div>
                  <a
                    href={`/scan?url=${encodeURIComponent(s.url)}`}
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Re-scan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
