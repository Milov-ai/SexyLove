import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
  variant?: "standard" | "platinum" | "dark";
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = "standard",
      hoverEffect = true,
      glowEffect = false,
      ...props
    },
    ref,
  ) => {
    // Base styles for the glass effect
    const baseStyles =
      "rounded-3xl relative overflow-hidden transition-all duration-500 border";

    // Variant specific styles
    const variants = {
      standard:
        "bg-white/5 border-white/10 backdrop-blur-xl text-white shadow-2xl",
      platinum:
        "bg-gradient-to-br from-slate-200/20 via-white/5 to-slate-200/5 border-white/20 backdrop-blur-2xl text-white shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]",
      dark: "bg-black/40 border-white/5 backdrop-blur-2xl text-slate-200 shadow-inner-lg",
    };

    const hoverClasses =
      "hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 transition-all duration-500 ease-out";

    const glowClasses =
      "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700";

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverEffect && hoverClasses,
          glowEffect && glowClasses,
          className,
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        {...props}
      >
        {/* Shimmer Effect Overlay (Optional but premium) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
