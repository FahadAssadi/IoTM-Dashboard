package com.anonymous.mobilewrapper.health

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord

class HealthConnectModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "HealthConnectModule"

  private fun requiredPermissions(): Set<String> = setOf(
    HealthPermission.getReadPermission(StepsRecord::class),
    HealthPermission.getReadPermission(HeartRateRecord::class)
  )

  @ReactMethod
  fun isAvailable(promise: Promise) {
    val status = HealthConnectClient.getSdkStatus(reactContext)
    Log.d("HC", "SDK status=$status")
    promise.resolve(status == HealthConnectClient.SDK_AVAILABLE)
  }

  @ReactMethod
  fun hasRequiredPermissions(promise: Promise) {
    promise.resolve(false)
  }

  @ReactMethod
  fun requestPermissions(promise: Promise) {
    val activity = currentActivity ?: return promise.reject("NO_ACTIVITY", "No foreground activity")

    // check HC available
    val available = HealthConnectClient.getSdkStatus(reactContext) == HealthConnectClient.SDK_AVAILABLE
    if (!available) {
      // Open the HC Settings page to prompt install/enable
      try {
        val intent = Intent(
          if (Build.VERSION.SDK_INT >= 34)
            // Android 14+: deep link to system “Manage health permissions”
            android.health.connect.HealthConnectManager.ACTION_MANAGE_HEALTH_PERMISSIONS
          else
            // Android 13 and lower: open Health Connect settings screen
            HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS
        ).apply {
          putExtra(Intent.EXTRA_PACKAGE_NAME, reactContext.packageName)
        }
        activity.startActivity(intent)
      } catch (_: Exception) { /* ignore */ }
      return promise.reject("HC_UNAVAILABLE", "Health Connect not available on this device")
    }

    // permissions set should not be empty
    val perms = ArrayList(requiredPermissions())
    Log.d("HC", "requestPermissions launching for ${perms.size} perms")

    // Use the trampoline activity 
    PermissionRelay.callback = { granted ->
      val ok = granted.containsAll(requiredPermissions())
      Log.d("HC", "granted=${granted.size} ok=$ok")
      UiThreadUtil.runOnUiThread {
        if (ok) promise.resolve(null)
        else promise.reject("PERMISSION_DENIED", "User denied Health Connect permissions")
      }
    }

    val intent = Intent(activity, PermissionProxyActivity::class.java).apply {
      putStringArrayListExtra(PermissionProxyActivity.EXTRA_PERMS, perms)
    }
    activity.startActivity(intent)
  }

  @ReactMethod fun dumpLast7DaysJson(promise: Promise) = promise.resolve("""{"note":"stub"}""")
  @ReactMethod fun dumpLast7DaysToJson(promise: Promise) = promise.resolve("")
}