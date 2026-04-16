import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, AlertTriangle, XCircle, CheckCircle, Loader2, Link as LinkIcon, QrCode, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScanResult {
  status: "safe" | "suspicious" | "phishing";
  score: number;
  explanation: string;
  indicators: string[];
}

const mockAnalyze = (url: string): Promise<ScanResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuspicious = url.includes("login") || url.includes("verify") || url.includes("bank") || url.includes("otp");
      const isPhishing = url.includes(".xyz") || url.includes("secure-") || url.includes("free-");
      if (isPhishing) {
        resolve({ status: "phishing", score: 92, explanation: "Domain registered recently, mimics legitimate banking site. Contains suspicious redirect chains and data harvesting forms.", indicators: ["Recently registered domain", "SSL certificate mismatch", "Fake login form detected", "Suspicious keyword density", "Known phishing pattern match"] });
      } else if (isSuspicious) {
        resolve({ status: "suspicious", score: 58, explanation: "URL contains suspicious keywords commonly used in phishing. The domain has limited trust history.", indicators: ["Suspicious keywords detected", "Limited domain history", "Unusual URL structure"] });
      } else {
        resolve({ status: "safe", score: 8, explanation: "URL belongs to a well-known and trusted domain. No phishing indicators detected by BERT/LSTM models.", indicators: ["Trusted domain", "Valid SSL", "No malicious patterns"] });
      }
    }, 2000);
  });
};

const statusConfig = {
  safe: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", glow: "glow-primary", label: "SAFE" },
  suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", glow: "", label: "SUSPICIOUS" },
  phishing: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", glow: "glow-destructive", label: "PHISHING DETECTED" },
};

export default function URLScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    const res = await mockAnalyze(url);
    setResult(res);
    setScanning(false);
  };

  const config = result ? statusConfig[result.status] : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">URL & PHISHING SCANNER</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep learning-powered analysis using BERT & LSTM models</p>
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
          <Button onClick={handleScan} disabled={scanning || !url.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">SCAN</span>
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground">
            <QrCode className="h-3.5 w-3.5" /> QR Code
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground">
            <Camera className="h-3.5 w-3.5" /> Screenshot
          </Button>
        </div>
      </div>

      {/* Scanning animation */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-6 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-5 w-5 text-accent animate-spin" />
              <span className="font-display text-sm text-accent tracking-wider">ANALYZING URL...</span>
            </div>
            <div className="space-y-2">
              {["Running BERT model analysis...", "Checking against threat databases...", "Analyzing behavioral patterns...", "Verifying SSL certificates..."].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="text-xs text-muted-foreground flex items-center gap-2"
                >
                  <div className="h-1 w-1 rounded-full bg-accent" />
                  {step}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                className={`h-full rounded-full ${result.status === "safe" ? "bg-primary" : result.status === "suspicious" ? "bg-warning" : "bg-destructive"}`}
                initial={{ width: 0 }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <p className="text-sm text-foreground/80 mb-4">{result.explanation}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-display text-muted-foreground tracking-wider">INDICATORS</h4>
              {result.indicators.map((ind, i) => (
                <motion.div
                  key={ind}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-2 text-xs ${config.color}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full bg-current`} />
                  {ind}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
