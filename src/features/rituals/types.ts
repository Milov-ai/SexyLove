// src/features/rituals/types.ts
// Type definitions for the Daily Rituals System

/**
 * Recurrence pattern for rituals
 * - daily: Every day
 * - weekdays: Monday to Friday
 * - weekends: Saturday and Sunday
 * - custom: Specific days selected
 */
export type RecurrencePattern = "daily" | "weekdays" | "weekends" | "custom";

/**
 * Task type
 * - recurring: Repeated task (daily, weekly, custom days)
 * - one-time: Single occurrence on specific date
 */
export type TaskType = "recurring" | "one-time";

export interface Reminder {
  value: number;
  unit: "minutes" | "hours" | "days";
}

/**
 * Core Ritual entity
 */
export interface Ritual {
  id: string;
  user_id: string;

  // Content
  title: string;
  description?: string;
  emoji: string;
  color: string;

  // Task type
  type: TaskType;

  // For recurring tasks
  time: string; // "HH:MM" format
  recurrence: RecurrencePattern;
  days_of_week: number[]; // 0-6, where 0 = Sunday
  snooze_minutes: number;

  // For one-time tasks
  scheduled_date?: string; // "YYYY-MM-DD" format
  scheduled_time?: string; // "HH:MM" format

  // Notifications
  reminders?: Reminder[];

  // State
  is_active: boolean;
  streak_count: number;
  best_streak: number;

  // Metadata
  created_at: string;
  updated_at: string;
  last_completed_at: string | null;
}

/**
 * Ritual completion record
 */
export interface RitualCompletion {
  id: string;
  ritual_id: string;
  completed_at: string; // ISO timestamp
  note?: string;
}

/**
 * Extended Ritual with computed status
 */
export interface RitualWithStatus extends Ritual {
  /** Whether the ritual was completed today */
  completed_today: boolean;
  /** Whether current time >= scheduled time */
  is_due: boolean;
  /** Today's completion record if exists */
  today_completion?: RitualCompletion;
}

/**
 * Input for creating a new ritual
 */
export interface CreateRitualInput {
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  type?: TaskType;
  // For recurring
  time?: string;
  recurrence?: RecurrencePattern;
  days_of_week?: number[];
  snooze_minutes?: number;
  // For one-time
  scheduled_date?: string;
  scheduled_time?: string;
}

/**
 * Input for updating an existing ritual
 */
export interface UpdateRitualInput extends Partial<CreateRitualInput> {
  is_active?: boolean;
}

/**
 * Native alarm scheduling options
 */
export interface RitualAlarmOptions {
  ritualId: string;
  hour: number;
  minute: number;
  title: string;
  emoji: string;
  color: string;
}

/**
 * Curated emoji set for rituals
 */
export const RITUAL_EMOJIS = [
  // Morning
  "🌅",
  "☀️",
  "🧘",
  "💪",
  "🏃",
  // Productivity
  "📚",
  "💻",
  "✍️",
  "🎯",
  "📊",
  // Health
  "💊",
  "🥗",
  "💧",
  "😴",
  "🧘‍♀️",
  // Creative
  "🎨",
  "🎵",
  "📷",
  "✨",
  "🌟",
  // Self-care
  "🛁",
  "💆",
  "🧖",
  "💅",
  "🌸",
  // Social
  "💬",
  "📞",
  "🤝",
  "❤️",
  "👨‍👩‍👧",
  // Special
  "🔥",
  "⚡",
  "🌙",
  "🌈",
  "🎁",
] as const;

/**
 * Default colors for rituals (matching brand palette)
 */
export const RITUAL_COLORS = [
  "#F97316", // Aura Sunset (Orange)
  "#14B8A6", // Aura Mystic (Teal)
  "#3B82F6", // Aura Galaxy (Blue)
  "#84CC16", // Aura Toxic (Lime)
  "#6366F1", // Aura Pluto (Indigo)
  "#EC4899", // Aura Love (Pink)
  "#22D3EE", // Neon Cyber (Cyan)
  "#A78BFA", // Neon Ultraviolet (Violet)
] as const;

/**
 * Default values for new rituals
 */
export const RITUAL_DEFAULTS = {
  emoji: "✨",
  color: "#FF69B4",
  recurrence: "daily" as RecurrencePattern,
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  snooze_minutes: 10,
  is_active: true,
  streak_count: 0,
  best_streak: 0,
};
