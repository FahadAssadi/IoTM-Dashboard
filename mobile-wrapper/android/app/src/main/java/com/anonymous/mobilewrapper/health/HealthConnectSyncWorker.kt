package com.anonymous.mobilewrapper.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.request.ChangesTokenRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.*
import java.io.File
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.concurrent.TimeUnit

class HealthConnectSyncWorker(
  appContext: Context,
  params: WorkerParameters
) : CoroutineWorker(appContext, params) {

  override suspend fun doWork(): Result {
    val hc = HealthConnectClient.getOrCreate(applicationContext)

    // Permissions check
    val required = setOf(
      HealthPermission.getReadPermission(HeartRateRecord::class),
      HealthPermission.getReadPermission(BloodPressureRecord::class),
      HealthPermission.getReadPermission(OxygenSaturationRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
      HealthPermission.getReadPermission(SleepSessionRecord::class),
    )
    val granted = hc.permissionController.getGrantedPermissions()
    if (!granted.containsAll(required)) return Result.retry()

    return try {
      val outDir = applicationContext.getExternalFilesDir("health_data") ?: applicationContext.filesDir
      if (!outDir.exists()) outDir.mkdirs()

      val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
      val start = now.minus(30, ChronoUnit.DAYS)
      val tr = TimeRangeFilter.between(start, now)

      // Overwrite files each run (no duplication)
      val bpFile = File(outDir, "blood_pressure_data.json")
      val hrFile = File(outDir, "heart_rate_data.json")
      val spo2File = File(outDir, "spo2_data.json")
      val stepsFile = File(outDir, "steps_data.json")
      val sleepFile = File(outDir, "sleep_data.json")

      // Optional cleanup; writers overwrite anyway
      bpFile.delete(); hrFile.delete(); spo2File.delete(); stepsFile.delete(); sleepFile.delete()

      HealthJsonWriters.writeBloodPressureWindow(hc, tr, bpFile, 2000)
      HealthJsonWriters.writeHeartRateWindow(hc, tr, hrFile, 2000)
      HealthJsonWriters.writeSpo2Window(hc, tr, spo2File, 2000)
      HealthJsonWriters.writeStepsWindow(hc, tr, stepsFile, 2000)
      HealthJsonWriters.writeSleepSessionsWindow(hc, tr, sleepFile, 2000)

      Result.success()
    } catch (e: Exception) {
      Result.retry()
    }
  }

  companion object {
    private const val UNIQUE_WORK_NAME = "hc_periodic_sync"
    private const val UNIQUE_ONE_TIME = "hc_sync_now"

    /** Schedule every 15 minutes (Android’s minimum interval for periodic work) */
    fun schedule(context: Context, repeatMinutes: Long = 15L) {
      val req = PeriodicWorkRequestBuilder<HealthConnectSyncWorker>(repeatMinutes, TimeUnit.MINUTES)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()
      WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        UNIQUE_WORK_NAME,
        ExistingPeriodicWorkPolicy.UPDATE,
        req
      )
    }

    /** To kick an immediate sync once (e.g., right after baseline) */
    fun enqueueOneTime(context: Context) {
      val req = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()
      WorkManager.getInstance(context).enqueueUniqueWork(
        UNIQUE_ONE_TIME,
        ExistingWorkPolicy.KEEP,
        req
      )
    }
  }
}