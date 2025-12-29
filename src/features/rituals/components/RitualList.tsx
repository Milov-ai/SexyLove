// src/features/rituals/components/RitualList.tsx
// Scrollable list of rituals with staggered animations

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, CheckCircle2, List } from "lucide-react";
import { useRitualsStore } from "../store/rituals.store";
import { RitualCard } from "./RitualCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RitualWithStatus } from "../types";

type FilterType = "today" | "all" | "completed";

interface RitualListProps {
  onCreateNew?: () => void;
  onEditRitual?: (ritual: RitualWithStatus) => void;
}

export function RitualList({ onCreateNew, onEditRitual }: RitualListProps) {
  const [filter, setFilter] = useState<FilterType>("today");
  const { getTodaysRituals, getActiveRituals, deleteRitual } =
    useRitualsStore();

  // Get filtered rituals based on current filter
  const getFilteredRituals = (): RitualWithStatus[] => {
    const todaysRituals = getTodaysRituals();

    switch (filter) {
      case "today":
        return todaysRituals;
      case "completed":
        return todaysRituals.filter((r) => r.completed_today);
      case "all":
        // For "all", show all active rituals with their today status
        return getActiveRituals().map((r) => {
          const todayMatch = todaysRituals.find((t) => t.id === r.id);
          return (
            todayMatch || {
              ...r,
              completed_today: false,
              is_due: false,
            }
          );
        });
      default:
        return todaysRituals;
    }
  };

  const filteredRituals = getFilteredRituals();

  const handleDelete = async (ritualId: string) => {
    if (confirm("¿Eliminar este ritual?")) {
      await deleteRitual(ritualId);
    }
  };

  const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
    { id: "today", label: "Hoy", icon: <Calendar className="h-4 w-4" /> },
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
            <motion.div className="space-y-3">
              {filteredRituals.map((ritual, index) => (
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
      title: "No hay rituales para hoy",
      description: "Crea tu primer ritual para comenzar tu rutina diaria",
    },
    all: {
      emoji: "📋",
      title: "Sin rituales activos",
      description: "Los rituales te ayudan a construir hábitos consistentes",
    },
    completed: {
      emoji: "✨",
      title: "Nada completado aún",
      description: "¡Completa un ritual para verlo aquí!",
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
          Crear Ritual
        </Button>
      )}
    </motion.div>
  );
}
