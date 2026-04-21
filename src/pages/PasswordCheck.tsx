import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/ui/PageTitle";
import { toast } from "sonner";

function analyzePassword(pwd: string) {
  const checks = {
    length: pwd.length >= 12,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
    noCommon: !["password", "123456", "qwerty", "admin", "letmein", "welcome", "monkey", "dragon", "master", "login"].some(
      (w) => pwd.toLowerCase().includes(w)
    ),
    noRepeat: !/(.)\1{2,}/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / 7) * 100);
  const charsetSize =
    (checks.lower ? 26 : 0) + (checks.upper ? 26 : 0) + (checks.digit ? 10 : 0) + (checks.special ? 33 : 0);
  const entropy = pwd.length > 0 ? Math.round(pwd.length * Math.log2(Math.max(charsetSize, 1))) : 0;
  let label: string, color: string;
  if (score >= 86) { label = "EXCELLENT"; color = "text-primary"; }
  else if (score >= 72) { label = "STRONG"; color = "text-primary"; }
  else if (score >= 50) { label = "MODERATE"; color = "text-warning"; }
  else { label = "WEAK"; color = "text-destructive"; }
  return { checks, score, entropy, label, color };
}

function generatePassword(length = 18) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

const criteriaLabels: Record<string, string> = {
  length: "At least 12 characters",
  upper: "Uppercase letter (A-Z)",
  lower: "Lowercase letter (a-z)",
  digit: "Number (0-9)",
  special: "Special character (!@#$...)",
  noCommon: "No common passwords",
  noRepeat: "No repeated characters (aaa)",
};

export default function PasswordCheck() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const analysis = useMemo(() => analyzePassword(password), [password]);

  const handleGenerate = () => {
    const pwd = generatePassword();
    setPassword(pwd);
    setShow(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const barColor =
    analysis.score >= 86 ? "bg-primary" : analysis.score >= 72 ? "bg-primary" : analysis.score >= 50 ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageTitle title="Password Strength Analyzer" subtitle="Check password entropy, patterns & generate strong passwords" icon={KeyRound} />

      <div className="glass glass-sheen rounded-xl p-6 space-y-4">
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Type a password to analyze..."
            className="pl-10 pr-24 bg-secondary border-border cyber-input font-mono"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button onClick={() => setShow(!show)} className="p-1.5 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {password && (
              <button onClick={handleCopy} className="p-1.5 text-muted-foreground hover:text-foreground">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <Button onClick={handleGenerate} variant="outline" className="w-full gap-2 border-border font-display tracking-wider text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> GENERATE STRONG PASSWORD
        </Button>
      </div>

      {password.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score card */}
          <div className="glass glass-sheen rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {analysis.score >= 72 ? (
                  <ShieldCheck className={`h-6 w-6 ${analysis.color}`} />
                ) : (
                  <ShieldAlert className={`h-6 w-6 ${analysis.color}`} />
                )}
                <div>
                  <span className={`font-display text-lg font-bold tracking-wider ${analysis.color}`}>{analysis.label}</span>
                  <p className="text-xs text-muted-foreground">Entropy: {analysis.entropy} bits</p>
                </div>
              </div>
              <span className={`text-3xl font-display font-bold ${analysis.color}`}>{analysis.score}</span>
            </div>

            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div className={`h-full rounded-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${analysis.score}%` }} transition={{ duration: 0.6 }} />
            </div>
          </div>

          {/* Criteria */}
          <div className="glass glass-sheen rounded-xl p-6">
            <h3 className="font-display text-sm tracking-wider mb-4">CRITERIA</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(analysis.checks).map(([key, pass], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2 text-xs rounded-lg p-2.5 ${pass ? "bg-primary/10" : "bg-secondary/50"}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${pass ? "bg-primary" : "bg-muted-foreground"}`} />
                  <span className={pass ? "text-primary" : "text-muted-foreground"}>
                    {criteriaLabels[key]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {analysis.score < 72 && (
            <div className="glass rounded-xl p-5 border border-warning/20">
              <h3 className="font-display text-sm tracking-wider text-warning mb-2">RECOMMENDATIONS</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {!analysis.checks.length && <li>• Use at least 12 characters</li>}
                {!analysis.checks.special && <li>• Add special characters (!@#$%)</li>}
                {!analysis.checks.upper && <li>• Include uppercase letters</li>}
                {!analysis.checks.noCommon && <li>• Avoid common words like "password" or "admin"</li>}
                {!analysis.checks.noRepeat && <li>• Avoid repeating characters (aaa, 111)</li>}
                <li>• Consider using a passphrase (e.g., "correct-horse-battery-staple")</li>
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}