import { motion } from "framer-motion";
import { Lock, Hash, CheckCircle, Clock, Shield } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";

const logs = [
  { id: "0xA3F...8B2", action: "Phishing URL blocked", hash: "sha256:4e8f...c2a1", timestamp: "2024-04-16 14:32:01", verified: true, block: 14892 },
  { id: "0xB7D...1E4", action: "Malware APK quarantined", hash: "sha256:9b3c...7f8d", timestamp: "2024-04-16 14:28:15", verified: true, block: 14891 },
  { id: "0xC2E...6F9", action: "Safe URL verified", hash: "sha256:1a5e...3d0b", timestamp: "2024-04-16 14:25:33", verified: true, block: 14890 },
  { id: "0xD8A...3C7", action: "Zero-day behavior flagged", hash: "sha256:6f2a...8e4c", timestamp: "2024-04-16 14:20:47", verified: true, block: 14889 },
  { id: "0xE1F...9D5", action: "Model update deployed", hash: "sha256:b4d7...1a9e", timestamp: "2024-04-16 14:15:22", verified: true, block: 14888 },
  { id: "0xF5B...2A8", action: "User report submitted", hash: "sha256:c8e3...5b2f", timestamp: "2024-04-16 14:10:09", verified: true, block: 14887 },
  { id: "0xG9C...7E1", action: "Federated model sync", hash: "sha256:2d6f...9c4a", timestamp: "2024-04-16 14:05:55", verified: true, block: 14886 },
];

export default function SecureLogs() {
  return (
    <div className="space-y-6">
      <PageTitle title="Blockchain Secure Logs" subtitle="Tamper-proof audit trail with cryptographic verification" icon={Lock} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5"><Hash className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">14,892</p>
            <p className="text-xs text-muted-foreground">Total blocks</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-accent/10 p-2.5"><Shield className="h-5 w-5 text-accent" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground">Integrity verified</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="rounded-lg bg-threat/10 p-2.5"><Lock className="h-5 w-5 text-threat" /></div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">SHA-256</p>
            <p className="text-xs text-muted-foreground">Hash algorithm</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-sm tracking-wider">IMMUTABLE AUDIT TRAIL</h3>
        </div>
        <div className="divide-y divide-border">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex flex-col items-center">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {i < logs.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{log.action}</span>
                    <span className="text-[10px] font-display text-primary bg-primary/10 px-1.5 py-0.5 rounded">BLOCK #{log.block}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-display">{log.id}</span>
                    <span className="font-display truncate">{log.hash}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Lock className="h-3 w-3" />
                  <span className="text-[10px] font-display">VERIFIED</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
