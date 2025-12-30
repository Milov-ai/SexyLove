// src/features/rituals/components/RitualList.tsx
// Scrollable list of rituals with staggered animations

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, CheckCircle2, List, CalendarDays } from "lucide-react";
import { useRitualsStore } from "../store/rituals.store";
import { RitualCard } from "./RitualCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import type { Ritual, RitualWithStatus } from "../types";

type FilterType = "today" | "all" | "completed" | "upcoming";

interface RitualListProps {
  onCreateNew?: () => void;
  onEditRitual?: (ritual: RitualWithStatus) => void;
}

export function RitualList({ onCreateNew, onEditRitual }: RitualListProps) {
  const [filter, setFilter] = useState<FilterType>("today");
  const {
    getTodaysRituals,
    getActiveRituals,
    getUpcomingTasks,
    deleteRitual,
    completions,
  } = useRitualsStore();

  // Get filtered rituals based on current filter
  const getFilteredRituals = (): RitualWithStatus[] => {
    const todaysRituals = getTodaysRituals();
    const activeRituals = getActiveRituals();

    // Consolidated mapping helper for consistency across tabs
    const mapToStatus = (r: Ritual): RitualWithStatus => {
      const todayMatch = todaysRituals.find((t) => t.id === r.id);
      const isOneTime = r.type === "one-time";

      // Find suitable completion: Latest record for One-Time, Today's record for Recurring
      const completion = isOneTime
        ? completions
            .filter((c) => c.ritual_id === r.id)
            .sort(
              (a, b) =>
                new Date(b.completed_at).getTime() -
                new Date(a.completed_at).getTime(),
            )[0]
        : todayMatch?.today_completion;

      return {
        ...r,
        completed_today: !!completion,
        is_due: todayMatch?.is_due || false,
        today_completion: completion,
      };
    };

    switch (filter) {
      case "today":
        return todaysRituals;
      case "upcoming":
        return getUpcomingTasks().map(mapToStatus);
      case "all":
        return activeRituals.map(mapToStatus);
      case "completed":
        return activeRituals.map(mapToStatus).filter((r) => r.completed_today);
      default:
        return todaysRituals;
    }
  };

  const filteredRituals = getFilteredRituals();

  // Grouping logic
  const groupedRituals = filteredRituals.reduce(
    (groups, ritual) => {
      let dateKey = "";

      if (ritual.type === "one-time" && ritual.scheduled_date) {
        dateKey = ritual.scheduled_date.split("T")[0];
      } else {
        // Recurring tasks that are due today or in "Hoy" filter
        dateKey = format(new Date(), "yyyy-MM-dd");
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(ritual);
      return groups;
    },
    {} as Record<string, RitualWithStatus[]>,
  );

  // Sort dates
  const sortedDates = Object.keys(groupedRituals).sort();

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    const dayName = format(date, "EEEE", { locale: es });
    const dayNum = format(date, "d", { locale: es });
    const monthYear = format(date, "MMM yyyy", { locale: es });

    let prefix = "";
    if (isToday(date)) prefix = "Hoy, ";
    else if (isTomorrow(date)) prefix = "Mañana, ";

    return (
      <span className="capitalize">
        <span className="text-primary font-bold">
          {prefix || `${dayName}, `}
        </span>
        <span className="opacity-80 font-normal">
          {dayNum} {monthYear}
        </span>
      </span>
    );
  };

  const handleDelete = async (ritualId: string) => {
    if (confirm("¿Eliminar esta tarea?")) {
      await deleteRitual(ritualId);
    }
  };

  const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
    { id: "today", label: "Hoy", icon: <Calendar className="h-4 w-4" /> },
    {
      id: "upcoming",
      label: "Próximos",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    { id: "all", label: "Todos", icon: <List className="h-4 w-4" /> },
    {
      id: "completed",
      label: "Hechos",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 pb-4">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "transition-all duration-200",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-card/50 text-muted-foreground hover:bg-card/80",
            )}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Ritual List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredRituals.length === 0 ? (
            <EmptyState filter={filter} onCreateNew={onCreateNew} />
          ) : (
            <motion.div className="space-y-8">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4 border-b border-white/5 shadow-sm">
                    <h2 className="text-sm tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDateHeader(dateKey)}
                    </h2>
                    <div className="flex-1 h-[1px] bg-white/5" />
                  </div>

                  <div className="space-y-3">
                    {groupedRituals[dateKey].map((ritual, index) => (
                      <motion.div
                        key={ritual.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05, // Staggered animation
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <RitualCard
                          ritual={ritual}
                          onEdit={onEditRitual}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Add Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={onCreateNew}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90",
            "border-glow animate-pulse-glow",
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}

interface EmptyStateProps {
  filter: FilterType;
  onCreateNew?: () => void;
}

function EmptyState({ filter, onCreateNew }: EmptyStateProps) {
  const messages = {
    today: {
      emoji: "☀️",
      title: "No hay tareas para hoy",
      description: "Crea tu primera tarea para comenzar tu rutina diaria",
    },
    all: {
      emoji: "📋",
      title: "Sin tareas activas",
      description: "Las tareas te ayudan a construir hábitos consistentes",
    },
    completed: {
      emoji: "✨",
      title: "Nada completado aún",
      description: "¡Completa una tarea para verla aquí!",
    },
    upcoming: {
      emoji: "🗓️",
      title: "Sin tareas próximas",
      description: "Programa recordatorios futuros para no olvidar nada",
    },
  };

  const msg = messages[filter];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="text-5xl mb-4"
      >
        {msg.emoji}
      </motion.span>
      <h3 className="text-lg font-semibold mb-2 font-serif italic">
        {msg.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {msg.description}
      </p>
      {filter !== "completed" && (
        <Button onClick={onCreateNew} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Tarea
        </Button>
      )}
    </motion.div>
  );
}
