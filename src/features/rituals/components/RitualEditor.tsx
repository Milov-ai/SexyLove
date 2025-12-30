// src/features/rituals/components/RitualEditor.tsx
// Create/Edit task modal - Wizard with 2 steps

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  ChevronLeft,
  RotateCcw,
  CalendarDays,
  Bell,
  Plus,
  X,
} from "lucide-react";
import { useRitualsStore } from "../store/rituals.store";
import { ritualScheduler } from "../services/RitualScheduler";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type {
  Ritual,
  RecurrencePattern,
  CreateRitualInput,
  TaskType,
  Reminder,
} from "../types";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { HEX_TO_THEME_ID } from "@/lib/theme-constants";

// Compact sets
const COMPACT_EMOJIS = [
  "✨",
  "🌅",
  "💪",
  "🧘",
  "💧",
  "📚",
  "🏃",
  "💊",
  "🛏️",
  "🧹",
  "💝",
  "🎯",
  "🔔",
  "🌙",
];

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

  // Wizard state
  const [step, setStep] = useState<1 | 2>(editingRitual ? 2 : 1);
  const [taskType, setTaskType] = useState<TaskType>("recurring");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState<string>("aura_sunset");
  const [time, setTime] = useState("08:00");
  const [recurrence, setRecurrence] = useState<RecurrencePattern>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      if (editingRitual) {
        setStep(2);
        setTaskType(editingRitual.type || "recurring");
        setTitle(editingRitual.title);
        setDescription(editingRitual.description || "");
        setEmoji(editingRitual.emoji);
        // Map hex to theme ID if needed, or use existing ID
        const isHex = editingRitual.color.startsWith("#");
        const themeId = isHex
          ? HEX_TO_THEME_ID[editingRitual.color] || "default"
          : editingRitual.color;
        setColor(themeId);
        setTime(editingRitual.time);
        setRecurrence(editingRitual.recurrence);
        setDaysOfWeek(editingRitual.days_of_week);
        setScheduledDate(editingRitual.scheduled_date || "");
        setScheduledTime(editingRitual.scheduled_time || "12:00");
        setReminders(editingRitual.reminders || []);
      } else {
        setStep(1);
        setTaskType("recurring");
        setTitle("");
        setDescription("");
        setEmoji("✨");
        setColor("aura_sunset");
        setTime("08:00");
        setRecurrence("daily");
        setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
        setScheduledDate("");
        setScheduledTime("12:00");
        setReminders([]);
      }
    }
  }, [editingRitual, open]);

  const handleSelectType = (type: TaskType) => {
    setTaskType(type);
    setStep(2);
  };

  const handleBack = () => {
    if (editingRitual) {
      onOpenChange(false);
    } else {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (taskType === "one-time" && !scheduledDate) {
      toast.error("Selecciona una fecha");
      return;
    }

    setIsSubmitting(true);

    try {
      const ritualData: CreateRitualInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        emoji,
        color,
        type: taskType,
        ...(taskType === "recurring"
          ? {
              time,
              recurrence,
              days_of_week:
                recurrence === "custom"
                  ? daysOfWeek
                  : getDaysForRecurrence(recurrence),
            }
          : {
              scheduled_date: scheduledDate,
              scheduled_time: scheduledTime,
            }),
      };

      if (editingRitual) {
        await updateRitual(editingRitual.id, ritualData);
        if (taskType === "recurring") {
          const updatedRitual = { ...editingRitual, ...ritualData };
          await ritualScheduler.scheduleRitual(updatedRitual as Ritual);
        }
        toast.success("Tarea actualizada");
      } else {
        const id = await addRitual(ritualData);
        if (taskType === "recurring") {
          const newRitual: Ritual = {
            id,
            user_id: "",
            title: ritualData.title,
            description: ritualData.description,
            emoji,
            color,
            type: "recurring",
            time: ritualData.time || time,
            snooze_minutes: 10,
            is_active: true,
            streak_count: 0,
            best_streak: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_completed_at: null,
            days_of_week: ritualData.days_of_week || [0, 1, 2, 3, 4, 5, 6],
            recurrence: ritualData.recurrence || "daily",
            reminders: reminders,
          };
          await ritualScheduler.scheduleRitual(newRitual);
        }
        toast.success(
          `${emoji} ¡${taskType === "recurring" ? "Tarea" : "Recordatorio"} creado!`,
        );
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error al guardar");
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

  const addReminder = () => {
    setReminders([...reminders, { value: 10, unit: "minutes" }]);
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const updateReminder = (
    index: number,
    field: keyof Reminder,
    value: Reminder[keyof Reminder],
  ) => {
    const newReminders = [...reminders];
    newReminders[index] = { ...newReminders[index], [field]: value };
    setReminders(newReminders);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[100dvh] flex flex-col bg-background border-0"
      >
        <SheetDescription className="sr-only">Ritual Editor</SheetDescription>
        {/* Header */}
        <SheetHeader className="shrink-0 px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-1 -ml-1 hover:bg-card/50 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SheetTitle className="text-base font-bold">
              {step === 1
                ? "Nueva Tarea"
                : editingRitual
                  ? "Editar"
                  : taskType === "recurring"
                    ? "Tarea Recurrente"
                    : "Recordatorio"}
            </SheetTitle>
          </div>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Type Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
            >
              <p className="text-muted-foreground text-center">
                ¿Qué tipo de tarea quieres crear?
              </p>

              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                  onClick={() => handleSelectType("recurring")}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 hover:bg-card/80 transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Recurrente</div>
                    <div className="text-sm text-muted-foreground">
                      Diario, semanal, etc.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType("one-time")}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/50 hover:bg-card/80 transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Una sola vez</div>
                    <div className="text-sm text-muted-foreground">
                      Fecha específica
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Title + Emoji */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nombre..."
                      className="text-base h-11"
                      autoFocus
                    />
                  </div>
                  <div
                    className="h-11 w-11 rounded-xl bg-card/60 flex items-center justify-center text-2xl border border-border/50"
                    style={{ boxShadow: `0 0 12px ${color}40` }}
                  >
                    {emoji}
                  </div>
                </div>

                {/* Description */}
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="text-sm h-10"
                />

                {/* Emoji Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {COMPACT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "h-9 w-full rounded-lg text-lg transition-all",
                        emoji === e
                          ? "bg-primary/30 ring-1 ring-primary"
                          : "hover:bg-card/60",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* Color */}
                {/* Color (Aura) */}
                <div className="flex justify-center w-full">
                  <ColorPicker selectedColor={color} onSelect={setColor} />
                </div>

                {/* Type-specific fields */}
                {taskType === "recurring" ? (
                  <>
                    {/* Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Hora</span>
                      </div>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-[7.5rem] h-9 font-mono text-sm"
                      />
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Repetir</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            { id: "daily", label: "Diario" },
                            { id: "weekdays", label: "L-V" },
                            { id: "weekends", label: "S-D" },
                            { id: "custom", label: "Elegir" },
                          ] as { id: RecurrencePattern; label: string }[]
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setRecurrence(opt.id)}
                            className={cn(
                              "py-2 rounded-lg text-xs font-medium transition-all",
                              recurrence === opt.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-card/50 text-muted-foreground",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom days */}
                      <AnimatePresence>
                        {recurrence === "custom" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex justify-between pt-2">
                              {dayLabels.map((label, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => toggleDay(index)}
                                  className={cn(
                                    "h-9 w-9 rounded-full text-xs font-medium transition-all",
                                    daysOfWeek.includes(index)
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-card/50 text-muted-foreground",
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
                  </>
                ) : (
                  <>
                    {/* Date picker for one-time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>Fecha</span>
                      </div>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={format(new Date(), "yyyy-MM-dd")}
                        className="w-[10rem] h-9 text-sm"
                      />
                    </div>

                    {/* Time for one-time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Hora</span>
                      </div>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-[7.5rem] h-9 font-mono text-sm"
                      />
                    </div>

                    {/* Preview */}
                    {scheduledDate && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        📅{" "}
                        {format(
                          new Date(scheduledDate + "T12:00:00"),
                          "EEEE, d 'de' MMMM",
                          { locale: es },
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Notifications Section */}
              <div className="space-y-3 px-1 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                    <Bell className="h-4 w-4 text-primary" />
                    <span>Notificaciones</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addReminder}
                    className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {reminders.map((reminder, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <Input
                          type="number"
                          value={reminder.value}
                          onChange={(e) =>
                            updateReminder(
                              idx,
                              "value",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16 h-8 text-sm"
                          min={1}
                        />
                        <select
                          value={reminder.unit}
                          onChange={(e) =>
                            updateReminder(
                              idx,
                              "unit",
                              e.target.value as Reminder["unit"],
                            )
                          }
                          className="h-8 flex-1 rounded-md border border-input bg-background/50 px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none"
                        >
                          <option value="minutes">minutos antes</option>
                          <option value="hours">horas antes</option>
                          <option value="days">días antes</option>
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReminder(idx)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {reminders.length === 0 && (
                    <p className="text-xs text-muted-foreground italic px-1">
                      Sin recordatorios configurados
                    </p>
                  )}
                </div>
              </div>

              {/* Fixed Buttons */}
              <div className="shrink-0 px-4 py-4 border-t border-border/30 bg-background">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 h-12 gap-2 text-base"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !title.trim() ||
                      (taskType === "one-time" && !scheduledDate)
                    }
                  >
                    {isSubmitting ? (
                      "..."
                    ) : (
                      <>
                        {emoji} {editingRitual ? "Guardar" : "Crear"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
