// src/features/rituals/components/RitualsTab.tsx
// Main tab component for the Rituals feature - integrates all sub-components

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRitualsStore } from "../store/rituals.store";
import { DailyProgress } from "./DailyProgress";
import { RitualList } from "./RitualList";
import { RitualEditor } from "./RitualEditor";
import { ritualScheduler } from "../services/RitualScheduler";
import type { Ritual, RitualWithStatus } from "../types";

export function RitualsTab() {
  const { initialize, rituals, isLoading } = useRitualsStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);

  // Initialize store on mount
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reschedule alarms when rituals change
  useEffect(() => {
    const activeRituals = rituals.filter((r) => r.is_active);
    if (activeRituals.length > 0) {
      ritualScheduler.rescheduleAll(activeRituals);
    }
  }, [rituals]);

  const handleCreateNew = () => {
    setEditingRitual(null);
    setEditorOpen(true);
  };

  const handleEditRitual = (ritual: RitualWithStatus) => {
    setEditingRitual(ritual);
    setEditorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            Cargando rituales...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Daily Progress Section */}
      <div className="shrink-0 border-b border-border/50">
        <DailyProgress />
      </div>

      {/* Ritual List */}
      <div className="flex-1 overflow-hidden pt-4">
        <RitualList
          onCreateNew={handleCreateNew}
          onEditRitual={handleEditRitual}
        />
      </div>

      {/* Editor Modal */}
      <RitualEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editingRitual={editingRitual}
      />
    </motion.div>
  );
}
