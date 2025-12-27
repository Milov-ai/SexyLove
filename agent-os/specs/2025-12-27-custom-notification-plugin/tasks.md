# Tasks: Custom Notification Plugin

## Setup

- [x] Create feature branch `feature/custom-notification-plugin`
- [x] Verify `AndroidManifest.xml` is writable

## Native Android (Layouts & Manifest)

- [x] Create `notification_supreme.xml` in `android/app/src/main/res/layout/`
  - _Context_: Custom RemoteViews layout with Header, Body, Image, Action Grid.
- [x] Create `NotificationReceiver.kt` in `android/app/src/main/java/com/sexylove/app/`
  - _Context_: BroadcastReceiver to intercept clicks.
- [x] Register `NotificationReceiver` in `AndroidManifest.xml`

## Native Android (Plugin Logic)

- [x] Implement `BitmapLoader` helper in `CustomNotificationPlugin.kt`
  - _Context_: efficiently load Bitmaps for RemoteViews.
- [x] Implement `showSupremeNotification` logic in `CustomNotificationPlugin.kt`
  - _Context_: Inflate RemoteViews, bind data, set PendingIntents.
- [x] Handle Receiver callbacks in `MainActivity` or Plugin
  - _Context_: Emit `notificationAction` to JS.

## TypeScript Bridge

- [x] Update `src/plugins/CustomNotification.ts` with `SupremeNotificationOptions` interface
- [x] Update `src/services/NotificationService.ts` implementation
  - _Context_: Add `scheduleSupremeNotification` method.
- [x] Refine Supreme Notification (Dynamic background color support)

## Verification

- [x] Build Android Project
- [x] Visual Verification (Layout correctness)
- [x] Interaction Verification (Button clicks work)
