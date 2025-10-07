package com.anonymous.mobilewrapper.health

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.SleepSessionRecord
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.cancel
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.io.File

class HealthConnectModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "HealthConnectModule"

  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  private companion object {
    const val DATA_DIR = "health_data"
    const val FILE_BP  = "blood_pressure_data.json"
    const val FILE_HR  = "heart_rate_data.json"
    const val FILE_SPO2 = "spo2_data.json"
    const val FILE_STEPS = "steps_data.json"
    const val FILE_SLEEP = "sleep_data.json"
  }

  private fun dataDir(): File {
    val dir = reactContext.getExternalFilesDir(DATA_DIR) ?: reactContext.filesDir
    if (!dir.exists()) dir.mkdirs()
    return dir
  }

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    scope.cancel()
  }

  private fun requiredPermissions(): Set<String> = setOf(
    HealthPermission.getReadPermission(HeartRateRecord::class),
    HealthPermission.getReadPermission(BloodPressureRecord::class),
    HealthPermission.getReadPermission(OxygenSaturationRecord::class),
    HealthPermission.getReadPermission(StepsRecord::class),
    HealthPermission.getReadPermission(SleepSessionRecord::class)
  )

  @ReactMethod
  fun isAvailable(promise: Promise) {
    val status = HealthConnectClient.getSdkStatus(reactContext)
    Log.d("HC", "SDK status=$status")
    promise.resolve(status == HealthConnectClient.SDK_AVAILABLE)
  }

  @ReactMethod
  fun hasRequiredPermissions(promise: Promise) {
    val status = HealthConnectClient.getSdkStatus(reactContext)
    if (status != HealthConnectClient.SDK_AVAILABLE) {
      promise.resolve(false)
      return
    }

    scope.launch {
      try {
        val granted = HealthConnectClient.getOrCreate(reactContext).permissionController.getGrantedPermissions()
        val hasAll = granted.containsAll(requiredPermissions())
        withContext(Dispatchers.Main) { promise.resolve(hasAll) }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) { promise.reject("PERM_CHECK_ERROR", e.message, e) }
      }
    }
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

  @ReactMethod
  fun extractBaselineAndStoreToken(promise: Promise) {
    scope.launch {
      try {
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) throw IllegalStateException("Health Connect not available")

        val hc = HealthConnectClient.getOrCreate(reactContext)
        val required = requiredPermissions()
        val granted = hc.permissionController.getGrantedPermissions()
        if (!granted.containsAll(required)) throw SecurityException("Permissions not granted")

        val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
        val start = now.minus(30, ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start, now)

        val outDir = dataDir()
        val bpFile = File(outDir, FILE_BP)
        val hrFile = File(outDir, FILE_HR)
        val spo2File = File(outDir, FILE_SPO2)
        val stepsFile = File(outDir, FILE_STEPS)
        val sleepFile = File(outDir, FILE_SLEEP)

        // Overwrite each baseline dump
        bpFile.delete(); hrFile.delete(); spo2File.delete(); stepsFile.delete(); sleepFile.delete()

        HealthJsonWriters.writeBloodPressureWindow(hc, tr, bpFile, 2000)
        HealthJsonWriters.writeHeartRateWindow(hc, tr, hrFile, 2000)
        HealthJsonWriters.writeSpo2Window(hc, tr, spo2File, 2000)
        HealthJsonWriters.writeStepsWindow(hc, tr, stepsFile, 2000)
        HealthJsonWriters.writeSleepSessionsWindow(hc, tr, sleepFile, 2000)

        // Start periodic sync every 15 minutes
        HealthConnectSyncWorker.schedule(reactContext, 15L)

        withContext(Dispatchers.Main) { promise.resolve(true) }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) { promise.reject("BASELINE_ERROR", e.message, e) }
      }
    }
  }

  @ReactMethod
  fun schedulePeriodicHealthSync(hours: Int, promise: Promise) {
    // Keep for compatibility; convert hours -> minutes
    try {
      val minutes = (hours * 60).coerceAtLeast(15) // WorkManager min is 15 minutes
      HealthConnectSyncWorker.schedule(reactContext, minutes.toLong())
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("SCHEDULE_ERROR", t.message, t)
    }
  }

  @ReactMethod
  fun runHealthSyncNow(promise: Promise) {
    try {
      HealthConnectSyncWorker.enqueueOneTime(reactContext)
      promise.resolve(true)
    } catch (t: Throwable) {
      promise.reject("RUN_NOW_ERROR", t.message, t)
    }
  }
}