# Technical Specification: Supreme Custom Notification Plugin

## Overview

Elevate the application's notification experience to a "World-Class" level (comparable to YouTube/Temu) using Native Android `RemoteViews`. This allows for completely custom layouts, interactive buttons, and branded aesthetics that bypass standard system limitations where possible.

---

## Architecture

### 1. Native Layouts (XML)

We will bypass the standard `NotificationCompat.Builder` styles and use `RemoteViews` to inflate a custom XML layout.

- **Location**: `android/app/src/main/res/layout/notification_supreme.xml`
- **Structure**:
  - Root: `RelativeLayout` (or `ConstraintLayout` if feasible with RemoteViews, usually `RelativeLayout`/`LinearLayout` is safer for RemoteViews compatibility).
  - **Header**: Identity Name + Decor Emoji (Custom Font/Color).
  - **Body**: Main message text.
  - **Hero Image (Optional)**: Large `ImageView` for rich media/promos.
  - **Action Grid**: `LinearLayout` containing up to 3 action buttons (e.g., "Reply", "View", "Shop").
  - **Decor**: Background color tinting.

### 2. Android Manifest

Register a `BroadcastReceiver` to handle notification interactions without opening the app activity immediately (unless requested).

```xml
<receiver android:name=".NotificationReceiver" android:exported="false">
    <intent-filter>
        <action android:name="com.sexylove.app.ACTION_NOTIFICATION_CLICK" />
        <action android:name="com.sexylove.app.ACTION_NOTIFICATION_DISMISS" />
    </intent-filter>
</receiver>
```

### 3. Kotlin Implementation

#### `CustomNotificationPlugin.kt`

- **Method**: `show(options)`
  - **Params**: `title`, `body`, `layout` ("supreme"), `actions` (array), `images`, `colors`.
  - **Logic**:
    1. Resolve `R.layout.notification_supreme`.
    2. Create `RemoteViews`.
    3. Bind data (Text, Colors, Images).
    4. Bind Actions: Loop through `actions` and set `setOnClickPendingIntent` for each button ID (pre-defined in XML like `btn_action_1`, `btn_action_2`).
    5. Build & Notify.

#### `NotificationReceiver.kt`

- **Role**: Intercepts clicks.
- **Logic**:
  - Extract `actionId` from Intent extras.
  - Forward event to `CustomNotificationPlugin` (via static instance or EventBus).
  - Plugin emits `notificationAction` event to JS.
  - Optionally dismiss notification.

### 4. TypeScript Interface (Bridge)

#### `src/plugins/CustomNotification.ts`

```typescript
interface SupremeNotificationOptions {
  title: string;
  body: string;
  identity: string;
  emoji: string;
  palette: {
    background: string;
    text: string;
    accent: string;
  };
  images?: {
    hero?: string; // URL or asset
    thumbnail?: string;
  };
  actions?: {
    id: string;
    label: string;
    icon?: string;
  }[];
}
```

---

## Implementation Steps

### Phase 1: Native Assets

1.  **[NEW]** `android/app/src/main/res/layout/notification_supreme.xml`: The detailed XML layout.
2.  **[NEW]** `android/app/src/main/java/com/sexylove/app/NotificationReceiver.kt`: The interaction handler.
3.  **[MODIFY]** `android/app/src/main/AndroidManifest.xml`: Register receiver.

### Phase 2: Plugin Logic

4.  **[MODIFY]** `CustomNotificationPlugin.kt`: Rewrite `showCustomNotification` to support `RemoteViews`.
    - Add image loading helper (using `BitmapFactory.decodeFile` or `URL`).
    - Add `RemoteViews` inflation logic.

### Phase 3: JS Layer

5.  **[MODIFY]** `src/plugins/CustomNotification.ts`: Update type definitions.
6.  **[MODIFY]** `src/services/NotificationService.ts`: Add `scheduleSupremeNotification` method using new options.

## Verification Plan

### Automated

- Build verification: `npx cap sync android && cd android && ./gradlew assembleDebug`.

### Manual

1.  **Layout Test**: Trigger "Supreme Notification" from Dev Menu. Verify custom layout matches "YouTube" style (custom buttons, colors).
2.  **Interaction Test**: Click an action button. Verify Toast/Log in App (Foreground) or App Open (Background).
3.  **Persistence**: Reboot device (optional) or Swipe away (verify non-dismissible if sticky).
