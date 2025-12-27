import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { ChameleonManager } from "@/features/chameleon/ChameleonManager";
import { toast } from "sonner";
import CustomNotification from "@/plugins/CustomNotification";

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private auraMap: Record<
    string,
    { color: string; emoji: string; icon: string }
  > = {
    AliasPideUnDeseo: {
      color: "#7C3AED",
      emoji: "✨",
      icon: "ic_notif_pide_un_deseo",
    },
    AliasNaaam: { color: "#F97316", emoji: "🍖", icon: "ic_notif_naaam" },
    AliasAzulinaa: { color: "#06B6D4", emoji: "💊", icon: "ic_notif_azulinaa" },
    AliasMuaah: { color: "#DB2777", emoji: "💋", icon: "ic_notif_muaah" },
    AliasTamuu: { color: "#FB7185", emoji: "🥰", icon: "ic_notif_tamuu" },
    AliasKissKiss: { color: "#C026D3", emoji: "💥", icon: "ic_notif_kisskiss" },
    AliasUuuf: { color: "#DC2626", emoji: "🫠", icon: "ic_notif_uuuf" },
    AliasPlop: { color: "#60A5FA", emoji: "🫧", icon: "ic_notif_plop" },
    AliasOops: { color: "#FBBF24", emoji: "🩹", icon: "ic_notif_oops" },
    AliasHohoho: { color: "#B91D1D", emoji: "🎅", icon: "ic_notif_hohoho" },
    AliasWow: { color: "#FACC15", emoji: "🤩", icon: "ic_notif_wow" },
    AliasXoxo: { color: "#F472B6", emoji: "❌⭕", icon: "ic_notif_xoxo" },
    AliasShhh: { color: "#4C1D95", emoji: "🤫", icon: "ic_notif_shhh" },
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
    toast.success("Servicio de Notificaciones Inicializado");
  }

  /**
   * Creates custom notification channels for Android.
   * This is required for custom sounds on Android 8.0+.
   */
  private async createChannels() {
    if (Capacitor.getPlatform() !== "android") return;

    try {
      await LocalNotifications.createChannel({
        id: "sexylove-default-v2", // Changed ID to reset config (sound was missing)
        name: "Alertas SexyLove",
        description: "Canal principal para notificaciones de SexyLove",
        importance: 5,
        visibility: 1,
        // sound: "sexy_alert.wav", // COMENTADO: El archivo no existe en res/raw y causa crash
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
      toast.error(`Error permisos: ${JSON.stringify(error)}`);
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
        icon: "ic_notif_pide_un_deseo", // Fallback icon
      };

      // Versión completa CON icono dinámico por identidad
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `Prueba SexyLove: ${activeIdentity.replace("Alias", "")} ${aura.emoji}`,
            body: "Esta es tu aura personalizada activa en este momento.",
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 500) },
            channelId: "sexylove-default-v2",
            smallIcon: aura.icon, // Icono dinámico por identidad (48x48px)
            color: aura.color, // Color de aura / acento

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        ],
      });
      console.log(`Test notification scheduled with aura: ${activeIdentity}`);
      toast.success(`Notificación programada: ${activeIdentity}`);
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast.error(`Error al programar: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Checks if a string contains the magic keyword to trigger a notification.
   */
  public checkKeyword(text: string) {
    if (text.toUpperCase().includes("ALERTA")) {
      toast.info("Palabra clave detectada: ALERTA");
      this.scheduleCustomNotification(); // Use custom colorized notification
    } else if (text.toUpperCase().includes("SUPREME")) {
      toast.success("Modo SUPREME activado");
      this.scheduleSupremeNotification();
    }
  }

  /**
   * Schedules a FULLY CUSTOM notification with colored background and text.
   * Uses native Android RemoteViews for Temu/YouTube Music style notifications.
   */
  public async scheduleCustomNotification() {
    if (!Capacitor.isNativePlatform()) {
      toast.info("Custom notifications only work on Android");
      return;
    }

    try {
      const activeIdentity = ChameleonManager.getCurrentIdentity();
      const aura = this.auraMap[activeIdentity] || {
        color: "#FF69B4",
        emoji: "✨",
        icon: "ic_notif_pide_un_deseo",
      };

      // Nombre limpio de la identidad (sin el prefijo "Alias")
      const identityName = activeIdentity.replace("Alias", "");

      await CustomNotification.showCustomNotification({
        title: `¡Mensaje Especial! ${aura.emoji}`,
        body: "Tu amor secreto te ha enviado algo extraordinario.",
        identityName: identityName, // Se muestra como "nombre de app"
        emoji: aura.emoji, // Emoji decorativo
        backgroundColor: aura.color,
        textColor: "#FFFFFF",
        icon: aura.icon,
      });

      console.log(`Premium notification sent with identity: ${identityName}`);
      toast.success(`Notificación premium: ${identityName}`);
    } catch (error) {
      console.error("Error sending premium notification:", error);
      toast.error(`Error premium: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Schedules a SUPREME notification (YouTube/Temu Style).
   */
  public async scheduleSupremeNotification() {
    if (!Capacitor.isNativePlatform()) {
      toast.info("Supreme notifications only work on Android");
      return;
    }

    try {
      const activeIdentity = ChameleonManager.getCurrentIdentity();
      const aura = this.auraMap[activeIdentity] || {
        color: "#FF69B4",
        emoji: "✨",
        icon: "ic_notif_pide_un_deseo",
      };

      const identityName = activeIdentity.replace("Alias", "");

      // Example Hero Image (e.g., from a CDN or local asset URL)
      // Using a placeholder image for testing
      const heroImage = "https://picsum.photos/600/300";

      await CustomNotification.showCustomNotification({
        title: `SUPREME ALERT ${aura.emoji}`,
        body: "Touching this notification triggers a custom broadcast event.",
        identityName: identityName,
        emoji: aura.emoji,
        backgroundColor: aura.color,
        icon: aura.icon,
        style: "supreme",
        heroImage: heroImage,
        actions: [{ id: "action_view", label: "View" }],
      });

      console.log(`Supreme notification sent with identity: ${identityName}`);
      toast.success(`Notificación SUPREME enviada`);
    } catch (error) {
      console.error("Error sending supreme notification:", error);
      toast.error(`Error supreme: ${JSON.stringify(error)}`);
    }
  }
}

export const notificationService = NotificationService.getInstance();
