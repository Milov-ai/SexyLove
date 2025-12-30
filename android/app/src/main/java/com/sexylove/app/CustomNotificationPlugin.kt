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
    private val channelId = "sexylove-premium-v3"
    private val channelName = "SexyLove Premium"
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
            
            // Premium Channel (High Importance for Peeking/Pop-up)
            val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Notificaciones premium de SexyLove"
                enableLights(true)
                enableVibration(true)
                setShowBadge(true)
                // Note: setBypassDnd removed as it requires extra system permissions
            }
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "Channel created: $channelId")
        }
    }

    @PluginMethod
    fun showCustomNotification(call: PluginCall) {
        val style = call.getString("style") ?: "standard"
        
        if (style == "premium" || style == "supreme") {
            showPremiumNotification(call)
        } else {
            val title = call.getString("title") ?: "SexyLove"
            val body = call.getString("body") ?: ""
            val identityName = call.getString("identityName") ?: "SexyLove"
            val emoji = call.getString("emoji") ?: "✨"
            val backgroundColor = call.getString("backgroundColor") ?: "#FF69B4"
            val iconName = call.getString("icon") ?: "ic_notif_pide_un_deseo"
            showStandardNotification(call, title, body, identityName, emoji, backgroundColor, iconName)
        }
    }

    private fun showPremiumNotification(call: PluginCall) {
        executor.execute {
            try {
                val title = call.getString("title") ?: "SexyLove"
                val body = call.getString("body") ?: ""
                val identityName = call.getString("identityName") ?: "SexyLove"
                val emoji = call.getString("emoji") ?: "✨"
                val backgroundColor = call.getString("backgroundColor") ?: "#FF69B4"
                val iconName = call.getString("icon") ?: "ic_notif_pide_un_deseo"
                val ritualId = call.getString("ritualId")
                val textColorStr = call.getString("textColor") ?: "#FFFFFF"
                
                Log.d(TAG, "Building PREMIUM Notification: $identityName")

                val remoteViews = RemoteViews(context.packageName, R.layout.custom_notification)
                val bigRemoteViews = RemoteViews(context.packageName, R.layout.custom_notification_expanded)
                
                val bgColor = Color.parseColor(backgroundColor)
                val textColor = Color.parseColor(textColorStr)

                // 1. Collapsed View
                remoteViews.setInt(R.id.notification_root, "setBackgroundColor", bgColor)
                remoteViews.setTextViewText(R.id.identity_name, identityName)
                remoteViews.setTextColor(R.id.identity_name, textColor)
                remoteViews.setTextViewText(R.id.notification_title, title)
                remoteViews.setTextColor(R.id.notification_title, textColor)
                remoteViews.setTextViewText(R.id.notification_body, body)
                remoteViews.setTextColor(R.id.notification_body, textColor)
                remoteViews.setTextViewText(R.id.aura_emoji, emoji)
                
                // Big Icon Slot (Using Small Icon resource as requested)
                val iconResId = getIconResId(iconName)
                remoteViews.setImageViewResource(R.id.identity_icon, iconResId)

                // 2. Expanded View
                bigRemoteViews.setInt(R.id.notification_root_expanded, "setBackgroundColor", bgColor)
                bigRemoteViews.setTextViewText(R.id.identity_name_big, identityName)
                bigRemoteViews.setTextColor(R.id.identity_name_big, textColor)
                bigRemoteViews.setTextViewText(R.id.notification_title_big, title)
                bigRemoteViews.setTextColor(R.id.notification_title_big, textColor)
                bigRemoteViews.setTextViewText(R.id.notification_body_big, body)
                bigRemoteViews.setTextColor(R.id.notification_body_big, textColor)
                bigRemoteViews.setTextViewText(R.id.aura_emoji_big, emoji)
                bigRemoteViews.setImageViewResource(R.id.identity_icon_big, iconResId)
                bigRemoteViews.setTextColor(R.id.branding, textColor)

                // 3. Intents (Body click only for now to keep it clean)
                val intent = Intent(context, NotificationReceiver::class.java).apply {
                    action = "com.sexylove.app.ACTION_NOTIFICATION_CLICK"
                    putExtra("actionId", "body_click")
                    putExtra("notificationId", ritualId.hashCode())
                    putExtra("ritualId", ritualId)
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context, 
                    System.currentTimeMillis().toInt(), 
                    intent, 
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                remoteViews.setOnClickPendingIntent(R.id.notification_root, pendingIntent)
                bigRemoteViews.setOnClickPendingIntent(R.id.notification_root_expanded, pendingIntent)

                // 4. Build & Notify
                val notificationId = ritualId?.hashCode() ?: System.currentTimeMillis().toInt()
                val builder = NotificationCompat.Builder(context, channelId)
                    .setSmallIcon(getIconResId(iconName))
                    .setCustomContentView(remoteViews)
                    .setCustomBigContentView(bigRemoteViews)
                    .setContentTitle(title) // Standard fallback
                    .setContentText(body)  // Standard fallback
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setAutoCancel(true)

                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.notify(notificationId, builder.build())
                
                call.resolve()
            } catch (e: Exception) {
                Log.e(TAG, "Premium Error", e)
                call.reject(e.message)
            }
        }
    }

    private fun showStandardNotification(call: PluginCall, title: String, body: String, identityName: String, emoji: String, backgroundColor: String, iconName: String) {
        try {
            val bgColor = Color.parseColor(backgroundColor)
            val notificationId = System.currentTimeMillis().toInt()
            val smallIconResId = getIconResId(iconName)
            
            // Standard Builder with colorization
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

