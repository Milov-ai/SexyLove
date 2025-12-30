package com.sexylove.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(ChameleonPlugin::class.java)
        registerPlugin(CustomNotificationPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
