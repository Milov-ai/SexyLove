package com.sexylove.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BroadcastReceiver that handles ritual alarm triggers.
 * Shows a Supreme notification and reschedules for the next day.
 */
class RitualAlarmReceiver : BroadcastReceiver() {
    
    private val TAG = "RitualAlarmReceiver"
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != "com.sexylove.app.RITUAL_ALARM") {
            Log.w(TAG, "Received unknown action: ${intent.action}")
            return
        }
        
        val ritualId = intent.getStringExtra("ritualId") ?: run {
            Log.e(TAG, "Missing ritualId in intent")
            return
        }
        
        val title = intent.getStringExtra("title") ?: "Ritual"
        val emoji = intent.getStringExtra("emoji") ?: "✨"
        val color = intent.getStringExtra("color") ?: "#FF69B4"
        val hour = intent.getIntExtra("hour", 8)
        val minute = intent.getIntExtra("minute", 0)
        
        Log.d(TAG, "Alarm triggered for ritual: $ritualId ($title)")
        
        // 1. Show the notification
        RitualNotificationHelper.showRitualNotification(
            context = context,
            ritualId = ritualId,
            title = title,
            emoji = emoji,
            color = color
        )
        
        // 2. Reschedule for tomorrow
        RitualScheduler.rescheduleForNextDay(
            context = context,
            ritualId = ritualId,
            hour = hour,
            minute = minute,
            title = title,
            emoji = emoji,
            color = color
        )
        
        // 3. Notify the app (if running) via the plugin
        try {
            val data = com.getcapacitor.JSObject().apply {
                put("ritualId", ritualId)
                put("title", title)
                put("emoji", emoji)
                put("action", "alarm_triggered")
            }
            CustomNotificationPlugin.notifyListenersStatic("ritualAlarm", data)
        } catch (e: Exception) {
            Log.w(TAG, "Could not notify listeners: ${e.message}")
        }
    }
}
