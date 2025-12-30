package com.sexylove.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.getcapacitor.JSObject

class NotificationReceiver : BroadcastReceiver() {

    private val TAG = "NotificationReceiver"

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val actionId = intent.getStringExtra("actionId") ?: "unknown"
        val notificationId = intent.getIntExtra("notificationId", -1)

        Log.d(TAG, "Received broadcast: action=$action, notificationId=$notificationId, actionId=$actionId")

        if (action == "com.sexylove.app.ACTION_NOTIFICATION_CLICK") {
            // Forward event to Plugin if it's alive, or store it?
            // For now, let's just Log. Accessing the Plugin instance statically is common pattern in Capacitor plugins
            // assuming the App is running. If app is dead, this might just open the app.
            
            // Note: In a real "Supreme" implementation, we might want to start a Service or bring the Activity to front
            // based on the action type.
            
            val jsObject = JSObject()
            jsObject.put("actionId", actionId)
            jsObject.put("notificationId", notificationId)
            
            val ritualId = intent.getStringExtra("ritualId")
            if (ritualId != null) {
                val notificationData = JSObject()
                notificationData.put("ritualId", ritualId)
                jsObject.put("notification", notificationData)
            }
            
            // Helper method in Plugin to emit event
            CustomNotificationPlugin.notifyListenersStatic("notificationActionPerformed", jsObject)
            
            // Close notification panel
            val it = Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS)
            context.sendBroadcast(it)
        }
    }
}
