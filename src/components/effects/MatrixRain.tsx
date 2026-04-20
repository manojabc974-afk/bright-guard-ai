import { useEffect, useRef } from "react";

interface MatrixRainProps {
  opacity?: number;
  speed?: number;
}

/**
 * Lightweight canvas-based matrix rain effect.
 * Uses primary (neon green) HSL token for theme consistency.
 */
export default function MatrixRain({ opacity = 0.35, speed = 50 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastDraw = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソタチツテトナ01ABCDEF0123456789";
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(1);

    const onResize = () => {
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    };
    window.addEventListener("resize", onResize);

    // Read primary color from CSS variable
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim() || "160 100% 45%";

    const draw = (t: number) => {
      if (t - lastDraw > speed) {
        lastDraw = t;
        ctx.fillStyle = "rgba(10, 13, 17, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `hsla(${primary} / ${opacity})`;
        ctx.font = `${fontSize}px JetBrains Mono, monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", onResize);
    };
  }, [opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
