import { motion } from "framer-motion";
import { Brain, Cpu, Network, Eye, Fingerprint, Wifi, WifiOff, Zap } from "lucide-react";

const models = [
  { name: "BERT Phishing Classifier", type: "NLP", accuracy: 97.3, status: "Active", icon: Brain, desc: "Transformer-based text analysis for detecting phishing patterns in URLs and content" },
  { name: "LSTM Sequence Analyzer", type: "RNN", accuracy: 94.8, status: "Active", icon: Cpu, desc: "Long Short-Term Memory network for temporal pattern detection in app behavior" },
  { name: "Federated Learning Hub", type: "FL", accuracy: 91.2, status: "Training", icon: Network, desc: "Privacy-preserving distributed model training across 156 nodes" },
  { name: "Zero-Day Behavior Engine", type: "Anomaly", accuracy: 88.6, status: "Active", icon: Eye, desc: "Behavioral analysis for detecting unknown attack patterns using statistical anomalies" },
];

const offlineCapabilities = [
  { feature: "URL Pattern Matching", available: true },
  { feature: "Known Threat Signatures", available: true },
  { feature: "Heuristic Analysis", available: true },
  { feature: "Cached Model Inference", available: true },
  { feature: "Real-time Feed Sync", available: false },
  { feature: "Federated Learning", available: false },
];

export default function AIDetection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold tracking-wider">AI DETECTION ENGINE</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep learning models with federated training & zero-day detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model, i) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-5 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <model.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{model.name}</h3>
                  <span className="text-[10px] font-display text-accent bg-accent/10 px-1.5 py-0.5 rounded">{model.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{model.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${model.accuracy}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                  <span className="text-xs font-display font-bold text-primary">{model.accuracy}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${model.status === "Active" ? "bg-primary" : "bg-accent"} animate-pulse-glow`} />
                <span className={`text-[10px] font-display ${model.status === "Active" ? "text-primary" : "text-accent"}`}>{model.status.toUpperCase()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="h-4 w-4 text-threat" />
            <h3 className="font-display text-sm tracking-wider">BIOMETRIC AUTH STATUS</h3>
          </div>
          <div className="space-y-3">
            {[
              { method: "Fingerprint Scanner", enabled: true },
              { method: "Face Recognition", enabled: true },
              { method: "Behavioral Biometrics", enabled: false },
              { method: "Voice Authentication", enabled: false },
            ].map((bio) => (
              <div key={bio.method} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <span className="text-sm text-foreground">{bio.method}</span>
                <span className={`text-[10px] font-display ${bio.enabled ? "text-primary" : "text-muted-foreground"}`}>
                  {bio.enabled ? "ENABLED" : "AVAILABLE"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <WifiOff className="h-4 w-4 text-accent" />
            <h3 className="font-display text-sm tracking-wider">OFFLINE CAPABILITIES</h3>
          </div>
          <div className="space-y-3">
            {offlineCapabilities.map((cap) => (
              <div key={cap.feature} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <span className="text-sm text-foreground">{cap.feature}</span>
                <div className="flex items-center gap-1.5">
                  {cap.available ? (
                    <>
                      <Wifi className="h-3 w-3 text-primary" />
                      <WifiOff className="h-3 w-3 text-primary" />
                    </>
                  ) : (
                    <Wifi className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={`text-[10px] font-display ${cap.available ? "text-primary" : "text-muted-foreground"}`}>
                    {cap.available ? "ONLINE + OFFLINE" : "ONLINE ONLY"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
