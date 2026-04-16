import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/");
    }
  };

  const fillDemo = () => {
    setEmail("test@gmail.com");
    setPassword("123456");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="relative">
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
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10 bg-secondary border-border" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground tracking-wider">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-10 pr-10 bg-secondary border-border" type={showPassword ? "text" : "password"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </Button>
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
    </div>
  );
}
