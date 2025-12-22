import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface BrandLogoProps {
  className?: string; // Additional classes for positioning/sizing
  // size is now optional and mainly for fallback. Use className w/h for responsive sizing.
  size?: number;
}

export const BrandLogo = ({ className, size = 48 }: BrandLogoProps) => {
  // Brand Logo v7.1: Performance Optimized "Atomic Star Rain"
  // Replaced heavy SVG Filter animations with Opacity composition.
  // Reduced particle count on mobile.

  const [isMobile, setIsMobile] = useState(false);

  // Performance Optimization: Check screen size once on mount to determine particle count
  useEffect(() => {
    // Media query is more performant than resize listener
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);

    // Optional: Update on change if user rotates device
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Dynamic particle counts based on device capability
  const rainCount = isMobile ? 5 : 12;
  const starCount = isMobile ? 8 : 18;

  const heartPath =
    "M 50 90 C 20 65, 5 40, 10 20 C 15 5, 35 0, 50 20 C 65 0, 85 5, 90 20 C 95 40, 80 65, 50 90 Z";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none aspect-square",
        className,
      )}
      // Only set explicit style if no className dimensions would override naturally (helper),
      // but to allow Tailwind classes like 'w-12 h-12' to work, we should AVOID setting inline style here
      // OR use it as a default. Ideally, we just rely on the SVG viewBox.
      // However, to keep backward compat if size is passed explicitly:
      style={
        !className?.includes("w-") && !className?.includes("h-")
          ? { width: size, height: size }
          : undefined
      }
    >
      {/* Logo v7: 'Atomic Star Rain' - The Final Jewel */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id="nebula-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2e0220" /> {/* Deep Void */}
            <stop offset="50%" stopColor="#4a044e" /> {/* Dark Fuchsia */}
            <stop offset="100%" stopColor="#1e1b4b" /> {/* Midnight Blue */}
          </linearGradient>

          <linearGradient id="gold-rain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>

          {/* STATIC Filter Only - No Animation applied to Filter ID */}
          <filter id="atomic-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <clipPath id="atomic-heart-clip">
            <path d={heartPath} />
          </clipPath>
        </defs>

        {/* 1. Nebula Container */}
        <motion.g
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Background Fill */}
          <path d={heartPath} fill="url(#nebula-gradient)" />

          {/* Inner Atmosphere pulse - Optimized: Opacity only */}
          <motion.path
            d={heartPath}
            fill="#ec4899"
            opacity="0.2"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "opacity" }}
          />

          {/* 2. THE STAR RAIN - Clipped & Reduced */}
          <g clipPath="url(#atomic-heart-clip)">
            {/* Rain Drops (Vertical Streaks) */}
            {Array.from({ length: rainCount }).map((_, i) => (
              <motion.rect
                key={`rain-${i}`}
                x={10 + Math.random() * 80}
                y={-20}
                width={1 + Math.random()}
                height={5 + Math.random() * 10}
                fill="url(#gold-rain)"
                initial={{ y: -20, opacity: 0 }}
                animate={{
                  y: [-20, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8 + Math.random() * 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear",
                }}
                style={{ willChange: "transform, opacity" }} // Hardware Accel Hint
              />
            ))}

            {/* Twinkling Particles (Dots) */}
            {Array.from({ length: starCount }).map((_, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={10 + Math.random() * 80}
                cy={10 + Math.random() * 70}
                r={0.5 + Math.random() * 1.5}
                fill={i % 2 === 0 ? "#fef08a" : "#ffffff"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
                style={{ willChange: "transform, opacity" }}
              />
            ))}
          </g>

          {/* 3. Glass Rim Highlight (3D Effect) */}
          <path
            d={heartPath}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
            className="pointer-events-none"
          />
          <path
            d="M 20 25 Q 35 15 50 25"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* 4. OPTIMIZED ATOMIC GLOW */}
          {/* Layer A: The Static Glow (Behind) - Animates Opacity Only */}
          <motion.path
            d={heartPath}
            fill="none"
            stroke="#ec4899"
            strokeWidth="6" /* Intentionally thicker for glow */
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#atomic-blur)"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: "opacity" }}
          />

          {/* Layer B: The Sharp Line (Front) - No animation, crisp vector */}
          <path
            d={heartPath}
            fill="none"
            stroke="#ec4899"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </svg>
    </div>
  );
};
