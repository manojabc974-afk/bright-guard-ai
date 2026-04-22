import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Download, Smartphone, QrCode, CheckCircle2, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticleField from "@/components/effects/ParticleField";
import GradientBlobs from "@/components/effects/GradientBlobs";

const APP_URL = "https://bright-guard-ai.lovable.app";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const steps = [
    { n: "1", text: "Open this page on your Android phone" },
    { n: "2", text: "Tap the Install button or use browser menu → 'Add to Home Screen'" },
    { n: "3", text: "The app will install like a real Android app" },
    { n: "4", text: "Open Sentinel AI from your home screen" },
  ];

  const iosSteps = [
    { n: "1", text: "Open this page in Safari on your iPhone" },
    { n: "2", text: "Tap the Share button (box with arrow)" },
    { n: "3", text: "Scroll down and tap 'Add to Home Screen'" },
    { n: "4", text: "Tap 'Add' to install Sentinel AI" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <GradientBlobs />
      <ParticleField />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md space-y-6"
      >
        {/* Logo + Title */}
        <div className="text-center space-y-4">
          <motion.div
            animate={{ boxShadow: ["0 0 20px hsl(160 100% 45%/0.3)", "0 0 40px hsl(160 100% 45%/0.6)", "0 0 20px hsl(160 100% 45%/0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto w-24 h-24 rounded-2xl bg-card/80 border border-primary/30 flex items-center justify-center"
          >
            <img src="/app-icon-512.png" alt="Sentinel AI" width={64} height={64} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-wider font-display">SENTINEL AI</h1>
            <p className="text-sm text-muted-foreground mt-1">AI Security System</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-display tracking-wider">PROTECTION READY</span>
          </div>
        </div>

        {/* Install Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-border space-y-5"
        >
          {installed ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-lg font-bold text-foreground">App Installed!</h2>
              <p className="text-sm text-muted-foreground">Open Sentinel AI from your home screen</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  <span>Scan to install on mobile</span>
                </div>
                <div className="mx-auto w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(APP_URL + "/install")}&bgcolor=ffffff&color=000000`}
                    alt="QR Code to install Sentinel AI"
                    width={180}
                    height={180}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Install Buttons */}
              <div className="space-y-3">
                {deferredPrompt && (
                  <Button onClick={handleInstall} className="w-full gap-2 text-sm h-12" size="lg">
                    <Download className="h-4 w-4" />
                    Install Sentinel AI
                  </Button>
                )}

                {!deferredPrompt && !isIOS && (
                  <Button
                    onClick={() => window.open(APP_URL, "_blank")}
                    className="w-full gap-2 text-sm h-12"
                    size="lg"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open App to Install
                  </Button>
                )}

                {isIOS && (
                  <Button variant="outline" className="w-full gap-2 text-sm h-12" size="lg" disabled>
                    <Share2 className="h-4 w-4" />
                    Use Safari Share → Add to Home Screen
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-5 border border-border"
        >
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            Installation Steps
          </h3>
          <div className="space-y-3">
            {(isIOS ? iosSteps : steps).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "Real-time\nProtection" },
            { icon: Smartphone, label: "Works\nOffline" },
            { icon: Download, label: "No App\nStore Needed" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass rounded-xl p-3 text-center border border-border"
            >
              <f.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-tight">{f.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60">
          v1.0.0 • Sentinel AI Security System • © 2026
        </p>
      </motion.div>
    </div>
  );
}