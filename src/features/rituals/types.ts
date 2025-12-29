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

  // Scheduling
  time: string; // "HH:MM" format
  recurrence: RecurrencePattern;
  days_of_week: number[]; // 0-6, where 0 = Sunday
  snooze_minutes: number;

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
  time: string;
  recurrence?: RecurrencePattern;
  days_of_week?: number[];
  snooze_minutes?: number;
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
  "#FF69B4", // Hot Pink (default)
  "#7C3AED", // Electric Violet
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#FBBF24", // Amber
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
