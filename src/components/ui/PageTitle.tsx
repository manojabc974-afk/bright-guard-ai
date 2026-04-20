import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}

/**
 * Cinematic premium page title with glow reveal + icon shield-form animation.
 */
export default function PageTitle({ title, subtitle, icon: Icon }: PageTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex items-center gap-3"
    >
      {Icon && (
        <div className="animate-shield-form">
          <Icon className="h-7 w-7 text-primary glow-primary rounded-full" />
        </div>
      )}
      <div>
        <h1 className="page-title text-xl font-bold tracking-wider text-foreground neon-text">
          {title.toUpperCase()}
        </h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-sm text-muted-foreground mt-0.5"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
