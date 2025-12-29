// src/features/rituals/components/RitualEditor.tsx
// Create/Edit ritual modal with time picker and recurrence selector

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Palette } from "lucide-react";
import { useRitualsStore } from "../store/rituals.store";
import { ritualScheduler } from "../services/RitualScheduler";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Ritual, RecurrencePattern, CreateRitualInput } from "../types";
import { RITUAL_EMOJIS, RITUAL_COLORS } from "../types";

interface RitualEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRitual?: Ritual | null;
}

export function RitualEditor({
  open,
  onOpenChange,
  editingRitual,
}: RitualEditorProps) {
  const { addRitual, updateRitual } = useRitualsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState("#FF69B4");
  const [time, setTime] = useState("08:00");
  const [recurrence, setRecurrence] = useState<RecurrencePattern>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Populate form when editing
  useEffect(() => {
    if (editingRitual) {
      setTitle(editingRitual.title);
      setDescription(editingRitual.description || "");
      setEmoji(editingRitual.emoji);
      setColor(editingRitual.color);
      setTime(editingRitual.time);
      setRecurrence(editingRitual.recurrence);
      setDaysOfWeek(editingRitual.days_of_week);
    } else {
      // Reset form for new ritual
      setTitle("");
      setDescription("");
      setEmoji("✨");
      setColor("#FF69B4");
      setTime("08:00");
      setRecurrence("daily");
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    }
  }, [editingRitual, open]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    setIsSubmitting(true);

    try {
      const ritualData: CreateRitualInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        emoji,
        color,
        time,
        recurrence,
        days_of_week:
          recurrence === "custom"
            ? daysOfWeek
            : getDaysForRecurrence(recurrence),
      };

      if (editingRitual) {
        // Update existing ritual
        await updateRitual(editingRitual.id, ritualData);

        // Reschedule alarm
        const updatedRitual = { ...editingRitual, ...ritualData };
        await ritualScheduler.scheduleRitual(updatedRitual as Ritual);

        toast.success("Ritual actualizado");
      } else {
        // Create new ritual
        const id = await addRitual(ritualData);

        // Schedule alarm for new ritual
        const newRitual: Ritual = {
          id,
          user_id: "",
          title: ritualData.title,
          description: ritualData.description,
          emoji: emoji, // Use the form state directly, not ritualData.emoji
          color: color, // Use the form state directly
          time: ritualData.time,
          snooze_minutes: 10,
          is_active: true,
          streak_count: 0,
          best_streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_completed_at: null,
          days_of_week: ritualData.days_of_week || [0, 1, 2, 3, 4, 5, 6],
          recurrence: ritualData.recurrence || "daily",
        };
        await ritualScheduler.scheduleRitual(newRitual);

        toast.success(`${emoji} Ritual creado`);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving ritual:", error);
      toast.error("Error al guardar ritual");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysForRecurrence = (rec: RecurrencePattern): number[] => {
    switch (rec) {
      case "daily":
        return [0, 1, 2, 3, 4, 5, 6];
      case "weekdays":
        return [1, 2, 3, 4, 5];
      case "weekends":
        return [0, 6];
      case "custom":
        return daysOfWeek;
      default:
        return [0, 1, 2, 3, 4, 5, 6];
    }
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  };

  const dayLabels = ["D", "L", "M", "M", "J", "V", "S"];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl glass-dirty border-t border-border/50"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold tracking-tight">
            {editingRitual ? "Editar Ritual" : "Nuevo Ritual"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-24">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Meditación matutina"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué incluye este ritual?"
              rows={2}
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="flex flex-wrap gap-2">
              {RITUAL_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "h-10 w-10 rounded-lg text-xl transition-all",
                    "hover:bg-card/80 focus:ring-2 focus:ring-ring",
                    emoji === e && "bg-primary/20 ring-2 ring-primary",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color del Aura
            </Label>
            <div className="flex gap-2">
              {RITUAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    "hover:scale-110 focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    color === c &&
                      "ring-2 ring-white ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora del Recordatorio
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32 font-mono text-lg"
            />
          </div>

          {/* Recurrence Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Repetir
            </Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "daily", label: "Diario" },
                  { id: "weekdays", label: "Lun-Vie" },
                  { id: "weekends", label: "Fin de Semana" },
                  { id: "custom", label: "Personalizado" },
                ] as { id: RecurrencePattern; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecurrence(opt.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    recurrence === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 text-muted-foreground hover:bg-card/80",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom day selector */}
            <AnimatePresence>
              {recurrence === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 pt-3">
                    {dayLabels.map((label, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={cn(
                          "h-10 w-10 rounded-full text-sm font-medium transition-all",
                          daysOfWeek.includes(index)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/50 text-muted-foreground hover:bg-card/80",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  {emoji} {editingRitual ? "Actualizar" : "Crear Ritual"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
