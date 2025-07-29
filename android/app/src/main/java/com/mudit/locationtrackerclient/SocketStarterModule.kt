package com.mudit.locationtrackerclient

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.HeadlessJsTaskService

class SocketStarterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SocketStarterModule"

    @ReactMethod
    fun startSocketService() {
        Log.d("SocketStarter", "🟢 Starting socket service...")
        val serviceIntent = Intent(reactApplicationContext, SocketService::class.java)
        reactApplicationContext.startForegroundService(serviceIntent)
        HeadlessJsTaskService.acquireWakeLockNow(reactApplicationContext)
    }
}