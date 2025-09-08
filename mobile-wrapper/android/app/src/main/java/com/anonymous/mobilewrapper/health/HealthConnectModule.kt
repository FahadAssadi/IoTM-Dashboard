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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.cancel
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ChangesTokenRequest
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import org.json.JSONObject
import java.io.File
import java.io.BufferedWriter
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets

class HealthConnectModule(private val reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "HealthConnectModule"

  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

  private companion object {
    const val DATA_DIR = "health_data"
    const val FILE_BP  = "blood_pressure_data.json"
    const val FILE_HR  = "heart_rate_data.json"
    const val FILE_SPO2 = "spo2_data.json"
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
    HealthPermission.getReadPermission(OxygenSaturationRecord::class)
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
        val required = setOf(
          HealthPermission.getReadPermission(HeartRateRecord::class),
          HealthPermission.getReadPermission(BloodPressureRecord::class),
          HealthPermission.getReadPermission(OxygenSaturationRecord::class),
        )
        val granted = hc.permissionController.getGrantedPermissions()
        if (!granted.containsAll(required)) throw SecurityException("Permissions not granted")
        
        val existing = HcTokenStore.getToken(reactContext)
        val stillValid = existing != null && !HcTokenStore.isTokenExpired(reactContext)

        if (stillValid) {
          // Ensure periodic job is running
          HealthConnectSyncWorker.schedule(reactContext, 1L)

          // Trigger an immediate sync so user sees updates right away
          HealthConnectSyncWorker.enqueueOneTime(reactContext)

          withContext(Dispatchers.Main) { promise.resolve(true) }
          return@launch
        }

        // Get & store changes token immediately
        val token = hc.getChangesToken(
          ChangesTokenRequest(setOf(
            HeartRateRecord::class,
            BloodPressureRecord::class,
            OxygenSaturationRecord::class
          ))
        )
        HcTokenStore.saveToken(reactContext, token)

        // 30 day window and seed JSON with ONLY ONE page (pageSize=1000)
        val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
        val start = now.minus(30, ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start, now)
        HcTokenStore.setBaselineRange(reactContext, start.toString(), now.toString())

        val outDir = dataDir()

        val bpFile = File(outDir, FILE_BP)
        val hrFile = File(outDir, FILE_HR)
        val spo2File = File(outDir, FILE_SPO2)

        val bpNext = HealthJsonWriters.writeFirstPageBloodPressure(hc, tr, bpFile, pageSize = 1000)
        val hrNext = HealthJsonWriters.writeFirstPageHeartRate(hc, tr, hrFile, pageSize = 1000)
        val spNext = HealthJsonWriters.writeFirstPageSpo2(hc, tr, spo2File, pageSize = 1000)

        HcTokenStore.setNextPage(reactContext, "bp", bpNext)
        HcTokenStore.setNextPage(reactContext, "hr", hrNext)
        HcTokenStore.setNextPage(reactContext, "spo2", spNext)

        val inProgress = (bpNext != null) || (hrNext != null) || (spNext != null)
        HcTokenStore.setBaselineInProgress(reactContext, inProgress)
        HcTokenStore.saveLastSyncNow(reactContext)

        // start worker for periodic schedule
        HealthConnectSyncWorker.schedule(reactContext, 1L)
        HealthConnectSyncWorker.enqueueOneTime(reactContext)

        withContext(Dispatchers.Main) { promise.resolve(true) }
      } catch (e: Exception) {
        HcTokenStore.clear(reactContext)
        withContext(Dispatchers.Main) { promise.reject("BASELINE_ERROR", e.message, e) }
      }
    }
  }

  /** Schedules the periodic HC sync worker (default: hourly) */
  @ReactMethod
  fun schedulePeriodicHealthSync(hours: Int, promise: Promise) {
    try {
      HealthConnectSyncWorker.schedule(reactContext, hours.toLong().coerceAtLeast(1L))
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
