import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MatrixRain from "@/components/effects/MatrixRain";
import AccessGranted from "@/components/effects/AccessGranted";

type Phase = "idle" | "scanning" | "granted";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) { toast.error("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email format"); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPhase("scanning");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setPhase("idle");
      toast.error(error.message);
      return;
    }
    setPhase("granted");
    setTimeout(() => navigate("/"), 1600);
  };

  const fillDemo = () => {
    setEmail("test@gmail.com");
    setPassword("123456");
  };

  const loading = phase === "scanning";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4 relative overflow-hidden">
      <MatrixRain opacity={0.4} />
      {/* Vignette */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`glass rounded-2xl p-8 space-y-6 relative ${loading ? "scan-overlay" : ""}`}>
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="relative animate-shield-form">
                <Shield className="h-10 w-10 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse-glow" />
              </div>
            </div>
            <h1 className="font-display text-xl font-bold tracking-wider text-foreground">AEGIS LOGIN</h1>
            <p className="text-xs text-muted-foreground tracking-widest">AI SECURITY SYSTEM</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground tracking-wider">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 bg-secondary border-border cyber-input" type="email" disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground tracking-wider">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-10 pr-10 bg-secondary border-border cyber-input" type={showPassword ? "text" : "password"} disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider ripple-btn">
              {loading ? <ScanLine className="h-4 w-4 animate-pulse mr-2" /> : null}
              {loading ? "VERIFYING ACCESS..." : "LOGIN"}
            </Button>

            {loading && (
              <motion.p
                className="text-[10px] text-center font-display tracking-widest text-primary"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ▸ SCANNING CREDENTIALS ▸ DECRYPTING ▸ AUTHENTICATING
              </motion.p>
            )}
          </form>

          <button onClick={fillDemo} className="w-full text-xs text-accent hover:text-accent/80 font-display tracking-wider transition-colors">
            USE DEMO ACCOUNT
          </button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === "granted" && <AccessGranted />}
      </AnimatePresence>
    </div>
  );
}
