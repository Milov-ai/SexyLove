import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

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
   * Schedules a local notification.
   */
  public async scheduleTestNotification() {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Prueba de SexyLove ✨",
            body: "Esta es una notificación personalizada con sonido y estilo.",
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: "sexylove-default",
            smallIcon: "ic_stat_notification", // Debe existir en res/drawable
            actionTypeId: "",
            extra: null,
          },
        ],
      });
      console.log("Test notification scheduled");
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
