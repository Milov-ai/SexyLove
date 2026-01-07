import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PremiumButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: React.ReactNode;
  icon?: React.ElementType;
  variant?: "platinum" | "neon" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isFullWidth?: boolean;
}

export const PremiumButton = React.forwardRef<
  HTMLButtonElement,
  PremiumButtonProps
>(
  (
    {
      children,
      className,
      icon: Icon,
      variant = "platinum",
      size = "md",
      isFullWidth = false,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-9 px-4 text-xs",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12 p-0 flex items-center justify-center",
    };

    const variantClasses = {
      platinum:
        "bg-gradient-to-br from-slate-200 via-white to-slate-200 text-black dark:text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)] border border-white/50 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.6)]",
      neon: "bg-gradient-to-br from-[var(--neon-primary)] to-[var(--neon-secondary)] text-white shadow-[0_0_15px_-3px_var(--neon-primary)] border border-white/10 hover:shadow-[0_0_25px_-5px_var(--neon-primary)]",
      glass:
        "bg-white/5 backdrop-blur-md border border-white/10 text-foreground hover:bg-white/10 shadow-inner",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, translateY: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-2xl font-bold tracking-wide transition-all duration-300",
          variantClasses[variant],
          sizeClasses[size],
          isFullWidth ? "w-full" : "",
          className,
        )}
        {...props}
      >
        {/* Sheen Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] animate-shimmer" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {Icon && (
            <Icon
              className={cn(
                "w-5 h-5",
                variant === "platinum" ? "text-black/80" : "text-foreground",
              )}
            />
          )}
          {children}
        </div>
      </motion.button>
    );
  },
);

PremiumButton.displayName = "PremiumButton";
