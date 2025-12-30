import { registerPlugin } from "@capacitor/core";

export interface CustomNotificationOptions {
  title: string;
  body: string;
  identityName: string;
  emoji: string;
  backgroundColor: string; // Color de fondo (#RRGGBB)
  textColor?: string; // Color del texto (#RRGGBB)
  icon?: string;
  ritualId?: string;
  payload?: unknown;

  // Supreme Options
  style?: "standard" | "supreme" | "premium";
  heroImage?: string; // URL o Ruta
  actions?: { id: string; label: string }[];
}

// Ritual Alarm Options
export interface RitualAlarmOptions {
  ritualId: string;
  hour: number;
  minute: number;
  title: string;
  emoji: string;
  color: string;
}

export interface ScheduledRitualInfo {
  hour: number;
  minute: number;
  title: string;
  emoji: string;
  color: string;
}

export interface CustomNotificationPlugin {
  showCustomNotification(options: CustomNotificationOptions): Promise<void>;

  // Ritual Alarm Methods
  scheduleRitualAlarm(options: RitualAlarmOptions): Promise<void>;
  cancelRitualAlarm(options: { ritualId: string }): Promise<void>;
  getScheduledRituals(): Promise<Record<string, ScheduledRitualInfo>>;
}

const CustomNotification =
  registerPlugin<CustomNotificationPlugin>("CustomNotification");

export default CustomNotification;
