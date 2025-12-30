import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { ChameleonManager } from "@/features/chameleon/ChameleonManager";
import { toast } from "sonner";
import CustomNotification from "@/plugins/CustomNotification";
import { THEMES, HEX_TO_THEME_ID, type ThemeId } from "@/lib/theme-constants";
import { logger } from "./DebugLogger";

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

      // Listen to notification actions

      (
        CustomNotification as unknown as {
          addListener: (
            event: string,
            callback: (data: {
              actionId: string;
              notification?: { ritualId?: string };
            }) => void,
          ) => void;
        }
      ).addListener(
        "notificationActionPerformed",
        async (data: {
          actionId: string;
          notification?: { ritualId?: string };
        }) => {
          logger.log("Notificación accionada", data);
          if (
            data.actionId === "action_complete" &&
            data.notification?.ritualId
          ) {
            try {
              // We need to import the store dynamically to avoid circular dependencies
              const { useRitualsStore } =
                await import("@/features/rituals/store/rituals.store");
              const store = useRitualsStore.getState();
              await store.completeRitual(data.notification.ritualId);
              toast.success("Tarea completada desde la notificación");
            } catch (error) {
              console.error("Error al completar desde noti:", error);
            }
          }
        },
      );
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
        id: "sexylove-default-v3", // Bump version to ensure update
        name: "Alertas SexyLove Premium",
        description: "Canal premium con soporte de colores y acciones",
        importance: 5,
        visibility: 1,
        lights: true,
        lightColor: "#FF69B4",
        vibration: true,
      });
      console.log("Notification channels created");
      logger.log("Canal de notificaciones creado: sexylove-default-v3");
    } catch (error) {
      console.error("Error creating notification channels:", error);
      logger.error("Error creando canales", error);
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
      logger.error("Error solicitando permisos", error);
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
            channelId: "sexylove-default-v3",
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

  /**
   * Schedules a SUPREME notification (YouTube/Temu Style).
   */
  public async scheduleSupremeNotification() {
    // ... existing implementation ...
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

  /**
   * Sends an immediate test notification with the ritual's calculated theme color.
   */
  public async testRitualNotification(ritual: {
    id: string;
    title: string;
    emoji: string;
    color: string;
  }) {
    if (!Capacitor.isNativePlatform()) {
      toast.info("Prueba Web: " + ritual.title);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`${ritual.emoji} ${ritual.title}`, {
          body: "Prueba de color",
        });
      }
      return;
    }

    try {
      // Resolve color from theme constants
      const isHex = ritual.color.startsWith("#");
      // Determine ThemeId
      const themeId = isHex
        ? (HEX_TO_THEME_ID[ritual.color] as ThemeId)
        : (ritual.color as ThemeId);

      const theme = themeId && THEMES[themeId] ? THEMES[themeId] : null;
      // Get the display hex color
      const displayColor = theme ? theme.hex : isHex ? ritual.color : "#F97316";

      // Get current identity for correct icon/name
      const activeIdentity = ChameleonManager.getCurrentIdentity();
      const aura = this.auraMap[activeIdentity] || {
        color: "#FF69B4",
        emoji: "✨",
        icon: "ic_notif_pide_un_deseo",
      };

      const identityName = activeIdentity.replace("Alias", "");

      await CustomNotification.showCustomNotification({
        title: `${ritual.emoji} ${ritual.title}`,
        body: "Toca para ver detalles o completar ahora.",
        identityName: identityName,
        emoji: ritual.emoji,
        backgroundColor: displayColor,
        textColor: "#FFFFFF",
        icon: aura.icon,
        ritualId: ritual.id,
        style: "premium",
        actions: [{ id: "action_complete", label: "Marcar como hecho ✅" }],
      });
      toast.success("Prueba de notificación enviada con aura activa");
      logger.log("Notificación de prueba enviada", {
        ritualId: ritual.id,
        displayColor,
      });
    } catch (error) {
      console.error("Error testing notification:", error);
      logger.error("Error en testRitualNotification", error);
      toast.error("Error al probar notificación");
    }
  }
}

export const notificationService = NotificationService.getInstance();
