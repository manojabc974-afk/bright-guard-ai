import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const containerId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(() => {});
        },
        () => { /* ignore per-frame errors */ }
      )
      .then(() => setStarting(false))
      .catch((err) => {
        console.error("QR scanner failed to start:", err);
        toast.error("Camera access denied or unavailable");
        onClose();
      });

    return () => {
      try {
        const stopPromise = scanner.stop() as unknown as Promise<void> | undefined;
        if (stopPromise && typeof stopPromise.then === "function") {
          stopPromise.catch(() => {}).finally(() => {
            try { scanner.clear(); } catch { /* noop */ }
          });
        } else {
          try { scanner.clear(); } catch { /* noop */ }
        }
      } catch { /* noop */ }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-accent" />
            <span className="font-display text-sm tracking-wider text-accent">QR PHISHING SCAN</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div id={containerId} className="rounded-lg overflow-hidden bg-secondary aspect-square" />
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {starting ? "Starting camera..." : "Point at a QR code to scan its URL"}
        </p>
      </div>
    </div>
  );
}
