package com.anonymous.mobilewrapper.health

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

object HealthJsonWriters {

  private fun newContainer(rangeStart: String, rangeEnd: String): JSONObject =
    JSONObject().apply {
      put("range", JSONObject().put("start", rangeStart).put("end", rangeEnd))
      put("points", JSONArray())
    }


  private fun save(file: File, json: JSONObject) {
    file.writeText(json.toString(), Charsets.UTF_8)
  }

  private fun stageName(stage: Int): String = when (stage) {
    6 -> "REM"
    5 -> "DEEP"
    4 -> "LIGHT"
    2 -> "SLEEPING"
    1 -> "AWAKE"
    7 -> "AWAKE_IN_BED"
    3 -> "OUT_OF_BED"
    else -> "UNKNOWN"
  }

  // ----------------------------
  // FIRST PAGE (seed, single call)
  // ----------------------------

  suspend fun writeHeartRateWindow(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ) {
    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

    var pageToken: String? = null
    var pagesFetched = 0
    val maxPages = 5
    do {
      if (pagesFetched >= maxPages) {
          break
      }
      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = HeartRateRecord::class,
          timeRangeFilter = tr,
          pageSize = pageSize,
          pageToken = pageToken
        )
      )
      resp.records.forEach { r ->
        val meta = r.metadata
        val recordId = meta.id
        val origin = meta.dataOrigin.packageName
        val recMethod = meta.recordingMethod?.toString()
        r.samples.forEach { s ->
          points.put(
            JSONObject()
              .put("time", s.time.toString())
              .put("bpm", s.beatsPerMinute)
              .put("recordId", recordId)
              .put("origin", origin)
              .put("recordingMethod", recMethod)
          )
        }
      }
      pageToken = resp.pageToken
      pagesFetched++
    } while (pageToken != null)

    save(file, json)
  }

  suspend fun writeBloodPressureWindow(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ) {
    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

    var pageToken: String? = null
    var pagesFetched = 0
    val maxPages = 5
    do {
      if (pagesFetched >= maxPages) {
          break
      }
      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = BloodPressureRecord::class,
          timeRangeFilter = tr,
          pageSize = pageSize,
          pageToken = pageToken
        )
      )
      resp.records.forEach { r ->
        val meta = r.metadata
        val id = meta.id ?: "${r.time}-${meta.dataOrigin.packageName}"
        val origin = meta.dataOrigin.packageName
        val recMethod = meta.recordingMethod?.toString()
        points.put(
          JSONObject()
            .put("id", id)
            .put("time", r.time.toString())
            .put("sys", r.systolic.inMillimetersOfMercury)
            .put("dia", r.diastolic.inMillimetersOfMercury)
            .put("origin", origin)
            .put("recordingMethod", recMethod)
        )
      }
      pageToken = resp.pageToken
      pagesFetched++
    } while (pageToken != null)

    save(file, json)
  }

  suspend fun writeSpo2Window(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ) {
    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

    var pageToken: String? = null
    var pagesFetched = 0
    val maxPages = 5
    do {
      if (pagesFetched >= maxPages) {
          break
      }
      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = OxygenSaturationRecord::class,
          timeRangeFilter = tr,
          pageSize = pageSize,
          pageToken = pageToken
        )
      )
      resp.records.forEach { r ->
        val meta = r.metadata
        val recordId = meta.id
        val origin = meta.dataOrigin.packageName
        val recMethod = meta.recordingMethod?.toString()
        points.put(
          JSONObject()
            .put("time", r.time.toString())
            .put("percentage", r.percentage.value)
            .put("recordId", recordId)
            .put("origin", origin)
            .put("recordingMethod", recMethod)
        )
      }
      pageToken = resp.pageToken
      pagesFetched++
    } while (pageToken != null)

    save(file, json)
  }

  suspend fun writeStepsWindow(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ) {
    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

    var pageToken: String? = null
    var pagesFetched = 0
    val maxPages = 5
    do {
      if (pagesFetched >= maxPages) {
          break
      }
      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = StepsRecord::class,
          timeRangeFilter = tr,
          pageSize = pageSize,
          pageToken = pageToken
        )
      )
      resp.records.forEach { r ->
        val meta = r.metadata
        points.put(
          JSONObject()
            .put("start", r.startTime.toString())
            .put("end", r.endTime.toString())
            .put("count", r.count)
            .put("recordId", meta.id)
            .put("origin", meta.dataOrigin.packageName)
            .put("recordingMethod", meta.recordingMethod?.toString())
        )
      }
      pageToken = resp.pageToken
      pagesFetched++
    } while (pageToken != null)

    save(file, json)
  }

  suspend fun writeSleepSessionsWindow(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ) {
    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

    var pageToken: String? = null
    var pagesFetched = 0
    val maxPages = 5
    do {
      if (pagesFetched >= maxPages) {
          break
      }
      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = SleepSessionRecord::class,
          timeRangeFilter = tr,
          pageSize = pageSize,
          pageToken = pageToken
        )
      )
      resp.records.forEach { session ->
        val meta = session.metadata
        val recordId = meta.id
        val origin = meta.dataOrigin.packageName
        val recMethod = meta.recordingMethod?.toString()
        session.stages.forEach { s ->
          points.put(
            JSONObject()
              .put("start", s.startTime.toString())
              .put("end", s.endTime.toString())
              .put("stage", s.stage)
              .put("stageName", stageName(s.stage))
              .put("recordId", recordId)
              .put("origin", origin)
              .put("recordingMethod", recMethod)
          )
        }
      }
      pageToken = resp.pageToken
      pagesFetched++
    } while (pageToken != null)

    save(file, json)
  }
}