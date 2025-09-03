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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.cancel
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
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

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    scope.cancel()
  }

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
  fun getLast7DaysHeartRateJson(promise: Promise) {
    scope.launch {
      try {
        // availability
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
          throw IllegalStateException("Health Connect not available")
        }
        // permissions
        val granted = HealthConnectClient.getOrCreate(reactContext).permissionController.getGrantedPermissions()
        if (!granted.containsAll(requiredPermissions())) {
          throw SecurityException("Required Health Connect permissions not granted")
        }

        // build last-7-days UTC window
        val now = ZonedDateTime.now(ZoneOffset.UTC)
        val start = now.minusDays(7).truncatedTo(ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start.toInstant(), now.toInstant())
        val MAX_POINTS = 1000

        // HR records
        val samplePreview = mutableListOf<Map<String, Any>>()  // raw [{time,bpm}, ...]
        var totalPoints = 0
        var pageToken: String? = null
        do {
          val resp = HealthConnectClient.getOrCreate(reactContext).readRecords(
            ReadRecordsRequest(
              recordType = HeartRateRecord::class,
              timeRangeFilter = tr,
              pageSize = 200,
              pageToken = pageToken
            )
          )
          resp.records.forEach { record ->
            record.samples.forEach { s ->
              totalPoints += 1
              if (samplePreview.size < MAX_POINTS){
                samplePreview += mapOf(
                "time" to s.time.toString(),
                "bpm"  to s.beatsPerMinute
                )
              }
              
            }
          }
          pageToken = resp.pageToken
        } while (pageToken != null)

        // Simple JSON payload with raw points
        val json = JSONObject(
          mapOf(
            "range" to mapOf(
              "start" to start.toInstant().toString(),
              "end"   to now.toInstant().toString()
            ),
            "totalPoints" to totalPoints,
            "returnedPoints" to samplePreview.size,
            "points" to samplePreview
          )
        ).toString()
        
        withContext(Dispatchers.Main) { promise.resolve(json) }
      } catch (e: Exception) {
        withContext(Dispatchers.Main) { promise.reject("HR_7D_ERROR", e.message, e) }
      }
    }
  }

  /** Stream full raw points to a file; return file:// URI */
  @ReactMethod
  fun writeLast7DaysHeartRateToFile(promise: Promise) {
    scope.launch {
      try {
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) throw IllegalStateException("Health Connect not available")

        val hc = HealthConnectClient.getOrCreate(reactContext)
        val granted = hc.permissionController.getGrantedPermissions()
        val needed = setOf(HealthPermission.getReadPermission(HeartRateRecord::class))
        if (!granted.containsAll(needed)) throw SecurityException("Permissions not granted")

        val now = ZonedDateTime.now(ZoneOffset.UTC)
        val start = now.minusDays(7).truncatedTo(ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start.toInstant(), now.toInstant())

        // Save under external app files dir (no runtime permission needed)
        val outDir = reactContext.getExternalFilesDir("health_dumps") ?: reactContext.filesDir
        if (!outDir.exists()) outDir.mkdirs()
        val outFile = File(outDir, "hr_7d_${System.currentTimeMillis()}.json")

        BufferedWriter(OutputStreamWriter(outFile.outputStream(), StandardCharsets.UTF_8)).use { w ->
          // Begin JSON
          w.write("{\"range\":{")
          w.write("\"start\":\"${start.toInstant()}\",\"end\":\"${now.toInstant()}\"},")
          w.write("\"points\":[")

          var first = true
          var pageToken: String? = null
          do {
            val resp = hc.readRecords(
              ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = tr,
                pageSize = 200,
                pageToken = pageToken
              )
            )
            resp.records.forEach { r ->
              r.samples.forEach { s ->
                if (!first) w.write(",") else first = false
                w.write("{\"time\":\"${s.time}\",\"bpm\":${s.beatsPerMinute}}")
              }
            }
            pageToken = resp.pageToken
            w.flush() // keep memory low
          } while (pageToken != null)

          // End JSON
          w.write("]}")
        }

        val uri = "file://${outFile.absolutePath}"
        withContext(Dispatchers.Main) { promise.resolve(uri) }
      } catch (t: Throwable) {
        withContext(Dispatchers.Main) { promise.reject("HR_FILE_ERROR", t.message, t) }
      }
    }
  }

}