# Decisions Log

## 2025-12-27 - Architecture for Supreme Notifications

**Context**: The user requested a "Supreme Innovation" notification system comparable to YouTube/Temu.
**Decision**: Adopt `RemoteViews` for fully custom XML layouts instead of standard `NotificationCompat.Style`.
**Consequences**:

- **Pros**: Infinite customization (layouts, buttons, styling), Native performance.
- **Cons**: Higher complexity in Kotlin (managing RemoteViews), handling Image loading manually (no easy Glide integration in RemoteViews without AppWidgetTarget or manual Bitmap fetch).
- **Mitigation**: Will implement a simple synchronous or Coroutine-based Bitmap loader for RemoteViews.

## 2025-12-27 - Interaction Handling

**Context**: Need to handle buttons inside the notification (e.g., "Buy Now", "Reply").
**Decision**: Use a valid `BroadcastReceiver` (`NotificationReceiver`) registered in Manifest.
**Consequences**: Allows handling clicks without closing the notification shade or opening the app full-screen immediately.
