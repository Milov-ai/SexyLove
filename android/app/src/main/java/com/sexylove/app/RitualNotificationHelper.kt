package com.sexylove.app

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.util.Log
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

/**
 * Helper object for building and showing ritual notifications.
 * Uses the Supreme notification style with custom RemoteViews.
 */
object RitualNotificationHelper {
    
    private const val TAG = "RitualNotification"
    private const val CHANNEL_ID = "sexylove-rituals"
    
    /**
     * Show a ritual reminder notification with action buttons.
     */
    fun showRitualNotification(
        context: Context,
        ritualId: String,
        title: String,
        emoji: String,
        color: String
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notificationId = ritualId.hashCode()
        
        // Ensure channel exists (should be created in plugin, but just in case)
        createChannelIfNeeded(context, notificationManager)
        
        try {
            val bgColor = Color.parseColor(color)
            
            // Create RemoteViews for custom layout
            val remoteViews = RemoteViews(context.packageName, R.layout.notification_supreme)
            
            // Set background color
            remoteViews.setInt(R.id.notification_root, "setBackgroundColor", bgColor)
            
            // Set text content
            remoteViews.setTextViewText(R.id.notification_title, title)
            remoteViews.setTextViewText(R.id.notification_body, "¡Es hora de tu ritual! $emoji")
            remoteViews.setTextViewText(R.id.notification_emoji, emoji)
            
            // Create action intents
            val completeIntent = Intent(context, NotificationReceiver::class.java).apply {
                action = "com.sexylove.app.RITUAL_ACTION"
                putExtra("ritualId", ritualId)
                putExtra("actionType", "complete")
            }
            val completePendingIntent = PendingIntent.getBroadcast(
                context,
                "complete_$ritualId".hashCode(),
                completeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            val snoozeIntent = Intent(context, NotificationReceiver::class.java).apply {
                action = "com.sexylove.app.RITUAL_ACTION"
                putExtra("ritualId", ritualId)
                putExtra("actionType", "snooze")
            }
            val snoozePendingIntent = PendingIntent.getBroadcast(
                context,
                "snooze_$ritualId".hashCode(),
                snoozeIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            val skipIntent = Intent(context, NotificationReceiver::class.java).apply {
                action = "com.sexylove.app.RITUAL_ACTION"
                putExtra("ritualId", ritualId)
                putExtra("actionType", "skip")
            }
            val skipPendingIntent = PendingIntent.getBroadcast(
                context,
                "skip_$ritualId".hashCode(),
                skipIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Tap to open app
            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("ritualId", ritualId)
            }
            val openPendingIntent = PendingIntent.getActivity(
                context,
                ritualId.hashCode(),
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            // Build notification
            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setCustomContentView(remoteViews)
                .setCustomBigContentView(remoteViews)
                .setStyle(NotificationCompat.DecoratedCustomViewStyle())
                .setColor(bgColor)
                .setColorized(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(openPendingIntent)
                .addAction(0, "✓ Completar", completePendingIntent)
                .addAction(0, "🔔 Snooze", snoozePendingIntent)
                .addAction(0, "⏭ Saltar", skipPendingIntent)
                .build()
            
            notificationManager.notify(notificationId, notification)
            Log.d(TAG, "Showed notification for ritual: $ritualId")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error showing notification: ${e.message}", e)
            
            // Fallback to simple notification
            showSimpleNotification(context, notificationManager, notificationId, title, emoji, color)
        }
    }
    
    /**
     * Fallback simple notification if custom layout fails.
     */
    private fun showSimpleNotification(
        context: Context,
        notificationManager: NotificationManager,
        notificationId: Int,
        title: String,
        emoji: String,
        color: String
    ) {
        try {
            val bgColor = Color.parseColor(color)
            
            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle("$emoji $title")
                .setContentText("¡Es hora de tu ritual!")
                .setColor(bgColor)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .build()
            
            notificationManager.notify(notificationId, notification)
        } catch (e: Exception) {
            Log.e(TAG, "Even simple notification failed: ${e.message}")
        }
    }
    
    /**
     * Create notification channel if it doesn't exist.
     */
    private fun createChannelIfNeeded(context: Context, notificationManager: NotificationManager) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val existingChannel = notificationManager.getNotificationChannel(CHANNEL_ID)
            if (existingChannel == null) {
                val channel = android.app.NotificationChannel(
                    CHANNEL_ID,
                    "Rituales",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Recordatorios de rituales diarios"
                    enableLights(true)
                    enableVibration(true)
                    setShowBadge(true)
                }
                notificationManager.createNotificationChannel(channel)
                Log.d(TAG, "Created notification channel: $CHANNEL_ID")
            }
        }
    }
    
    /**
     * Cancel a specific ritual notification.
     */
    fun cancelNotification(context: Context, ritualId: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(ritualId.hashCode())
    }
}
