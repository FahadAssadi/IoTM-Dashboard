package com.anonymous.mobilewrapper.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
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
    )
    val granted = hc.permissionController.getGrantedPermissions()
    if (!granted.containsAll(required)) return Result.retry()

    try {
      val (startIso, endIso) = HcTokenStore.getBaselineRange(applicationContext)
      val outDir = applicationContext.getExternalFilesDir("health_dumps") ?: applicationContext.filesDir
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

        val bpNext = HcTokenStore.getNextPage(applicationContext, "bp")
        val hrNext = HcTokenStore.getNextPage(applicationContext, "hr")
        val spNext = HcTokenStore.getNextPage(applicationContext, "spo2")

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
            OxygenSaturationRecord::class
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

      // refresh the last-30d JSONs with a single page each (1000 cap)
      val now = ZonedDateTime.now(ZoneOffset.UTC).toInstant()
      val start = now.minus(30, ChronoUnit.DAYS)
      val tr24 = TimeRangeFilter.between(start, now)

      val bpFile = File(outDir, "blood_pressure_data.json")
      val hrFile = File(outDir, "heart_rate_data.json")
      val spo2File = File(outDir, "spo2_data.json")

      // single call (will include partial + nextPageToken if >1000)
      HealthJsonWriters.writeFirstPageBloodPressure(hc, tr24, bpFile, 1000)
      HealthJsonWriters.writeFirstPageHeartRate(hc, tr24, hrFile, 1000)
      HealthJsonWriters.writeFirstPageSpo2(hc, tr24, spo2File, 1000)

      HcTokenStore.saveLastSyncNow(applicationContext)
      return Result.success()
    } catch (e: Exception) {
      // backoff and try later to covers transient rate limiting
      return Result.retry()
    }
  }

  companion object {
    private const val UNIQUE_WORK_NAME = "hc_periodic_sync"
    private const val UNIQUE_ONE_TIME = "hc_sync_now"

    fun schedule(context: Context, repeatHours: Long = 1L) {
      val req = PeriodicWorkRequestBuilder<HealthConnectSyncWorker>(repeatHours, TimeUnit.HOURS)
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
  }
}
