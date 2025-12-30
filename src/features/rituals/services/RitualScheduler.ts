// src/features/rituals/services/RitualScheduler.ts
// Service for scheduling ritual alarms via native bridge

import { Capacitor } from "@capacitor/core";
import CustomNotification from "@/plugins/CustomNotification";
import type { Ritual } from "../types";

/**
 * Service for managing ritual alarm scheduling.
 * Uses native AlarmManager on Android, falls back to in-memory on web.
 */
export class RitualSchedulerService {
  private static instance: RitualSchedulerService;
  private webTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  private constructor() {}

  public static getInstance(): RitualSchedulerService {
    if (!RitualSchedulerService.instance) {
      RitualSchedulerService.instance = new RitualSchedulerService();
    }
    return RitualSchedulerService.instance;
  }

  /**
   * Schedule an alarm for a ritual.
   * On Android: Uses AlarmManager for reliable background scheduling.
   * On Web: Uses setTimeout (only works while tab is open).
   */
  async scheduleRitual(ritual: Ritual): Promise<void> {
    const [hour, minute] = ritual.time.split(":").map(Number);

    if (Capacitor.isNativePlatform()) {
      try {
        await CustomNotification.scheduleRitualAlarm({
          ritualId: ritual.id,
          hour,
          minute,
          title: ritual.title,
          emoji: ritual.emoji,
          color: ritual.color,
        });
        console.log(
          `[RitualScheduler] Scheduled native alarm for ${ritual.id} at ${ritual.time}`,
        );
      } catch (error) {
        console.error(
          "[RitualScheduler] Failed to schedule native alarm:",
          error,
        );
        throw error;
      }
    } else {
      // Web fallback: schedule with setTimeout
      this.scheduleWebNotification(ritual, hour, minute);
    }
  }

  /**
   * Cancel a scheduled ritual alarm.
   */
  async cancelRitual(ritualId: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await CustomNotification.cancelRitualAlarm({ ritualId });
        console.log(`[RitualScheduler] Cancelled native alarm for ${ritualId}`);
      } catch (error) {
        console.error(
          "[RitualScheduler] Failed to cancel native alarm:",
          error,
        );
      }
    } else {
      // Web fallback: clear timeout
      const timeout = this.webTimeouts.get(ritualId);
      if (timeout) {
        clearTimeout(timeout);
        this.webTimeouts.delete(ritualId);
        console.log(`[RitualScheduler] Cancelled web timeout for ${ritualId}`);
      }
    }
  }

  /**
   * Reschedule all active rituals.
   * Useful after app restart or ritual updates.
   */
  async rescheduleAll(rituals: Ritual[]): Promise<void> {
    const activeRituals = rituals.filter((r) => r.is_active);

    for (const ritual of activeRituals) {
      await this.scheduleRitual(ritual);
    }

    console.log(
      `[RitualScheduler] Rescheduled ${activeRituals.length} rituals`,
    );
  }

  /**
   * Get all currently scheduled rituals from native storage.
   */
  async getScheduledRituals(): Promise<
    Record<string, { hour: number; minute: number; title: string }>
  > {
    if (Capacitor.isNativePlatform()) {
      try {
        return await CustomNotification.getScheduledRituals();
      } catch (error) {
        console.error(
          "[RitualScheduler] Failed to get scheduled rituals:",
          error,
        );
        return {};
      }
    }

    // Web: return from in-memory map
    const result: Record<
      string,
      { hour: number; minute: number; title: string }
    > = {};
    // Note: Web doesn't persist, so this will be empty after refresh
    return result;
  }

  /**
   * Schedule a web notification using setTimeout.
   * Only works while the browser tab is open.
   */
  private scheduleWebNotification(
    ritual: Ritual,
    hour: number,
    minute: number,
  ): void {
    // Clear existing timeout if any
    const existing = this.webTimeouts.get(ritual.id);
    if (existing) {
      clearTimeout(existing);
    }

    // Calculate delay until scheduled time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      this.showWebNotification(ritual);
      // Reschedule for tomorrow
      this.scheduleWebNotification(ritual, hour, minute);
    }, delay);

    this.webTimeouts.set(ritual.id, timeout);
    console.log(
      `[RitualScheduler] Scheduled web notification for ${ritual.id} in ${Math.round(delay / 1000 / 60)} minutes`,
    );
  }

  /**
   * Show a web notification using the Notification API.
   */
  private async showWebNotification(ritual: Ritual): Promise<void> {
    if (!("Notification" in window)) {
      console.warn("[RitualScheduler] Web notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("[RitualScheduler] Notification permission denied");
        return;
      }
    }

    new Notification(`${ritual.emoji} ${ritual.title}`, {
      body: "¡Es hora de tu ritual!",
      icon: "/icon.png",
      tag: ritual.id,
    });
  }
}

// Export singleton instance
export const ritualScheduler = RitualSchedulerService.getInstance();
