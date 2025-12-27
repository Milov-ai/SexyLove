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

- [ ] Implement `BitmapLoader` helper in `CustomNotificationPlugin.kt`
  - _Context_: efficiently load Bitmaps for RemoteViews.
- [ ] Implement `showSupremeNotification` logic in `CustomNotificationPlugin.kt`
  - _Context_: Inflate RemoteViews, bind data, set PendingIntents.
- [ ] Handle Receiver callbacks in `MainActivity` or Plugin
  - _Context_: Emit `notificationAction` to JS.

## TypeScript Bridge

- [ ] Update `src/plugins/CustomNotification.ts` with `SupremeNotificationOptions` interface
- [ ] Update `src/services/NotificationService.ts` implementation
  - _Context_: Add `scheduleSupremeNotification` method.

## Verification

- [ ] Build Android Project
- [ ] Visual Verification (Layout correctness)
- [ ] Interaction Verification (Button clicks work)
