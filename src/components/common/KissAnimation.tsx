import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LipsIconUrl from "@/assets/lips.svg";
import { Heart, Sparkles, Star } from "lucide-react";
import { useTheme } from "@/context/theme.context";

interface KissAnimationProps {
  onComplete: () => void;
}

const KissAnimation = ({ onComplete }: KissAnimationProps) => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<
    {
      id: number;
      x: number;
      y: number;
      scale: number;
      rotation: number;
      type: "lips" | "heart" | "sparkle" | "star";
      color: string;
      delay: number;
    }[]
  >([]);

  useEffect(() => {
    // Generate a dense explosion of particles
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 60; // Optimized for mobile

    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (isMobile ? 200 : 300) + 50; // Slightly smaller explosion on mobile
      const typeRandom = Math.random();
      let type: "lips" | "heart" | "sparkle" | "star" = "heart";
      if (typeRandom > 0.7) type = "lips";
      else if (typeRandom > 0.5) type = "sparkle";
      else if (typeRandom > 0.4) type = "star";

      // Theme-aware vibrant colors
      const colors =
        theme === "dark"
          ? ["#ec4899", "#d946ef", "#a855f7", "#f472b6", "#fb7185"] // Neon Pinks/Purples
          : ["#db2777", "#c026d3", "#9333ea", "#e11d48", "#be185d"]; // Deep Pinks/Purples

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: Math.random() * (isMobile ? 0.8 : 1) + 0.5,
        rotation: Math.random() * 360,
        type,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2, // Very fast burst
      };
    });
    setParticles(newParticles);

    const timer = setTimeout(onComplete, 1200); // 1.2s duration
    return () => clearTimeout(timer);
  }, [onComplete, theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {/* 1. Shockwave Background */}
        <motion.div
          key="shockwave"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/30 to-violet-500/30 blur-3xl"
        />

        {/* 2. Central Big Kiss Pulse */}
        <motion.div
          key="central-kiss"
          initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
          animate={{
            scale: [0.5, 2.5, 1.5, 0],
            opacity: [0, 1, 1, 0],
            rotate: [0, 0, 15, 0],
          }}
          transition={{ duration: 1, times: [0, 0.2, 0.5, 1], ease: "backOut" }}
          className="absolute z-20"
        >
          <div
            className="w-80 h-52 drop-shadow-[0_0_35px_rgba(236,72,153,0.8)]"
            style={{
              backgroundColor: theme === "dark" ? "#fbcfe8" : "#831843", // Very bright in dark, deep in light
              maskImage: `url(${LipsIconUrl})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: `url(${LipsIconUrl})`,
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          ></div>
        </motion.div>

        {/* 3. Particle Explosion */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: [0, particle.scale, 0],
              opacity: [1, 1, 0],
              rotate: particle.rotation + 180,
            }}
            transition={{
              duration: 1,
              ease: "circOut",
              delay: particle.delay,
            }}
            className="absolute z-10"
          >
            {particle.type === "lips" ? (
              <div
                className="w-10 h-6"
                style={{
                  backgroundColor: particle.color,
                  maskImage: `url(${LipsIconUrl})`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskImage: `url(${LipsIconUrl})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                }}
              ></div>
            ) : particle.type === "heart" ? (
              <Heart
                fill={particle.color}
                stroke="none"
                className="w-8 h-8"
                style={{ color: particle.color }}
              />
            ) : particle.type === "sparkle" ? (
              <Sparkles className="w-6 h-6" style={{ color: particle.color }} />
            ) : (
              <Star
                fill={particle.color}
                stroke="none"
                className="w-5 h-5"
                style={{ color: particle.color }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default KissAnimation;
