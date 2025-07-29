package com.mudit.locationtrackerclient

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import androidx.core.app.NotificationCompat

class SocketService : HeadlessJsTaskService() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("SocketService", "✅ onStartCommand called")
        startForegroundService()
        HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
        return super.onStartCommand(intent, flags, startId)
    }

    private fun startForegroundService() {
        val channelId = "socket_channel"
        val channelName = "Socket Background Service"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(chan)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Socket Running")
            .setContentText("Listening for real-time updates")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .build()

        startForeground(101, notification)
        //return START_STICKY
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        Log.d("SocketService", "✅ getTaskConfig called")
        val data = Arguments.createMap()
        data.putString("source", "socketService")

        return HeadlessJsTaskConfig(
            "SocketHeadlessTask", // Your JS task name
            data,
            5000, // timeout (ms)
            true  // allow in foreground
        )
    }
}
