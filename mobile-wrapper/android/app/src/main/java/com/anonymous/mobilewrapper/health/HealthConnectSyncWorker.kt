/**
 * @file HealthConnectSyncWorker.kt
 * @brief Background synchronization worker for uploading Health Connect data to the backend.
 *
 * @description
 * This class defines `HealthConnectSyncWorker`, a WorkManager coroutine worker that:
 * - Reads data from Health Connect (Heart Rate, Blood Pressure, SpO₂, Sleep, etc.)
 * - Writes each record type to a local JSON file using `HealthJsonWriters`
 * - Uploads those JSON payloads to the backend API using Retrofit (`ApiClient`)
 * - Runs periodically (every 15 minutes) or immediately when triggered manually
 *
 * This ensures continuous synchronization of user health data between the device
 * and Supabase backend, even when the app is in the background.
 *
 * @features
 * - Uses `CoroutineWorker` for efficient asynchronous I/O
 * - Displays a foreground notification during sync operations
 * - Handles permission checks and retries gracefully
 * - Uses `WorkManager` APIs for one-time and periodic scheduling
 */

package com.anonymous.mobilewrapper.health

import android.content.Context
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.*
import com.anonymous.mobilewrapper.models.*
import com.anonymous.mobilewrapper.network.ApiClient
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.File
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.concurrent.TimeUnit

// WorkManager job that performs background Health Connect data sync.
class HealthConnectSyncWorker(
  appContext: Context,
  params: WorkerParameters
) : CoroutineWorker(appContext, params) {

  // Displays a persistent foreground notification while syncing.
  override suspend fun getForegroundInfo(): ForegroundInfo {
    val notification = NotificationCompat.Builder(applicationContext, "health_sync_channel")
      .setContentTitle("Syncing Health Data")
      .setContentText("Uploading to server…")
      .setSmallIcon(android.R.drawable.ic_popup_sync)
      .setOngoing(true)
      .build()
    return ForegroundInfo(1001, notification)
  }

  // === Helper function ===
  private fun uploadSafely(label: String, block: () -> Unit) {
      try {
          block()
          Log.d("HealthSyncWorker", "Uploaded $label")
      } catch (e: Exception) {
          Log.e("HealthSyncWorker", "Upload failed for $label", e)
      }
  }

  // Main execution body of the worker. Performs reading, serialization, and uploading of all health data.
  override suspend fun doWork(): Result {
    Log.d("HealthSyncWorker", "Started health data sync")

    // Initialize Health Connect client
    val hc = HealthConnectClient.getOrCreate(applicationContext)
     // Define all required read permissions
    val required = setOf(
      HealthPermission.getReadPermission(HeartRateRecord::class),
      HealthPermission.getReadPermission(BloodPressureRecord::class),
      HealthPermission.getReadPermission(OxygenSaturationRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
      HealthPermission.getReadPermission(SleepSessionRecord::class),
      HealthPermission.getReadPermission(ExerciseSessionRecord::class),
    )
    // Check that all required permissions are still granted
    val granted = hc.permissionController.getGrantedPermissions()
    if (!granted.containsAll(required)) return Result.retry()
    // Get user credentials for backend upload
    val userId = inputData.getString("userId")
    val token = inputData.getString("token")
    if (userId.isNullOrEmpty() || token.isNullOrEmpty()) {
      Log.e("HealthSyncWorker", " Missing userId or token")
      return Result.failure()
    }

    val bearer = "Bearer $token"

    return try {
      // Prepare local output directory
      val dir = applicationContext.getExternalFilesDir("health_data") ?: applicationContext.filesDir
      if (!dir.exists()) dir.mkdirs()
      // Set 30-day time window for sync
      val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
      val start = now.minus(30, ChronoUnit.DAYS)
      val tr = TimeRangeFilter.between(start, now)
      // Prepare file handles
      val bpFile = File(dir, "blood_pressure_data.json")
      val hrFile = File(dir, "heart_rate_data.json")
      val spo2File = File(dir, "spo2_data.json")
      val stepsFile = File(dir, "steps_data.json")
      val sleepFile = File(dir, "sleep_data.json")
      val exerciseFile = File(dir, "exercise_data.json")
      // Clear previous sync dumps
      bpFile.delete(); hrFile.delete(); spo2File.delete(); stepsFile.delete(); sleepFile.delete()
      // Generate new JSON data using helper writers
      HealthJsonWriters.writeBloodPressureWindow(hc, tr, bpFile, 2000)
      HealthJsonWriters.writeHeartRateWindow(hc, tr, hrFile, 2000)
      HealthJsonWriters.writeSpo2Window(hc, tr, spo2File, 2000)
      HealthJsonWriters.writeStepsWindow(hc, tr, stepsFile, 2000)
      HealthJsonWriters.writeSleepSessionsWindow(hc, tr, sleepFile, 2000)
      HealthJsonWriters.writeExerciseSessionsWindow(hc, tr, exerciseFile, 2000)

      // Upload to backend
      val gson = Gson()
      
      // Blood Pressure
      uploadSafely("Blood Pressure") {
          val json = bpFile.readText()
          val payload = gson.fromJson(json, BloodPressurePayload::class.java)
          ApiClient.instance.uploadBloodPressure(userId, bearer, payload).execute()
      }

      // Heart Rate
      uploadSafely("Heart Rate") {
          val json = hrFile.readText()
          val payload = gson.fromJson(json, HeartRatePayload::class.java)
          ApiClient.instance.uploadHeartRate(userId, bearer, payload).execute()
      }

      // SpO2
      uploadSafely("SpO₂") {
          val json = spo2File.readText()
          val payload = gson.fromJson(json, SpO2Payload::class.java)
          ApiClient.instance.uploadOxygenSaturation(userId, bearer, payload).execute()
      }

      // Sleep
      uploadSafely("Sleep") {
          val json = sleepFile.readText()
          val payload = gson.fromJson(json, SleepPayload::class.java)
          ApiClient.instance.uploadSleepSession(userId, bearer, payload).execute()
      }

      Result.success()
    } catch (e: HttpException) {
      Log.e("HealthSyncWorker", "HTTP error ${e.message()}")
      Result.retry()
    } catch (e: Exception) {
      Log.e("HealthSyncWorker", "Sync failed", e)
      Result.retry()
    }
  }

  companion object {
    private const val UNIQUE_PERIODIC = "hc_periodic_sync"
    private const val UNIQUE_ONETIME = "hc_sync_now"

    // Enqueue one-time sync (immediate)
    fun enqueueOneTime(context: Context, userId: String, token: String) {
        val data = workDataOf(
            "userId" to userId,
            "token" to token
        )

        val req = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
            .setInputData(data)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(context).enqueueUniqueWork(
            UNIQUE_ONETIME,
            ExistingWorkPolicy.REPLACE,
            req
        )
    }

    //Schedule periodic background sync
    fun schedulePeriodic(context: Context, repeatMinutes: Long, userId: String, token: String) {
        val data = workDataOf(
            "userId" to userId,
            "token" to token
        )

        val req = PeriodicWorkRequestBuilder<HealthConnectSyncWorker>(repeatMinutes, TimeUnit.MINUTES)
            .setInputData(data)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UNIQUE_PERIODIC,
            ExistingPeriodicWorkPolicy.UPDATE,
            req
        )
    }
  }
}
