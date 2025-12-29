import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { startOfDay, parseISO, isSameDay } from "date-fns";
import type {
  Ritual,
  RitualCompletion,
  RitualWithStatus,
  CreateRitualInput,
  UpdateRitualInput,
} from "../types";

// --- Helper Functions ---

/**
 * Check if a ritual should be active today based on recurrence
 */
function isRitualActiveToday(ritual: Ritual): boolean {
  const today = new Date().getDay(); // 0-6
  return ritual.days_of_week.includes(today);
}

/**
 * Check if current time is past the ritual's scheduled time
 */
function isRitualDue(ritual: Ritual): boolean {
  const now = new Date();
  const [hours, minutes] = ritual.time.split(":").map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  return now >= scheduledTime;
}

/**
 * Calculate streak from completion history
 */
function calculateStreak(
  completions: RitualCompletion[],
  ritualId: string,
): number {
  const ritualCompletions = completions
    .filter((c) => c.ritual_id === ritualId)
    .map((c) => startOfDay(parseISO(c.completed_at)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (ritualCompletions.length === 0) return 0;

  let streak = 0;
  let currentDate = startOfDay(new Date());

  // Check if completed today
  if (isSameDay(ritualCompletions[0], currentDate)) {
    streak = 1;
    currentDate = new Date(currentDate.getTime() - 86400000); // Previous day
  } else {
    // Check if missed today (only if past scheduled time)
    return 0;
  }

  // Count consecutive days backwards
  for (let i = 1; i < ritualCompletions.length; i++) {
    if (isSameDay(ritualCompletions[i], currentDate)) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

// --- Store Interface ---

interface RitualsState {
  rituals: Ritual[];
  completions: RitualCompletion[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  sync: () => Promise<void>;

  // Ritual CRUD
  addRitual: (input: CreateRitualInput) => Promise<string>;
  updateRitual: (id: string, updates: UpdateRitualInput) => Promise<void>;
  deleteRitual: (id: string) => Promise<void>;

  // Completion Actions
  completeRitual: (ritualId: string, note?: string) => Promise<void>;
  uncompleteRitual: (ritualId: string) => Promise<void>;

  // Computed Getters
  getTodaysRituals: () => RitualWithStatus[];
  getActiveRituals: () => Ritual[];
  getDailyProgress: () => {
    completed: number;
    total: number;
    percentage: number;
  };
  getRitualStreak: (ritualId: string) => number;
  getOverallStreak: () => number;
}

// --- Store Implementation ---

export const useRitualsStore = create<RitualsState>((set, get) => ({
  rituals: [],
  completions: [],
  isLoading: true,
  error: null,

  initialize: async () => {
    await get().sync();

    // Realtime Subscription
    supabase
      .channel("rituals-system")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rituals" },
        () => get().sync(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ritual_completions" },
        () => get().sync(),
      )
      .subscribe();
  },

  sync: async () => {
    set({ isLoading: true, error: null });

    try {
      const [ritualsRes, completionsRes] = await Promise.all([
        supabase.from("rituals").select("*").order("time", { ascending: true }),
        supabase
          .from("ritual_completions")
          .select("*")
          .gte(
            "completed_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ), // Last 30 days
      ]);

      if (ritualsRes.error) throw ritualsRes.error;
      if (completionsRes.error) throw completionsRes.error;

      set({
        rituals: ritualsRes.data || [],
        completions: completionsRes.data || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Rituals sync error:", error);
      set({
        error: error instanceof Error ? error.message : "Sync failed",
        isLoading: false,
      });
    }
  },

  addRitual: async (input) => {
    const id = uuidv4();
    const now = new Date().toISOString();

    const newRitual: Ritual = {
      id,
      user_id: "", // Will be set by RLS
      title: input.title,
      description: input.description,
      emoji: input.emoji || "✨",
      color: input.color || "#FF69B4",
      time: input.time,
      recurrence: input.recurrence || "daily",
      days_of_week: input.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      snooze_minutes: input.snooze_minutes || 10,
      is_active: true,
      streak_count: 0,
      best_streak: 0,
      created_at: now,
      updated_at: now,
      last_completed_at: null,
    };

    // Optimistic Update
    set((state) => ({ rituals: [...state.rituals, newRitual] }));

    try {
      const { error } = await supabase.from("rituals").insert({
        ...newRitual,
        user_id: undefined, // Let DB set via auth.uid()
      });

      if (error) throw error;
    } catch (error) {
      // Rollback
      set((state) => ({
        rituals: state.rituals.filter((r) => r.id !== id),
        error: error instanceof Error ? error.message : "Failed to add ritual",
      }));
      throw error;
    }

    return id;
  },

  updateRitual: async (id, updates) => {
    const originalRitual = get().rituals.find((r) => r.id === id);
    if (!originalRitual) return;

    const updatedRitual = {
      ...originalRitual,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Optimistic Update
    set((state) => ({
      rituals: state.rituals.map((r) => (r.id === id ? updatedRitual : r)),
    }));

    try {
      const { error } = await supabase
        .from("rituals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      // Rollback
      set((state) => ({
        rituals: state.rituals.map((r) => (r.id === id ? originalRitual : r)),
        error:
          error instanceof Error ? error.message : "Failed to update ritual",
      }));
      throw error;
    }
  },

  deleteRitual: async (id) => {
    const originalRituals = get().rituals;

    // Optimistic Update
    set((state) => ({
      rituals: state.rituals.filter((r) => r.id !== id),
    }));

    try {
      const { error } = await supabase.from("rituals").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      // Rollback
      set({
        rituals: originalRituals,
        error:
          error instanceof Error ? error.message : "Failed to delete ritual",
      });
      throw error;
    }
  },

  completeRitual: async (ritualId, note) => {
    const id = uuidv4();
    const now = new Date().toISOString();

    const newCompletion: RitualCompletion = {
      id,
      ritual_id: ritualId,
      completed_at: now,
      note,
    };

    // Optimistic Update
    set((state) => ({
      completions: [...state.completions, newCompletion],
    }));

    try {
      const { error } = await supabase
        .from("ritual_completions")
        .insert(newCompletion);

      if (error) throw error;

      // Update ritual's last_completed_at and streak
      const newStreak = get().getRitualStreak(ritualId);
      const ritual = get().rituals.find((r) => r.id === ritualId);

      if (ritual) {
        await get().updateRitual(ritualId, {
          // @ts-expect-error - extending type for internal use
          last_completed_at: now,
          streak_count: newStreak,
          best_streak: Math.max(ritual.best_streak, newStreak),
        });
      }
    } catch (error) {
      // Rollback
      set((state) => ({
        completions: state.completions.filter((c) => c.id !== id),
        error:
          error instanceof Error ? error.message : "Failed to complete ritual",
      }));
      throw error;
    }
  },

  uncompleteRitual: async (ritualId) => {
    const today = startOfDay(new Date());
    const todayCompletion = get().completions.find(
      (c) =>
        c.ritual_id === ritualId && isSameDay(parseISO(c.completed_at), today),
    );

    if (!todayCompletion) return;

    const originalCompletions = get().completions;

    // Optimistic Update
    set((state) => ({
      completions: state.completions.filter((c) => c.id !== todayCompletion.id),
    }));

    try {
      const { error } = await supabase
        .from("ritual_completions")
        .delete()
        .eq("id", todayCompletion.id);

      if (error) throw error;
    } catch (error) {
      // Rollback
      set({
        completions: originalCompletions,
        error:
          error instanceof Error
            ? error.message
            : "Failed to uncomplete ritual",
      });
      throw error;
    }
  },

  getTodaysRituals: () => {
    const { rituals, completions } = get();
    const today = startOfDay(new Date());

    return rituals
      .filter((r) => r.is_active && isRitualActiveToday(r))
      .map((ritual): RitualWithStatus => {
        const todayCompletion = completions.find(
          (c) =>
            c.ritual_id === ritual.id &&
            isSameDay(parseISO(c.completed_at), today),
        );

        return {
          ...ritual,
          completed_today: !!todayCompletion,
          is_due: isRitualDue(ritual),
          today_completion: todayCompletion,
        };
      })
      .sort((a, b) => {
        // Completed items go to bottom
        if (a.completed_today !== b.completed_today) {
          return a.completed_today ? 1 : -1;
        }
        // Due items first
        if (a.is_due !== b.is_due) {
          return a.is_due ? -1 : 1;
        }
        // Then by time
        return a.time.localeCompare(b.time);
      });
  },

  getActiveRituals: () => {
    return get().rituals.filter((r) => r.is_active);
  },

  getDailyProgress: () => {
    const todaysRituals = get().getTodaysRituals();
    const total = todaysRituals.length;
    const completed = todaysRituals.filter((r) => r.completed_today).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  },

  getRitualStreak: (ritualId) => {
    return calculateStreak(get().completions, ritualId);
  },

  getOverallStreak: () => {
    // Overall streak: consecutive days where ALL rituals were completed
    const { rituals, completions } = get();
    const activeRituals = rituals.filter((r) => r.is_active);

    if (activeRituals.length === 0) return 0;

    let streak = 0;
    let currentDate = startOfDay(new Date());

    while (true) {
      const allCompleted = activeRituals.every((ritual) =>
        completions.some(
          (c) =>
            c.ritual_id === ritual.id &&
            isSameDay(parseISO(c.completed_at), currentDate),
        ),
      );

      if (allCompleted) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 86400000);
      } else {
        break;
      }

      // Safety limit
      if (streak > 365) break;
    }

    return streak;
  },
}));
