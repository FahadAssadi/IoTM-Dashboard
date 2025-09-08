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

  @ReactMethod
  fun writeLast7DaysHeartRateAggregateJson(promise: Promise) {
      scope.launch {
      try {
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) throw IllegalStateException("Health Connect not available")

        val hc = HealthConnectClient.getOrCreate(reactContext)
        val granted = hc.permissionController.getGrantedPermissions()
        val needed = setOf(HealthPermission.getReadPermission(HeartRateRecord::class))
        if (!granted.containsAll(needed)) throw SecurityException("Heart rate permission not granted")

        val now = ZonedDateTime.now(ZoneOffset.UTC)
        val start = now.minusDays(7).truncatedTo(ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start.toInstant(), now.toInstant())

        val result = hc.aggregate(
          androidx.health.connect.client.request.AggregateRequest(
            metrics = setOf(
              HeartRateRecord.BPM_AVG,
              HeartRateRecord.BPM_MIN,
              HeartRateRecord.BPM_MAX,
              HeartRateRecord.MEASUREMENTS_COUNT
            ),
            timeRangeFilter = tr
          )
        )

        val json = org.json.JSONObject(
          mapOf(
            "range" to mapOf("start" to start.toInstant().toString(), "end" to now.toInstant().toString()),
            "avgBpm" to (result[HeartRateRecord.BPM_AVG] ?: org.json.JSONObject.NULL),
            "minBpm" to (result[HeartRateRecord.BPM_MIN] ?: org.json.JSONObject.NULL),
            "maxBpm" to (result[HeartRateRecord.BPM_MAX] ?: org.json.JSONObject.NULL),
            "count"  to (result[HeartRateRecord.MEASUREMENTS_COUNT] ?: 0L)
          )
        ).toString()

        val outDir = reactContext.getExternalFilesDir("health_dumps") ?: reactContext.filesDir
        if (!outDir.exists()) outDir.mkdirs()
        val outFile = java.io.File(outDir, "hr_agg_7d_${System.currentTimeMillis()}.json")
        outFile.writeText(json, Charsets.UTF_8)

        val uri = "file://${outFile.absolutePath}"
        withContext(Dispatchers.Main) { promise.resolve(uri) }
      } catch (t: Throwable) {
        withContext(Dispatchers.Main) { promise.reject("HR_AGG_FILE_ERROR", t.message, t) }
      }
    }
  }

  @ReactMethod
  fun writeLast7DaysBloodPressureToFile(promise: Promise) {
    scope.launch {
      try {
        // Availability + permission check
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
          throw IllegalStateException("Health Connect not available")
        }
        val hc = HealthConnectClient.getOrCreate(reactContext)
        val needed = setOf(HealthPermission.getReadPermission(BloodPressureRecord::class))
        val granted = hc.permissionController.getGrantedPermissions()
        if (!granted.containsAll(needed)) {
          throw SecurityException("Blood pressure permission not granted")
        }

        // Last 7 days window (UTC)
        val now = ZonedDateTime.now(ZoneOffset.UTC)
        val start = now.minusDays(7).truncatedTo(ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start.toInstant(), now.toInstant())

        // Prepare output file (external app files dir; no runtime storage permissions required)
        val outDir = reactContext.getExternalFilesDir("health_dumps") ?: reactContext.filesDir
        if (!outDir.exists()) outDir.mkdirs()
        val outFile = File(outDir, "blood_pressure_7d_${System.currentTimeMillis()}.json")

        // Stream JSON to file to avoid large memory usage
        val seen = HashSet<String>()
        BufferedWriter(OutputStreamWriter(outFile.outputStream(), StandardCharsets.UTF_8)).use { w ->
          w.write("{\"range\":{\"start\":\"$start\",\"end\":\"$now\"},\"points\":[")
          var first = true
          var token: String? = null
          do {
            val resp = hc.readRecords(
              ReadRecordsRequest(
                recordType = BloodPressureRecord::class,
                timeRangeFilter = tr,
                pageSize = 200,
                pageToken = token
              )
            )
            resp.records.forEach { r ->
              val id = r.metadata.id ?: "${r.time}-${r.metadata.dataOrigin.packageName}"
              if (!seen.add(id)) return@forEach
              val sys = r.systolic.inMillimetersOfMercury
              val dia = r.diastolic.inMillimetersOfMercury
              val origin = r.metadata.dataOrigin.packageName
              if (!first) w.write(",") else first = false
              w.write("{\"id\":\"$id\",\"time\":\"${r.time}\",\"sys\":$sys,\"dia\":$dia,\"origin\":\"$origin\"}")
            }
            token = resp.pageToken
            w.flush()
          } while (token != null)
          w.write("]}")
        }

        val uri = "file://${outFile.absolutePath}"
        withContext(Dispatchers.Main) {
          promise.resolve(uri)
        }
      } catch (t: Throwable) {
        withContext(Dispatchers.Main) {
          promise.reject("BP_FILE_ERROR", t.message, t)
        }
      }
    }
  }

  @ReactMethod
  fun writeLast7DaysOxygenSaturationToFile(promise: Promise) {
    scope.launch {
      try {
        val status = HealthConnectClient.getSdkStatus(reactContext)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
          throw IllegalStateException("Health Connect not available")
        }
        val hc = HealthConnectClient.getOrCreate(reactContext)
        val needed = setOf(HealthPermission.getReadPermission(OxygenSaturationRecord::class))
        val granted = hc.permissionController.getGrantedPermissions()
        if (!granted.containsAll(needed)) {
          throw SecurityException("Oxygen saturation permission not granted")
        }

        val now = ZonedDateTime.now(ZoneOffset.UTC)
        val start = now.minusDays(7).truncatedTo(ChronoUnit.DAYS)
        val tr = TimeRangeFilter.between(start.toInstant(), now.toInstant())

        val outDir = reactContext.getExternalFilesDir("health_dumps") ?: reactContext.filesDir
        if (!outDir.exists()) outDir.mkdirs()
        val outFile = File(outDir, "spo2_7d_${System.currentTimeMillis()}.json")

        BufferedWriter(OutputStreamWriter(outFile.outputStream(), StandardCharsets.UTF_8)).use { w ->
          w.write("{\"range\":{")
          w.write("\"start\":\"${start.toInstant()}\",\"end\":\"${now.toInstant()}\"},")
          w.write("\"points\":[")

          var first = true
          var pageToken: String? = null
          do {
            val resp = hc.readRecords(
              ReadRecordsRequest(
                recordType = OxygenSaturationRecord::class,
                timeRangeFilter = tr,
                pageSize = 200,
                pageToken = pageToken
              )
            )

            resp.records.forEach { r ->
              val pct = r.percentage.value            // value in 0..100 (percent)
              val timeIso = r.time.toString()

              if (!first) w.write(",") else first = false
              w.write("{\"time\":\"$timeIso\",\"percentage\":$pct}")
            }

            pageToken = resp.pageToken
            w.flush()
          } while (pageToken != null)

          w.write("]}")
        }

        val uri = "file://${outFile.absolutePath}"
        withContext(Dispatchers.Main) {
          promise.resolve(uri)
        }
      } catch (t: Throwable) {
        withContext(Dispatchers.Main) {
          promise.reject("SPO2_FILE_ERROR", t.message, t)
        }
      }
    }
  }


}
