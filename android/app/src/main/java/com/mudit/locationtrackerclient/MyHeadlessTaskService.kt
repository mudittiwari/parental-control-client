package com.mudit.locationtrackerclient

import android.content.Intent
import android.os.Bundle
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class MyHeadlessJsTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras: Bundle? = intent?.extras
        return if (extras != null) {
            HeadlessJsTaskConfig(
                "SocketHeadlessTask", // name registered in JS
                Arguments.fromBundle(extras),
                5000, // timeout in ms
                true  // run even in foreground
            )
        } else {
            null
        }
    }
}
