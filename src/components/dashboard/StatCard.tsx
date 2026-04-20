import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "success" | "warning" | "destructive" | "accent";
}

const variantStyles = {
  default: "text-foreground",
  success: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
  accent: "text-accent",
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default", index = 0 }: StatCardProps & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="glass rounded-xl p-5 group hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-display text-muted-foreground tracking-wider">{title}</span>
        <div className="rounded-lg bg-secondary p-2 group-hover:bg-primary/10 transition-colors">
          <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
        </div>
      </div>
      <div className={`text-2xl font-display font-bold ${variantStyles[variant]}`}>{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? "text-primary" : "text-destructive"}`}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
