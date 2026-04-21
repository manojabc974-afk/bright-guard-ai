import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, MessageSquare, Image as ImageIcon, Loader2, AlertTriangle,
  XCircle, CheckCircle, Link as LinkIcon, ShieldAlert, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useVoiceAlert } from "@/hooks/useVoiceAlert";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import PageTitle from "@/components/ui/PageTitle";

interface ContentResult {
  status: "safe" | "suspicious" | "phishing";
  score: number;
  extracted_text: string;
  extracted_urls: string[];
  indicators: string[];
  explanation: string;
  recommended_action: string;
}

const statusConfig = {
  safe: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", glow: "glow-primary", label: "SAFE CONTENT" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", glow: "", label: "SUSPICIOUS" },
  phishing: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", glow: "glow-destructive", label: "SCAM / PHISHING" },
};

export default function ContentScanner() {
  const [tab, setTab] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { speak } = useVoiceAlert();

  const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const analyze = async () => {
    setAnalyzing(true);
    setResult(null);

    try {
      let body: any = {};
      if (tab === "text") {
        if (!text.trim()) { toast.error("Paste a message to analyze"); setAnalyzing(false); return; }
        body = { text: text.trim() };
      } else {
        if (!fileRef.current?.files?.[0]) { toast.error("Choose an image"); setAnalyzing(false); return; }
        const { base64, mimeType } = await fileToBase64(fileRef.current.files[0]);
        body = { imageBase64: base64, mimeType };
      }

      const { data, error } = await supabase.functions.invoke("analyze-content", { body });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const r = data as ContentResult;
      setResult(r);

      if (r.status === "phishing") speak(`Warning! Scam detected. ${r.recommended_action}`);
      else if (r.status === "suspicious") speak(`Caution. Suspicious content with risk score ${r.score}`);

      // Persist as scan result
      if (user) {
        await supabase.from("scan_results").insert({
          user_id: user.id,
          url: r.extracted_urls[0] || `[${tab === "image" ? "screenshot" : "message"}]`,
          status: r.status,
          score: r.score,
          explanation: r.explanation,
          indicators: r.indicators,
        });
      }
    } catch (err: any) {
      console.error("Content scan error:", err);
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const config = result ? statusConfig[result.status] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle title="Content & Screenshot Scanner" subtitle="OCR + AI analysis for SMS, WhatsApp, emails, and screenshots" icon={ShieldAlert} />

      {/* Tabs */}
      <div className="glass rounded-xl p-1 flex gap-1">
        <button
          onClick={() => { setTab("text"); setResult(null); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-display tracking-wider transition-colors ${
            tab === "text" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> TEXT / SMS
        </button>
        <button
          onClick={() => { setTab("image"); setResult(null); }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-display tracking-wider transition-colors ${
            tab === "image" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" /> SCREENSHOT
        </button>
      </div>

      {/* Input */}
      <div className="glass rounded-xl p-6 space-y-4">
        {tab === "text" ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp message, email, or any text here..."
            className="min-h-[140px] bg-secondary border-border resize-none font-body text-sm"
          />
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border border-border bg-secondary/50" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 text-xs"
                >
                  Change
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm font-display tracking-wider">UPLOAD SCREENSHOT</span>
                <span className="text-xs">PNG, JPG up to 5MB</span>
              </button>
            )}
          </div>
        )}

        <Button
          onClick={analyze}
          disabled={analyzing || (tab === "text" ? !text.trim() : !imagePreview)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
          {analyzing ? "ANALYZING..." : "ANALYZE CONTENT"}
        </Button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && config && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-6 ${config.glow}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-lg p-2 ${config.bg}`}>
                <config.icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <span className={`font-display text-lg font-bold ${config.color} tracking-wider`}>{config.label}</span>
                <p className="text-xs text-muted-foreground">Risk Score: {result.score}/100</p>
              </div>
              <div className={`ml-auto text-3xl font-display font-bold ${config.color}`}>{result.score}</div>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
              <motion.div
                className={`h-full rounded-full ${
                  result.status === "safe" ? "bg-primary" : result.status === "suspicious" ? "bg-warning" : "bg-destructive"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <p className="text-sm text-foreground/80 mb-4">{result.explanation}</p>

            <div className={`rounded-lg p-3 mb-4 ${config.bg} border border-current/20`}>
              <h4 className={`text-xs font-display ${config.color} tracking-wider mb-1`}>RECOMMENDED ACTION</h4>
              <p className={`text-xs ${config.color}`}>{result.recommended_action}</p>
            </div>

            {result.extracted_text && tab === "image" && (
              <div className="mb-4">
                <h4 className="text-xs font-display text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> EXTRACTED TEXT (OCR)
                </h4>
                <div className="bg-secondary rounded-lg p-3 text-xs text-foreground/80 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {result.extracted_text}
                </div>
              </div>
            )}

            {result.indicators.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-display text-muted-foreground tracking-wider">INDICATORS</h4>
                {result.indicators.map((ind, i) => (
                  <motion.div
                    key={`${ind}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-start gap-2 text-xs ${config.color}`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-current mt-1 shrink-0" />
                    <span>{ind}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {result.extracted_urls.length > 0 && (
              <div>
                <h4 className="text-xs font-display text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
                  <LinkIcon className="h-3 w-3" /> URLS FOUND ({result.extracted_urls.length})
                </h4>
                <div className="space-y-2">
                  {result.extracted_urls.map((u) => (
                    <div key={u} className="flex items-center gap-2 bg-secondary rounded-lg p-2.5">
                      <span className="flex-1 text-xs font-mono text-foreground/80 truncate">{u}</span>
                      <Link to={`/scan?url=${encodeURIComponent(u)}`}>
                        <Button variant="outline" size="sm" className="text-[10px] h-7 border-border">
                          DEEP SCAN
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
