import { motion } from "framer-motion";

interface SecurityScoreProps {
  score: number;
}

export default function SecurityScore({ score }: SecurityScoreProps) {
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "text-primary" : score >= 50 ? "text-warning" : "text-destructive";
  const glowClass = score >= 80 ? "glow-primary" : score >= 50 ? "" : "glow-destructive";
  const label = score >= 80 ? "EXCELLENT" : score >= 50 ? "MODERATE" : "CRITICAL";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`glass rounded-2xl p-6 flex flex-col items-center ${glowClass} relative overflow-hidden`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ boxShadow: [
          `inset 0 0 20px hsl(var(--primary) / 0.05)`,
          `inset 0 0 30px hsl(var(--primary) / 0.18)`,
          `inset 0 0 20px hsl(var(--primary) / 0.05)`,
        ]}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <h3 className="text-xs font-display text-muted-foreground tracking-widest mb-4">SECURITY SCORE</h3>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="64" cy="64" r="56" fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-display font-bold ${color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-display tracking-widest">{label}</span>
        </div>
      </div>
    </motion.div>
  );
}
