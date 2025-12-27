import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { ChameleonManager } from "@/features/chameleon/ChameleonManager";

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private auraMap: Record<string, { color: string; emoji: string }> = {
    AliasPideUnDeseo: { color: "#7C3AED", emoji: "✨" },
    AliasNaaam: { color: "#F97316", emoji: "🍖" },
    AliasAzulinaa: { color: "#06B6D4", emoji: "💊" },
    AliasMuaah: { color: "#DB2777", emoji: "💋" },
    AliasTamuu: { color: "#FB7185", emoji: "🥰" },
    AliasKissKiss: { color: "#C026D3", emoji: "💥" },
    AliasUuuf: { color: "#DC2626", emoji: "🫠" },
    AliasPlop: { color: "#60A5FA", emoji: "🫧" },
    AliasOops: { color: "#FBBF24", emoji: "🩹" },
    AliasHohoho: { color: "#B91D1D", emoji: "🎅" },
    AliasWow: { color: "#FACC15", emoji: "🤩" },
    AliasXoxo: { color: "#F472B6", emoji: "❌⭕" },
    AliasShhh: { color: "#4C1D95", emoji: "🤫" },
  };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initializes the notification service.
   * Creates channels and requests permissions.
   */
  public async initialize() {
    if (this.isInitialized) return;

    if (Capacitor.isNativePlatform()) {
      await this.createChannels();
      await this.requestPermissions();
    }

    this.isInitialized = true;
    console.log("NotificationService initialized");
  }

  /**
   * Creates custom notification channels for Android.
   * This is required for custom sounds on Android 8.0+.
   */
  private async createChannels() {
    if (Capacitor.getPlatform() !== "android") return;

    try {
      await LocalNotifications.createChannel({
        id: "sexylove-default",
        name: "Alertas SexyLove",
        description: "Canal principal para notificaciones de SexyLove",
        importance: 5,
        visibility: 1,
        sound: "sexy_alert.wav", // Referencia a res/raw/sexy_alert.wav
        lights: true,
        lightColor: "#FF69B4", // Hot Pink
        vibration: true,
      });
      console.log("Notification channels created");
    } catch (error) {
      console.error("Error creating notification channels:", error);
    }
  }

  /**
   * Requests notification permissions from the user.
   */
  public async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const permLocal = await LocalNotifications.requestPermissions();
      const permPush = await PushNotifications.requestPermissions();

      return permLocal.display === "granted" || permPush.receive === "granted";
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  /**
   * Schedules a local notification with dynamic aura styling.
   */
  public async scheduleTestNotification() {
    try {
      const activeIdentity = ChameleonManager.getCurrentIdentity();
      const aura = this.auraMap[activeIdentity] || {
        color: "#FF69B4",
        emoji: "✨",
      };

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `Prueba SexyLove: ${activeIdentity.replace("Alias", "")} ${aura.emoji}`,
            body: "Esta es tu aura personalizada activa en este momento.",
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: "sexylove-default",
            smallIcon: "ic_stat_notification", // Podríamos mapear a iconos específicos si existieran
            color: aura.color, // Color de aura / acento
            actionTypeId: "",
            extra: null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        ],
      });
      console.log(`Test notification scheduled with aura: ${activeIdentity}`);
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  /**
   * Checks if a string contains the magic keyword to trigger a notification.
   */
  public checkKeyword(text: string) {
    if (text.toUpperCase().includes("ALERTA")) {
      this.scheduleTestNotification();
    }
  }
}

export const notificationService = NotificationService.getInstance();
