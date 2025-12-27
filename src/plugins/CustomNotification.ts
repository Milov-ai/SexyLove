import { registerPlugin } from "@capacitor/core";

export interface CustomNotificationOptions {
  title: string;
  body: string;
  identityName: string;
  emoji: string;
  backgroundColor: string; // Color de fondo (#RRGGBB)
  textColor?: string; // Color del texto (#RRGGBB)
  icon?: string;

  // Supreme Options
  style?: "standard" | "supreme";
  heroImage?: string; // URL o Ruta
  actions?: { id: string; label: string }[];
}

export interface CustomNotificationPlugin {
  showCustomNotification(options: CustomNotificationOptions): Promise<void>;
}

const CustomNotification =
  registerPlugin<CustomNotificationPlugin>("CustomNotification");

export default CustomNotification;
