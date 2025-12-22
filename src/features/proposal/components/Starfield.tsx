import { useEffect, useRef } from "react";
import React from "react";

interface StarfieldProps {
  speedRef: React.MutableRefObject<{ val: number }>;
  state: string;
}

export const Starfield = React.memo(({ speedRef, state }: StarfieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize: No alpha on canvas itself
    if (!ctx) return;

    // Mobile Optimization: Reduce count on smaller screens but keep it dense enough for "Milov" impact
    const isMobile = window.innerWidth < 768;
    const numStars = isMobile ? 800 : 1600; // Increased density for premium feel
    let animationFrameId: number;
    const stars: { x: number; y: number; z: number; size: number }[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    // Throttle resize
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resize, 100);
    };

    window.addEventListener("resize", handleResize);
    resize();

    // Init Stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * window.innerWidth - window.innerWidth / 2,
        y: Math.random() * window.innerHeight - window.innerHeight / 2,
        z: Math.random() * window.innerWidth,
        size: Math.random() * 2,
      });
    }

    const draw = () => {
      // Optimization: Use hex instead of rgba string parsing if possible, but rgba is needed for opacity
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.fillStyle = "#ffffff";
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Batch drawing? Canvas 2D is stateful.
      // We can't batch easily with varying opacity without offscreen canvas, which is overkill.
      // But we can skip opacity calculation for distant stars.

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= speedRef.current.val;

        if (star.z <= 0) {
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.z = width;
        }

        const x = (star.x / star.z) * width + cx;
        const y = (star.y / star.z) * height + cy;

        // Bounds check optimization
        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const size = (1 - star.z / width) * star.size * 2;
        const opacity = 1 - star.z / width;

        if (opacity > 0.1) {
          // Skip barely visible stars
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, speedRef]); // Only re-run if state effectively changes the "mode" (though speed is ref-driven)

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
});

Starfield.displayName = "Starfield";
