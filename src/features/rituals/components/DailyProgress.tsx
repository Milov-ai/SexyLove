// src/features/rituals/components/DailyProgress.tsx
// Daily progress ring with streak counter - Morbo Visual aesthetics

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useRitualsStore } from "../store/rituals.store";

export function DailyProgress() {
  const { getDailyProgress, getOverallStreak } = useRitualsStore();
  const progress = getDailyProgress();
  const streak = getOverallStreak();

  // SVG circle parameters
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress.percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Progress Ring */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="oklch(0.2 0.02 280)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle with gradient */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              strokeDasharray: circumference,
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="oklch(0.6 0.25 300)" />{" "}
              {/* Electric Magenta */}
              <stop offset="100%" stopColor="oklch(0.7 0.2 260)" />{" "}
              {/* Cyber Violet */}
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={progress.completed}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold tracking-tight font-mono"
          >
            {progress.completed}/{progress.total}
          </motion.span>
          <span className="text-xs text-muted-foreground">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* Streak Counter */}
      <StreakDisplay streak={streak} />

      {/* Status text */}
      <p className="text-sm text-muted-foreground text-center">
        {progress.percentage === 100
          ? "¡Todos los rituales completados! 🎉"
          : progress.completed === 0
            ? "Comienza tu día con un ritual"
            : `${progress.total - progress.completed} rituales pendientes`}
      </p>
    </div>
  );
}

interface StreakDisplayProps {
  streak: number;
}

function StreakDisplay({ streak }: StreakDisplayProps) {
  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Flame className="h-5 w-5" />
        <span className="text-sm">Inicia tu racha hoy</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2"
    >
      {/* Animated Flame */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <Flame
          className="h-6 w-6"
          style={{
            color: streak >= 7 ? "#F97316" : "#FBBF24",
            filter: `drop-shadow(0 0 ${Math.min(streak * 2, 10)}px ${streak >= 7 ? "#F97316" : "#FBBF24"})`,
          }}
        />
      </motion.div>

      {/* Streak Number */}
      <motion.span
        key={streak}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-lg font-bold"
        style={{
          background: "linear-gradient(135deg, #FBBF24, #F97316)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {streak} {streak === 1 ? "día" : "días"}
      </motion.span>
    </motion.div>
  );
}
