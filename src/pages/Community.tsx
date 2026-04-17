import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flag, ThumbsUp, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: string;
  url: string;
  threat_type: string;
  description: string | null;
  upvotes: number;
  reporter_id: string;
  created_at: string;
}

export default function Community() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [threatType, setThreatType] = useState("phishing");

  const fetchAll = async () => {
    const { data: rs } = await (supabase as any)
      .from("community_reports")
      .select("*")
      .order("upvotes", { ascending: false })
      .limit(50);
    setReports((rs as Report[]) || []);

    if (user) {
      const { data: vs } = await (supabase as any)
        .from("report_votes")
        .select("report_id")
        .eq("user_id", user.id);
      setMyVotes(new Set(((vs as { report_id: string }[]) || []).map((v) => v.report_id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("community_reports_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_reports" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submit = async () => {
    if (!user || !url.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("community_reports").insert({
        reporter_id: user.id,
        url: url.trim(),
        threat_type: threatType,
        description: description.trim() || null,
      });
      if (error) throw error;
      toast.success("Report submitted to community");
      setUrl("");
      setDescription("");
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVote = async (reportId: string) => {
    if (!user) return;
    const voted = myVotes.has(reportId);
    try {
      if (voted) {
        await (supabase as any).from("report_votes").delete().eq("report_id", reportId).eq("user_id", user.id);
        myVotes.delete(reportId);
      } else {
        await (supabase as any).from("report_votes").insert({ report_id: reportId, user_id: user.id });
        myVotes.add(reportId);
      }
      setMyVotes(new Set(myVotes));
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Vote failed");
    }
  };

  const threatColor = (t: string) =>
    t === "phishing" ? "text-destructive bg-destructive/10" : t === "suspicious" ? "text-warning bg-warning/10" : "text-accent bg-accent/10";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">COMMUNITY THREAT FEED</h1>
        <p className="text-sm text-muted-foreground mt-1">Crowdsourced phishing intelligence — report & verify threats together</p>
      </div>

      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-display tracking-wider text-foreground">REPORT A THREAT</h3>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Suspicious URL..." className="bg-secondary border-border" />
        <div className="flex gap-2">
          {["phishing", "suspicious", "malware"].map((t) => (
            <button
              key={t}
              onClick={() => setThreatType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-display tracking-wider transition-all ${
                threatType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe how you encountered this threat (optional)" className="bg-secondary border-border min-h-[80px]" maxLength={500} />
        <Button onClick={submit} disabled={submitting || !url.trim()} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flag className="h-4 w-4 mr-2" />}
          SUBMIT REPORT
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-display tracking-wider text-muted-foreground">TOP COMMUNITY REPORTS</h3>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" /></div>
        ) : reports.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No reports yet — be the first to report a threat</p>
          </div>
        ) : (
          reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-4 flex items-start gap-3"
            >
              <button
                onClick={() => toggleVote(r.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  myVotes.has(r.id) ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="text-xs font-display">{r.upvotes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-display tracking-wider px-2 py-0.5 rounded ${threatColor(r.threat_type)}`}>
                    {r.threat_type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-sm font-mono text-foreground break-all flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 inline shrink-0 text-muted-foreground" />
                  {r.url}
                </p>
                {r.description && <p className="text-xs text-muted-foreground mt-1.5">{r.description}</p>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
