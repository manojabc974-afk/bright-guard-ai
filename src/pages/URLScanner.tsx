import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, XCircle, CheckCircle, Loader2, Link as LinkIcon, QrCode, Volume2, VolumeX, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceAlert } from "@/hooks/useVoiceAlert";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import PageTitle from "@/components/ui/PageTitle";

interface ScanResult {
  status: "safe" | "suspicious" | "phishing";
  score: number;
  explanation: string;
  indicators: string[];
  sources?: { google_safe_browsing?: string; ai_model?: string };
}

const statusConfig = {
  safe: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", glow: "glow-primary", label: "SAFE" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", glow: "", label: "SUSPICIOUS" },
  phishing: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", glow: "glow-destructive", label: "PHISHING DETECTED" },
};

export default function URLScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [reporting, setReporting] = useState(false);
  const { user } = useAuth();
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled, speak } = useVoiceAlert();
  const [searchParams] = useSearchParams();

  // Auto-scan when arriving from a deep link (e.g., /scan?url=...)
  useEffect(() => {
    const incoming = searchParams.get("url");
    if (incoming && incoming !== url) {
      setUrl(incoming);
      handleScan(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleScan = async (overrideUrl?: string) => {
    const target = (overrideUrl ?? url).trim();
    if (!target) return;
    setScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-url", { body: { url: target } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const scanResult: ScanResult = {
        status: data.status,
        score: data.score,
        explanation: data.explanation,
        indicators: data.indicators,
        sources: data.sources,
      };
      setResult(scanResult);

      // Voice alert
      if (scanResult.status === "phishing") {
        speak(`Warning! Phishing detected. Risk score ${scanResult.score} out of 100. Do not visit this URL.`);
      } else if (scanResult.status === "suspicious") {
        speak(`Caution. This URL is suspicious with a risk score of ${scanResult.score}.`);
      } else {
        speak(`URL is safe. Risk score ${scanResult.score}.`);
      }

      if (user) {
        await supabase.from("scan_results").insert({
          user_id: user.id,
          url: target,
          status: scanResult.status,
          score: scanResult.score,
          explanation: scanResult.explanation,
          indicators: scanResult.indicators,
        });
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      toast.error(err.message || "Failed to analyze URL. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleQRScan = (text: string) => {
    setShowQR(false);
    setUrl(text);
    toast.success("QR code scanned — analyzing...");
    handleScan(text);
  };

  const reportToCommunity = async () => {
    if (!user || !result) return;
    setReporting(true);
    try {
      const { error } = await (supabase as any).from("community_reports").insert({
        reporter_id: user.id,
        url: url.trim(),
        threat_type: result.status,
        description: result.explanation,
      });
      if (error) throw error;
      toast.success("Reported to community threat feed");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit report");
    } finally {
      setReporting(false);
    }
  };

  const config = result ? statusConfig[result.status] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <PageTitle title="URL & Phishing Scanner" subtitle="AI + Google Safe Browsing real-time analysis" icon={Search} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="gap-1.5 text-xs border-border"
          title={voiceEnabled ? "Voice alerts on" : "Voice alerts off"}
        >
          {voiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5" />}
          VOICE
        </Button>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Enter URL to scan..."
              className="pl-10 bg-secondary border-border font-body"
            />
          </div>
          <Button onClick={() => handleScan()} disabled={scanning || !url.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">SCAN</span>
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setShowQR(true)} className="text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground">
            <QrCode className="h-3.5 w-3.5" /> Scan QR Code
          </Button>
        </div>
      </div>

      {showQR && <QRScanner onScan={handleQRScan} onClose={() => setShowQR(false)} />}

      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass rounded-xl p-6 overflow-hidden scan-overlay">
            <div className="flex items-center gap-4 mb-4">
              {/* Radar */}
              <div className="relative h-14 w-14 rounded-full border border-accent/40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-accent/20" />
                <div
                  className="absolute inset-0 animate-radar"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0deg, hsl(var(--accent) / 0.6) 60deg, transparent 90deg)",
                  }}
                />
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow z-10" />
              </div>
              <div>
                <span className="font-display text-sm text-accent tracking-wider">AI ANALYZING URL...</span>
                <p className="text-[10px] text-muted-foreground tracking-widest mt-0.5">RADAR SWEEP ACTIVE</p>
              </div>
            </div>
            <div className="space-y-2">
              {["Checking Google Safe Browsing database...", "Running deep learning analysis (BERT)...", "Extracting URL lexical features...", "Generating risk assessment..."].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-accent animate-pulse" />
                  {step}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-accent rounded-full" initial={{ width: "0%" }} animate={{ width: "90%" }} transition={{ duration: 4, ease: "easeOut" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && config && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className={`glass rounded-xl p-6 ${config.glow} ${result.status === "phishing" ? "animate-warning-flash border-destructive/50" : ""}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className={`rounded-lg p-2 ${config.bg}`}
                animate={result.status === "safe"
                  ? { boxShadow: ["0 0 0 hsl(var(--primary)/0)", "0 0 24px hsl(var(--primary)/0.6)", "0 0 0 hsl(var(--primary)/0)"] }
                  : {}}
                transition={{ duration: 1.6, repeat: result.status === "safe" ? 2 : 0 }}
              >
                <config.icon className={`h-6 w-6 ${config.color}`} />
              </motion.div>
              <div>
                <span className={`font-display text-lg font-bold ${config.color} tracking-wider ${result.status === "phishing" ? "animate-glitch" : ""}`}>{config.label}</span>
                <p className="text-xs text-muted-foreground">Risk Score: {result.score}/100</p>
              </div>
              <div className={`ml-auto text-3xl font-display font-bold ${config.color}`}>{result.score}</div>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
              <motion.div className={`h-full rounded-full ${result.status === "safe" ? "bg-primary" : result.status === "suspicious" ? "bg-warning" : "bg-destructive"}`} initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 0.8 }} />
            </div>

            <p className="text-sm text-foreground/80 mb-4">{result.explanation}</p>

            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-display text-muted-foreground tracking-wider">INDICATORS</h4>
              {result.indicators.map((ind, i) => (
                <motion.div key={`${ind}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`flex items-center gap-2 text-xs ${config.color}`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  {ind}
                </motion.div>
              ))}
            </div>

            {result.sources && (
              <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-display tracking-wider text-muted-foreground">
                <span className="px-2 py-1 rounded bg-secondary">GSB: {result.sources.google_safe_browsing}</span>
                <span className="px-2 py-1 rounded bg-secondary">AI: {result.sources.ai_model}</span>
              </div>
            )}

            {result.status !== "safe" && (
              <Button onClick={reportToCommunity} disabled={reporting} variant="outline" size="sm" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
                <Flag className="h-3.5 w-3.5" /> {reporting ? "Reporting..." : "Report to Community"}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
