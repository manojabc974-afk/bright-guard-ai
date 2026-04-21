import { motion } from "framer-motion";
import { AlertOctagon, Phone, Globe, Mail, Shield, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";

const helplines = [
  { label: "National Cyber Crime Helpline", number: "1930", desc: "24/7 toll-free cybercrime reporting", icon: Phone },
  { label: "Cyber Crime Portal", url: "https://cybercrime.gov.in", desc: "Official Indian Govt. portal for online complaints", icon: Globe },
  { label: "Women Helpline", number: "181", desc: "For cyber harassment and sextortion cases", icon: Phone },
  { label: "Police Emergency", number: "112", desc: "General emergency services", icon: Phone },
];

const quickReports = [
  { label: "Financial Fraud / UPI Scam", desc: "Bank fraud, unauthorized transactions, UPI scams" },
  { label: "Phishing / Identity Theft", desc: "Fake emails, stolen credentials, impersonation" },
  { label: "Social Media Scam", desc: "Fake profiles, romance scams, blackmail" },
  { label: "Ransomware / Malware", desc: "Device locked, files encrypted, extortion" },
  { label: "Data Breach / Leak", desc: "Personal data exposed in breach or dark web" },
  { label: "Cyber Stalking / Harassment", desc: "Online threats, bullying, doxxing" },
];

export default function Emergency() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageTitle title="Emergency Cyber Help" subtitle="One-click cybercrime reporting & helpline access" icon={AlertOctagon} />

      {/* SOS Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-6 border border-destructive/30 text-center"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 hsl(0 85% 55% / 0)",
              "0 0 30px 8px hsl(0 85% 55% / 0.35)",
              "0 0 0 0 hsl(0 85% 55% / 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex rounded-full p-5 bg-destructive/10 mb-4"
        >
          <AlertOctagon className="h-10 w-10 text-destructive" />
        </motion.div>
        <h2 className="font-display text-lg font-bold text-destructive tracking-wider">CYBER EMERGENCY?</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          If you are a victim of cybercrime, contact authorities immediately.
        </p>
        <a href="tel:1930">
          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display tracking-wider gap-2 text-sm">
            <Phone className="h-4 w-4" /> CALL 1930 NOW
          </Button>
        </a>
      </motion.div>

      {/* Helplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {helplines.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass glass-sheen rounded-xl p-4 flex items-start gap-3"
          >
            <div className="rounded-lg bg-accent/10 p-2.5">
              <h.icon className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{h.label}</p>
              <p className="text-xs text-muted-foreground">{h.desc}</p>
              {h.number && (
                <a href={`tel:${h.number}`} className="text-sm font-display text-primary mt-1 inline-block hover:underline">
                  {h.number}
                </a>
              )}
              {h.url && (
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary mt-1 flex items-center gap-1 hover:underline">
                  <ExternalLink className="h-3 w-3" /> Visit Portal
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Report Types */}
      <div className="glass glass-sheen rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm tracking-wider">REPORT TYPE GUIDE</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickReports.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-lg bg-secondary/50 p-3"
            >
              <p className="text-xs font-medium text-foreground">{r.label}</p>
              <p className="text-[11px] text-muted-foreground">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety tips */}
      <div className="glass rounded-xl p-5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm tracking-wider text-primary">IMMEDIATE STEPS</h3>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary">1.</span> Do NOT delete any evidence — save screenshots, messages, transaction IDs.</li>
          <li className="flex items-start gap-2"><span className="text-primary">2.</span> Report within the first hour — financial fraud recovery chances are highest early.</li>
          <li className="flex items-start gap-2"><span className="text-primary">3.</span> Call your bank immediately to freeze compromised accounts.</li>
          <li className="flex items-start gap-2"><span className="text-primary">4.</span> Change passwords for all affected accounts from a secure device.</li>
          <li className="flex items-start gap-2"><span className="text-primary">5.</span> File an FIR at your nearest police station with the cybercrime portal reference.</li>
        </ul>
      </div>
    </div>
  );
}