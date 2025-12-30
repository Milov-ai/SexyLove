// src/features/rituals/components/RitualCard.tsx
// Individual ritual display card with Morbo Visual aesthetics

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  MoreHorizontal,
  Bell,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RitualWithStatus } from "../types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useRitualsStore } from "../store/rituals.store";
import { notificationService } from "@/services/NotificationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { THEMES, HEX_TO_THEME_ID, type ThemeId } from "@/lib/theme-constants";

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
        toast.info("Tarea desmarcada");
      } else {
        await completeRitual(ritual.id);
        toast.success(`${ritual.emoji} ¡Tarea completada!`);
      }
    } catch {
      toast.error("Error al actualizar tarea");
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

  // Resolve theme and color (supports both legacy Hex and new ThemeId storage)
  const isHex = ritual.color.startsWith("#");
  const themeId = isHex
    ? (HEX_TO_THEME_ID[ritual.color] as ThemeId)
    : (ritual.color as ThemeId);

  const theme = themeId ? THEMES[themeId] : null;
  const displayColor = theme ? theme.hex : ritual.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative rounded-2xl p-4 transition-all duration-500",
        "glass-dirty overflow-hidden border",
        // Base styles
        theme ? theme.border : "border-white/5",

        // State-based styling
        // REMOVED opacity-80 from pending to make colors pop
        cardState === "pending" && "hover:scale-[1.01]",
        cardState === "due" && [
          "border-glow animate-pulse-glow z-10",
          theme ? theme.glow : "shadow-[0_0_20px_rgba(255,255,255,0.1)]",
          "scale-[1.02]",
        ],
        cardState === "completed" && "opacity-60 grayscale-[0.5]",
      )}
      style={{
        // Use theme gradient if available, otherwise fallback
        borderTopColor: cardState === "due" ? displayColor : undefined,
        borderRightColor: cardState === "due" ? displayColor : undefined,
        borderBottomColor: cardState === "due" ? displayColor : undefined,
        // Always show a subtle border color if theme exists
        borderLeftColor: displayColor,
        borderLeftWidth: theme ? "4px" : undefined,
      }}
    >
      {/* Background Aura (Gradient) - INCREASED OPACITY */}
      {theme && cardState !== "completed" && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            theme.bg,
            // Much stronger opacity
            "opacity-50",
            cardState === "due" && "opacity-70",
          )}
        />
      )}

      {/* Background Aura Glow (when due) */}
      {cardState === "due" && (
        <div
          className="absolute inset-0 opacity-20 blur-xl transition-all duration-1000"
          style={{ backgroundColor: displayColor }}
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
              cardState === "due" ? `0 0 20px ${displayColor}40` : undefined,
            borderColor: theme ? `${displayColor}40` : undefined,
            borderWidth: theme ? "1px" : "0px",
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

            {/* Time Badge (Mobile Optimized) */}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg shrink-0",
                "bg-card/50 text-xs font-mono border border-transparent",
                cardState === "due" && "text-primary font-bold",
                theme && !ritual.completed_today && [theme.icon, theme.border],
              )}
            >
              <Clock
                className={cn(
                  "h-3 w-3",
                  theme && !ritual.completed_today && theme.icon,
                )}
              />
              {ritual.type === "one-time"
                ? ritual.scheduled_time || "12:00"
                : ritual.time}
            </div>
          </div>

          {/* Description */}
          {ritual.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {ritual.description}
            </p>
          )}

          {/* Metadata Row: Recurrence/Date + Streak */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs">
            {/* Type & Schedule */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 box-content">
              {ritual.type === "one-time" && ritual.scheduled_date ? (
                <>
                  <CalendarDays className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground/80">
                    {format(parseISO(ritual.scheduled_date), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground/80 lowercase first-letter:capitalize">
                    {(() => {
                      const days = ritual.days_of_week;
                      if (!days || days.length === 0) return "Sín días";
                      if (days.length === 7) return "Todos los días";
                      if (
                        days.length === 5 &&
                        !days.includes(0) &&
                        !days.includes(6)
                      )
                        return "Lun - Vie";
                      if (
                        days.length === 2 &&
                        days.includes(0) &&
                        days.includes(6)
                      )
                        return "Fin de semana";

                      const dayNames = [
                        "Dom",
                        "Lun",
                        "Mar",
                        "Mié",
                        "Jue",
                        "Vie",
                        "Sáb",
                      ];
                      return days.map((d) => dayNames[d]).join(", ");
                    })()}
                  </span>
                </>
              )}
            </div>

            {/* Streak Badge */}
            {ritual.streak_count > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
                🔥 {ritual.streak_count}
              </div>
            )}

            {/* Reminder Indicator */}
            {ritual.reminders && ritual.reminders.length > 0 && (
              <div
                className="flex items-center gap-1 text-primary/70"
                title="Recordatorios activos"
              >
                <Bell className="h-3 w-3 fill-current" />
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-2 rounded-lg",
                "transition-opacity duration-200",
                "hover:bg-card/80 active:bg-card",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(ritual)}>
              ✏️ Editar Tarea
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => notificationService.testRitualNotification(ritual)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Probar Notificación
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
