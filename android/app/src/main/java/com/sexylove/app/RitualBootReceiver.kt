package com.sexylove.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * BroadcastReceiver that reschedules all ritual alarms after device boot.
 * Registered in AndroidManifest.xml with BOOT_COMPLETED intent filter.
 */
class RitualBootReceiver : BroadcastReceiver() {
    
    private val TAG = "RitualBootReceiver"
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d(TAG, "Device booted, rescheduling all ritual alarms...")
            
            try {
                RitualScheduler.rescheduleAllRituals(context)
                Log.d(TAG, "Successfully rescheduled ritual alarms")
            } catch (e: Exception) {
                Log.e(TAG, "Error rescheduling rituals: ${e.message}", e)
            }
        }
    }
}
