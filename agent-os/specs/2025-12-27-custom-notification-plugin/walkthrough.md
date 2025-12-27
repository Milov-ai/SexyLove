# Walkthrough: Supreme Custom Notifications

## Feature Overview

We have implemented a "Supreme" custom notification system for Android, enabling rich, interactive, and completely custom UI layouts for notifications, comparable to apps like YouTube or Temu.

## Changes Implemented

### 1. Native Android Components

- **Layout**: `android/app/src/main/res/layout/notification_supreme.xml`
  - A `RemoteViews` layout featuring a Hero/Icon slot, Title, Body, Emoji accent, and interaction area.
- **Receiver**: `com.sexylove.app.NotificationReceiver`
  - Intercepts notification clicks (`ACTION_NOTIFICATION_CLICK`) and broadcasts them to the Capacitor plugin.
- **Manifest**: Updated `AndroidManifest.xml`
  - Registered `<receiver android:name=".NotificationReceiver" ... />`.
- **Supreme Refinement**: Added dynamic background color support to the root layout (`notification_root`).

### 2. Plugin Logic (`CustomNotificationPlugin.kt`)

- **Supreme Mode**: Added `showSupremeNotification` method.
- **RemoteViews Inflation**: logic to load the custom XML and bind data.
- **Async Image Loading**: `BitmapLoader` helper to fetch images from URLs on a background thread.
- **Static Event Bus**: `notifyListenersStatic` to bridge Native Broadcasts to JS Listeners.

### 3. TypeScript Bridge

- **Interface**: Updated `CustomNotificationOptions` to support `style: 'supreme'`, `heroImage`, and `actions`.
- **Service**: Added `NotificationService.scheduleSupremeNotification()` to demonstrate the feature.

## Verification Guide

### Prerequisites

> [!IMPORTANT]
> **Environment Resolved**: The build was successfully executed using the Android Studio bundled JDK 21 found at `C:\Program Files\Android\Android Studio\jbr`.

### 1. Build the Project

Once the Java environment is updated:

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

### 2. Visual Verification

1.  Launch the App.
2.  Trigger the "Supreme" notification (via Console or hidden UI trigger if implemented).
3.  **Expectation**:
    - A notification appears with a customized layout (not the standard system style).
    - The layout should match `notification_supreme.xml` (Pink accent, Emoji, etc.).

### 3. Interaction Verification

1.  Click on the Notification body.
2.  **Expectation**:
    - The app should receive a `notificationAction` event.
    - The `NotificationReceiver` logs `Action received` in Logcat.
    - The JS console logs `Supreme notification click detected`.

## Troubleshooting

- **Build Fails**: Check `JAVA_HOME` points to JDK 17.
- **Image not showing**: Ensure the URL is accessible and valid.
- **Clicks not registered**: Verify `AndroidManifest.xml` has the receiver with `exported="true"`.
