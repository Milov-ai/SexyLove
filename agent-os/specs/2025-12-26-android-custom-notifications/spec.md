# Spec: Android Custom Notifications

## Goal

Verify and implement highly customized notifications on Android using Capacitor for SexyLove. This includes custom icons, sounds, and investigating "Custom Layouts".

## Technical Discovery

- **Platform**: Capacitor 7 (Android).
- **Plugins**: `@capacitor/local-notifications` and `@capacitor/push-notifications`.
- **Custom Icons**: Supported via `res/drawable`. Small icons must be white on transparent.
- **Custom Sounds**: Supported via `res/raw`. Requires **Notification Channels** for Android 8.0+.
- **Custom Layouts**: Limited support in standard plugins. Full customization requires native `RemoteViews` or specific community plugins if available.

## Proposed Implementation Plan

### 1. Asset Preparation

- **Icons**: Generate notification icons using Android Asset Studio. Place in `android/app/src/main/res/drawable-*`.
- **Sounds**: Place `.wav` files in `android/app/src/main/res/raw/`.

### 2. Plugin Installation

```bash
npm install @capacitor/local-notifications @capacitor/push-notifications
npx cap sync android
```

### 3. Notification Channel Configuration (Critical for Android 8+)

Implement a service to create channels on app initialization:

```typescript
import { LocalNotifications } from "@capacitor/local-notifications";

async function createNotificationChannel() {
  await LocalNotifications.createChannel({
    id: "custom-channel",
    name: "SexyLove Notifications",
    description: "Canal para notificaciones personalizadas",
    importance: 5,
    sound: "sexy_alert.wav", // Referencia a res/raw/sexy_alert.wav
    visibility: 1,
    lights: true,
    lightColor: "#FF0000",
  });
}
```

### 4. Triggering Notifications

```typescript
await LocalNotifications.schedule({
  notifications: [
    {
      title: "¡Nuevo mensaje!",
      body: "Tienes una nueva interacción en SexyLove",
      id: 1,
      channelId: "custom-channel",
      smallIcon: "ic_stat_notification", // Referencia a res/drawable
      largeIcon: "res://icon",
    },
  ],
});
```

## Security & Permissions

- Request `notifications` permission on app start or before scheduling.
- Ensure `AndroidManifest.xml` includes necessary metadata for default icons/colors.

## Definition of Done

- [x] Feasibility analysis completed.
- [ ] Plugins installed and synced.
- [ ] Assets placed in Android resource folders.
- [ ] Notification channels successfully created and verified.
- [ ] Test notification displayed with custom icon and sound.
- [ ] Build passes for Android.
