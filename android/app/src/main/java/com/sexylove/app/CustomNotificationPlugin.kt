package com.sexylove.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Build
import android.util.Log
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

@CapacitorPlugin(name = "CustomNotification")
class CustomNotificationPlugin : Plugin() {

    private val TAG = "CustomNotification"
    private val channelId = "sexylove-premium"
    private val channelName = "SexyLove Premium Alerts"
    private val executor = Executors.newCachedThreadPool()

    companion object {
        var instance: CustomNotificationPlugin? = null
        
        fun notifyListenersStatic(eventName: String, data: JSObject) {
            instance?.notifyListeners(eventName, data)
        }
    }

    override fun load() {
        Log.d(TAG, "Plugin loaded, creating channel...")
        instance = this
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Premium Channel (High Priority)
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Notificaciones premium de SexyLove"
                enableLights(true)
                enableVibration(true)
                setShowBadge(true)
                setBypassDnd(true) // Aggressive setting for "Supreme" experience
            }
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Channel created: $channelId")
        }
    }

    @PluginMethod
    fun showCustomNotification(call: PluginCall) {
        val title = call.getString("title") ?: "SexyLove"
        val body = call.getString("body") ?: ""
        val identityName = call.getString("identityName") ?: "SexyLove"
        val emoji = call.getString("emoji") ?: "✨"
        val backgroundColor = call.getString("backgroundColor") ?: "#FF69B4"
        val iconName = call.getString("icon") ?: "ic_notif_pide_un_deseo"
        val style = call.getString("style") ?: "standard"
        
        if (style == "supreme") {
            showSupremeNotification(call)
        } else {
            // Legacy / Standard implementation
            showStandardNotification(call, title, body, identityName, emoji, backgroundColor, iconName)
        }
    }

    private fun showStandardNotification(call: PluginCall, title: String, body: String, identityName: String, emoji: String, backgroundColor: String, iconName: String) {
        try {
            val bgColor = Color.parseColor(backgroundColor)
            val notificationId = System.currentTimeMillis().toInt()
            val smallIconResId = getIconResId(iconName)
            
            // Standard Builder
            val builder = NotificationCompat.Builder(context, channelId)
                .setSmallIcon(smallIconResId)
                .setContentTitle("$identityName $emoji")
                .setContentText(title)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setColor(bgColor)
                .setColorized(true)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, builder.build())
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.message)
        }
    }

    private fun showSupremeNotification(call: PluginCall) {
        // Run on background thread for bitmap loading
        executor.execute {
            try {
                val title = call.getString("title") ?: "Special Alert"
                val body = call.getString("body") ?: "You have a new message"
                val identityName = call.getString("identityName") ?: "SexyLove"
                val emoji = call.getString("emoji") ?: "✨"
                val heroImage = call.getString("heroImage") // URL or Path
                val backgroundColor = call.getString("backgroundColor") ?: "#FF69B4"
                
                Log.d(TAG, "Building Supreme Notification with Hero: $heroImage")

                // 1. Prepare RemoteViews
                val remoteViews = RemoteViews(context.packageName, R.layout.notification_supreme)
                
                // 1.1 Set Background Color
                try {
                    val bgColor = Color.parseColor(backgroundColor)
                    remoteViews.setInt(R.id.notification_root, "setBackgroundColor", bgColor)
                } catch (e: Exception) {
                    Log.e(TAG, "Invalid color: $backgroundColor", e)
                }
                
                // 2. Bind Text
                remoteViews.setTextViewText(R.id.notification_title, title)
                remoteViews.setTextViewText(R.id.notification_body, body)
                remoteViews.setTextViewText(R.id.notification_emoji, emoji)
                
                // 3. Bind Images (Hero)
                if (heroImage != null && heroImage.startsWith("http")) {
                    val bitmap = loadBitmapFromUrl(heroImage)
                    if (bitmap != null) {
                        // Assuming we might have a hero slot or just reuse icon slot for now
                        // For Supreme, let's set the main icon to this bitmap
                        remoteViews.setImageViewBitmap(R.id.notification_icon, bitmap)
                    }
                } else {
                    // Fallback to static icon
                    remoteViews.setImageViewResource(R.id.notification_icon, android.R.drawable.sym_def_app_icon)
                }

                // 4. Bind Actions (Dynamic PendingIntents)
                // This would be loop-based if we had dynamic button IDs. 
                // For now, let's assume clicking the whole notification body is the action.
                val clickIntent = Intent(context, NotificationReceiver::class.java).apply {
                    action = "com.sexylove.app.ACTION_NOTIFICATION_CLICK"
                    putExtra("actionId", "body_click")
                    putExtra("notificationId", 1337)
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context, 
                    0, 
                    clickIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                remoteViews.setOnClickPendingIntent(R.id.notification_title, pendingIntent)
                remoteViews.setOnClickPendingIntent(R.id.notification_body, pendingIntent)

                // 5. Build
                val notificationId = System.currentTimeMillis().toInt()
                val builder = NotificationCompat.Builder(context, channelId)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setCustomContentView(remoteViews)
                    .setCustomBigContentView(remoteViews) // Expandable
                    .setStyle(NotificationCompat.DecoratedCustomViewStyle()) // Helps with compatibility
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)

                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.notify(notificationId, builder.build())
                
                call.resolve()
            } catch (e: Exception) {
                Log.e(TAG, "Supreme Error", e)
                call.reject(e.message)
            }
        }
    }

    private fun getIconResId(iconName: String): Int {
        val resId = context.resources.getIdentifier(iconName, "drawable", context.packageName)
        return if (resId != 0) resId else android.R.drawable.ic_dialog_info
    }

    private fun loadBitmapFromUrl(urlString: String): Bitmap? {
        return try {
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connect()
            val input = connection.inputStream
            BitmapFactory.decodeStream(input)
        } catch (e: Exception) {
            Log.e(TAG, "Error loading bitmap", e)
            null
        }
    }

    // ============================================
    // RITUAL ALARM METHODS
    // ============================================

    @PluginMethod
    fun scheduleRitualAlarm(call: PluginCall) {
        val ritualId = call.getString("ritualId") ?: run {
            call.reject("ritualId is required")
            return
        }
        val hour = call.getInt("hour") ?: 8
        val minute = call.getInt("minute") ?: 0
        val title = call.getString("title") ?: "Ritual"
        val emoji = call.getString("emoji") ?: "✨"
        val color = call.getString("color") ?: "#FF69B4"

        Log.d(TAG, "Scheduling ritual alarm: $ritualId at $hour:$minute")

        try {
            RitualScheduler.scheduleRitual(
                context = context,
                ritualId = ritualId,
                hour = hour,
                minute = minute,
                title = title,
                emoji = emoji,
                color = color
            )
            call.resolve()
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling ritual alarm", e)
            call.reject("Failed to schedule alarm: ${e.message}")
        }
    }

    @PluginMethod
    fun cancelRitualAlarm(call: PluginCall) {
        val ritualId = call.getString("ritualId") ?: run {
            call.reject("ritualId is required")
            return
        }

        Log.d(TAG, "Cancelling ritual alarm: $ritualId")

        try {
            RitualScheduler.cancelRitual(context, ritualId)
            call.resolve()
        } catch (e: Exception) {
            Log.e(TAG, "Error cancelling ritual alarm", e)
            call.reject("Failed to cancel alarm: ${e.message}")
        }
    }

    @PluginMethod
    fun getScheduledRituals(call: PluginCall) {
        try {
            val rituals = RitualScheduler.getAllScheduledRituals(context)
            val result = JSObject()
            
            rituals.forEach { (id, data) ->
                val ritualObj = JSObject().apply {
                    put("hour", data.hour)
                    put("minute", data.minute)
                    put("title", data.title)
                    put("emoji", data.emoji)
                    put("color", data.color)
                }
                result.put(id, ritualObj)
            }
            
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting scheduled rituals", e)
            call.reject("Failed to get scheduled rituals: ${e.message}")
        }
    }
}

