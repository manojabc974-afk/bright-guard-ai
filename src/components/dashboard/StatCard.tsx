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

export default function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-xl p-5 group hover:border-primary/20 transition-colors"
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
