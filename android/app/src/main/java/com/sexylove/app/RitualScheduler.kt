package com.sexylove.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import java.util.Calendar

/**
 * Scheduler for Ritual alarms using Android AlarmManager.
 * Handles scheduling, cancellation, and persistence for boot recovery.
 */
object RitualScheduler {
    
    private const val TAG = "RitualScheduler"
    private const val PREFS_NAME = "ritual_alarms"
    
    /**
     * Schedule a ritual alarm for a specific time.
     * The alarm will trigger at the specified hour:minute daily.
     */
    fun scheduleRitual(
        context: Context,
        ritualId: String,
        hour: Int,
        minute: Int,
        title: String,
        emoji: String,
        color: String
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, RitualAlarmReceiver::class.java).apply {
            action = "com.sexylove.app.RITUAL_ALARM"
            putExtra("ritualId", ritualId)
            putExtra("title", title)
            putExtra("emoji", emoji)
            putExtra("color", color)
            putExtra("hour", hour)
            putExtra("minute", minute)
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ritualId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            
            // If time has passed today, schedule for tomorrow
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                    Log.d(TAG, "Scheduled exact alarm for ritual: $ritualId at ${hour}:${minute}")
                } else {
                    // Fallback to inexact alarm
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                    Log.w(TAG, "Exact alarms not permitted, using inexact for: $ritualId")
                }
            } else {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
                Log.d(TAG, "Scheduled exact alarm for ritual: $ritualId at ${hour}:${minute}")
            }
            
            // Save to SharedPreferences for boot recovery
            saveScheduledRitual(context, ritualId, hour, minute, title, emoji, color)
            
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException scheduling alarm: ${e.message}")
        }
    }
    
    /**
     * Cancel a scheduled ritual alarm.
     */
    fun cancelRitual(context: Context, ritualId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, RitualAlarmReceiver::class.java).apply {
            action = "com.sexylove.app.RITUAL_ALARM"
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ritualId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        
        pendingIntent?.let {
            alarmManager.cancel(it)
            Log.d(TAG, "Cancelled alarm for ritual: $ritualId")
        }
        
        removeScheduledRitual(context, ritualId)
    }
    
    /**
     * Reschedule a ritual for the next day (called after alarm triggers).
     */
    fun rescheduleForNextDay(
        context: Context,
        ritualId: String,
        hour: Int,
        minute: Int,
        title: String,
        emoji: String,
        color: String
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        val intent = Intent(context, RitualAlarmReceiver::class.java).apply {
            action = "com.sexylove.app.RITUAL_ALARM"
            putExtra("ritualId", ritualId)
            putExtra("title", title)
            putExtra("emoji", emoji)
            putExtra("color", color)
            putExtra("hour", hour)
            putExtra("minute", minute)
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            ritualId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val calendar = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
            Log.d(TAG, "Rescheduled ritual $ritualId for tomorrow at ${hour}:${minute}")
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException rescheduling alarm: ${e.message}")
        }
    }
    
    /**
     * Save ritual data to SharedPreferences for boot recovery.
     */
    private fun saveScheduledRitual(
        context: Context,
        ritualId: String,
        hour: Int,
        minute: Int,
        title: String,
        emoji: String,
        color: String
    ) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val data = "$hour|$minute|$title|$emoji|$color"
        prefs.edit().putString(ritualId, data).apply()
        Log.d(TAG, "Saved ritual to prefs: $ritualId")
    }
    
    /**
     * Remove ritual data from SharedPreferences.
     */
    private fun removeScheduledRitual(context: Context, ritualId: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(ritualId).apply()
        Log.d(TAG, "Removed ritual from prefs: $ritualId")
    }
    
    /**
     * Get all scheduled rituals from SharedPreferences.
     * Used for boot recovery.
     */
    fun getAllScheduledRituals(context: Context): Map<String, RitualAlarmData> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val result = mutableMapOf<String, RitualAlarmData>()
        
        prefs.all.forEach { (ritualId, value) ->
            if (value is String) {
                val parts = value.split("|")
                if (parts.size >= 5) {
                    result[ritualId] = RitualAlarmData(
                        hour = parts[0].toIntOrNull() ?: 8,
                        minute = parts[1].toIntOrNull() ?: 0,
                        title = parts[2],
                        emoji = parts[3],
                        color = parts[4]
                    )
                }
            }
        }
        
        return result
    }
    
    /**
     * Reschedule all rituals (called on boot).
     */
    fun rescheduleAllRituals(context: Context) {
        val rituals = getAllScheduledRituals(context)
        Log.d(TAG, "Rescheduling ${rituals.size} rituals after boot")
        
        rituals.forEach { (ritualId, data) ->
            scheduleRitual(
                context,
                ritualId,
                data.hour,
                data.minute,
                data.title,
                data.emoji,
                data.color
            )
        }
    }
}

/**
 * Data class for ritual alarm information.
 */
data class RitualAlarmData(
    val hour: Int,
    val minute: Int,
    val title: String,
    val emoji: String,
    val color: String
)
