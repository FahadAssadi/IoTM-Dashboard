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

    val required = setOf(
      HealthPermission.getReadPermission(HeartRateRecord::class),
      HealthPermission.getReadPermission(BloodPressureRecord::class),
      HealthPermission.getReadPermission(OxygenSaturationRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
      HealthPermission.getReadPermission(SleepSessionRecord::class),
    )
    val granted = hc.permissionController.getGrantedPermissions()
    if (!granted.containsAll(required)) return Result.retry()

    try {
      val (startIso, endIso) = HcTokenStore.getBaselineRange(applicationContext)
      val outDir = applicationContext.getExternalFilesDir("health_data") ?: applicationContext.filesDir
      if (!outDir.exists()) outDir.mkdirs()

      // --- BASELINE BACKFILL: do at most one page per vital per run ---
      if (HcTokenStore.isBaselineInProgress(applicationContext) && startIso != null && endIso != null) {
        val tr = TimeRangeFilter.between(
          java.time.Instant.parse(startIso),
          java.time.Instant.parse(endIso)
        )

        val bpFile = File(outDir, "blood_pressure_data.json")
        val hrFile = File(outDir, "heart_rate_data.json")
        val spo2File = File(outDir, "spo2_data.json")
        val stepsFile = File(outDir, "steps_data.json")
        val sleepFile = File(outDir, "sleep_data.json")

        val bpNext = HcTokenStore.getNextPage(applicationContext, "bp")
        val hrNext = HcTokenStore.getNextPage(applicationContext, "hr")
        val spNext = HcTokenStore.getNextPage(applicationContext, "spo2")
        val stepsNext = HcTokenStore.getNextPage(applicationContext, "steps")
        val sleepNext = HcTokenStore.getNextPage(applicationContext, "sleep")

        var stillPending = false
        if (bpNext != null) {
          val next = HealthJsonWriters.appendNextPageBloodPressure(hc, tr, bpFile, bpNext, pageSize = 1000)
          HcTokenStore.setNextPage(applicationContext, "bp", next)
          stillPending = stillPending || (next != null)
        }
        if (hrNext != null) {
          val next = HealthJsonWriters.appendNextPageHeartRate(hc, tr, hrFile, hrNext, pageSize = 1000)
          HcTokenStore.setNextPage(applicationContext, "hr", next)
          stillPending = stillPending || (next != null)
        }
        if (spNext != null) {
          val next = HealthJsonWriters.appendNextPageSpo2(hc, tr, spo2File, spNext, pageSize = 1000)
          HcTokenStore.setNextPage(applicationContext, "spo2", next)
          stillPending = stillPending || (next != null)
        }
        if (stepsNext != null) {
          val next = HealthJsonWriters.appendNextPageSteps(hc, tr, stepsFile, stepsNext, pageSize = 1000)
          HcTokenStore.setNextPage(applicationContext, "steps", next)
          stillPending = stillPending || (next != null)
        }
        if (sleepNext != null) {
          val next = HealthJsonWriters.appendNextPageSleepSessions(hc, tr, sleepFile, sleepNext, pageSize = 500)
          HcTokenStore.setNextPage(applicationContext, "sleep", next)
          stillPending = stillPending || (next != null)
        }
        HcTokenStore.setBaselineInProgress(applicationContext, stillPending)
        if (stillPending) return Result.success() // do next chunk on the next run
      }

      // --- AFTER BASELINE: keep token fresh with minimal work ---
      // refresh token if stale (>30d)
      if (HcTokenStore.isTokenExpired(applicationContext) || HcTokenStore.getToken(applicationContext) == null) {
        val newToken = hc.getChangesToken(
          ChangesTokenRequest(setOf(
            HeartRateRecord::class,
            BloodPressureRecord::class,
            OxygenSaturationRecord::class,
            StepsRecord::class,
            SleepSessionRecord::class
          ))
        )
        HcTokenStore.saveToken(applicationContext, newToken)
      }

      // advance token to now without inspecting pages deeply
      var token = HcTokenStore.getToken(applicationContext)!!
      var page = hc.getChanges(token)
      while (true) {
        token = page.nextChangesToken
        HcTokenStore.saveToken(applicationContext, token)
        if (!page.hasMore) break
        page = hc.getChanges(token)
      }

      // refresh the last-7d JSONs with a single page each (1000 cap)
      if (!HcTokenStore.isBaselineInProgress(applicationContext)) {
            val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
            val start = now.minus(7, ChronoUnit.DAYS)
            val tr24 = TimeRangeFilter.between(start, now)

            // cleanup — overwrite existing files to prevent duplicates
            val bpFile = File(outDir, "blood_pressure_data.json")
            val hrFile = File(outDir, "heart_rate_data.json")
            val spo2File = File(outDir, "spo2_data.json")
            val stepsFile = File(outDir, "steps_data.json") 
            val sleepFile = File(outDir, "sleep_data.json") 
            bpFile.delete()
            hrFile.delete()
            spo2File.delete()
            stepsFile.delete()
            sleepFile.delete() 

            HealthJsonWriters.writeFirstPageBloodPressure(hc, tr24, bpFile, 1000)
            HealthJsonWriters.writeFirstPageHeartRate(hc, tr24, hrFile, 1000)
            HealthJsonWriters.writeFirstPageSpo2(hc, tr24, spo2File, 1000)
            HealthJsonWriters.writeFirstPageSteps(hc, tr24, stepsFile, 1000)
            HealthJsonWriters.writeFirstPageSleepSessions(hc, tr24, sleepFile, 1000)
        }

      HcTokenStore.saveLastSyncNow(applicationContext)

      // If we're in the debug loop mode, schedule the next run in N minutes.
      val isDebugLoop = inputData.getBoolean(KEY_DEBUG_LOOP, false)
      val everyMin = inputData.getLong(KEY_DEBUG_EVERY_MIN, 2L).coerceAtLeast(1L)
      if (isDebugLoop) {
        scheduleDebugLoop(applicationContext, everyMin)
      }
      return Result.success()
    } catch (e: Exception) {
      // backoff and try later to covers transient rate limiting
      return Result.retry()
    }
  }

  companion object {
    private const val UNIQUE_WORK_NAME = "hc_periodic_sync"
    private const val UNIQUE_ONE_TIME = "hc_sync_now"
    private const val UNIQUE_DEBUG_WORK_NAME = "hc_debug_loop"// debug-only loop

    // keys to tell the worker it's running in debug loop mode
    private const val KEY_DEBUG_LOOP = "debug_loop"
    private const val KEY_DEBUG_EVERY_MIN = "debug_every_min"

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

    // To kick a one-time run immediately (used after baseline)
    fun enqueueOneTime(context: Context) {
      val req = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()
      WorkManager.getInstance(context).enqueueUniqueWork(
        UNIQUE_ONE_TIME,
        androidx.work.ExistingWorkPolicy.KEEP,
        req
      )
    }

    /** DEBUG: Re-enqueue a one-time work every N minutes (e.g., 2) for fast testing. */
    fun scheduleDebugLoop(context: Context, everyMinutes: Long = 2L) {
      val data = workDataOf(
        KEY_DEBUG_LOOP to true,
        KEY_DEBUG_EVERY_MIN to everyMinutes
      )
      val req = OneTimeWorkRequestBuilder<HealthConnectSyncWorker>()
        .setInitialDelay(everyMinutes, TimeUnit.MINUTES)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .setInputData(data)
        .build()
      WorkManager.getInstance(context).enqueueUniqueWork(
        UNIQUE_DEBUG_WORK_NAME,
        ExistingWorkPolicy.REPLACE,
        req
      )
    }

    /** Stop the debug loop. */
    fun cancelDebugLoop(context: Context) {
      WorkManager.getInstance(context).cancelUniqueWork(UNIQUE_DEBUG_WORK_NAME)
    }
  }
}
