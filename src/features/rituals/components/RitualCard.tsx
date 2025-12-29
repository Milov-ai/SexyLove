// src/features/rituals/components/RitualCard.tsx
// Individual ritual display card with Morbo Visual aesthetics

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MoreHorizontal, Bell, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RitualWithStatus } from "../types";
import { useRitualsStore } from "../store/rituals.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface RitualCardProps {
  ritual: RitualWithStatus;
  onEdit?: (ritual: RitualWithStatus) => void;
  onDelete?: (ritualId: string) => void;
}

export function RitualCard({ ritual, onEdit, onDelete }: RitualCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { completeRitual, uncompleteRitual } = useRitualsStore();

  const handleToggleComplete = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      if (ritual.completed_today) {
        await uncompleteRitual(ritual.id);
        toast.info("Ritual desmarcado");
      } else {
        await completeRitual(ritual.id);
        toast.success(`${ritual.emoji} ¡Ritual completado!`);
      }
    } catch {
      toast.error("Error al actualizar ritual");
    } finally {
      setIsCompleting(false);
    }
  };

  // Determine card state for styling
  const cardState = ritual.completed_today
    ? "completed"
    : ritual.is_due
      ? "due"
      : "pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative rounded-2xl p-4 transition-all duration-300",
        "glass-dirty overflow-hidden",
        // State-based styling
        cardState === "pending" && "opacity-80",
        cardState === "due" && "border-glow animate-pulse-glow",
        cardState === "completed" && "opacity-60",
      )}
      style={{
        // Dynamic border color based on ritual color when due
        borderColor: cardState === "due" ? ritual.color : undefined,
        // Subtle tint based on ritual color
        background:
          cardState === "completed"
            ? `linear-gradient(135deg, oklch(0.8 0.2 140 / 0.1), transparent)`
            : undefined,
      }}
    >
      {/* Background Aura Glow (when due) */}
      {cardState === "due" && (
        <div
          className="absolute inset-0 opacity-20 blur-xl"
          style={{ backgroundColor: ritual.color }}
        />
      )}

      <div className="relative flex items-start gap-4">
        {/* Emoji Avatar with Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompleting}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-xl",
            "transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            ritual.completed_today
              ? "bg-[oklch(0.8_0.2_140/0.2)]"
              : "bg-card/50 hover:bg-card/80",
          )}
          style={{
            boxShadow:
              cardState === "due" ? `0 0 20px ${ritual.color}40` : undefined,
          }}
        >
          <AnimatePresence mode="wait">
            {ritual.completed_today ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-7 w-7 text-[oklch(0.8_0.2_140)]" />
              </motion.div>
            ) : (
              <motion.span
                key="emoji"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                {ritual.emoji}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "font-semibold text-base tracking-tight truncate",
                ritual.completed_today && "line-through opacity-60",
              )}
            >
              {ritual.title}
            </h3>

            {/* Time Badge */}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg",
                "bg-card/50 text-xs font-mono",
                cardState === "due" && "text-primary",
              )}
            >
              <Clock className="h-3 w-3" />
              {ritual.time}
            </div>
          </div>

          {/* Description (if exists) */}
          {ritual.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {ritual.description}
            </p>
          )}

          {/* Recurrence & Streak Info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="capitalize">{ritual.recurrence}</span>
            {ritual.streak_count > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                🔥 {ritual.streak_count}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-2 rounded-lg opacity-0 group-hover:opacity-100",
                "transition-opacity duration-200",
                "hover:bg-card/80 focus:opacity-100",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(ritual)}>
              ✏️ Editar Ritual
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell className="h-4 w-4 mr-2" />
              Snooze 10 min
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SkipForward className="h-4 w-4 mr-2" />
              Saltar Hoy
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete?.(ritual.id)}
            >
              🗑️ Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Completion Progress Indicator (subtle line at bottom) */}
      {ritual.completed_today && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
          style={{ backgroundColor: "oklch(0.8 0.2 140)" }}
        />
      )}
    </motion.div>
  );
}
