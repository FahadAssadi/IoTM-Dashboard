package com.anonymous.mobilewrapper.health

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

object HealthJsonWriters {

  private fun loadOrCreate(rangeStart: String, rangeEnd: String, file: File): JSONObject {
    val obj = if (file.exists()) JSONObject(file.readText()) else JSONObject()
    if (!obj.has("range")) {
      obj.put("range", JSONObject().put("start", rangeStart).put("end", rangeEnd))
      obj.put("points", JSONArray())
    }
    return obj
  }

  private fun save(file: File, json: JSONObject) {
    file.writeText(json.toString(), Charsets.UTF_8)
  }

  // FIRST PAGE (seed, single call)

  suspend fun writeFirstPageHeartRate(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = HeartRateRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = null
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

    resp.records.forEach { r ->
      val meta = r.metadata
      val recordId = meta.id
      val origin = meta.dataOrigin.packageName
      val recMethod = meta.recordingMethod?.toString()

      r.samples.forEach { s ->
        // store per-sample with parent record metadata
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

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun writeFirstPageBloodPressure(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = BloodPressureRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = null
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

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

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun writeFirstPageSpo2(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = OxygenSaturationRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = null
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

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

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  // APPEND NEXT PAGE (one call each run)

  suspend fun appendNextPageHeartRate(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    nextPageToken: String,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = HeartRateRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = nextPageToken
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

    // Build a set of compound keys to avoid collisions across origins/records at the same timestamp
    val seen = HashSet<String>().apply {
      for (i in 0 until points.length()) {
        val o = points.getJSONObject(i)
        val t = o.optString("time")
        val origin = o.optString("origin")
        val recId = o.optString("recordId")
        add("$t|$origin|$recId")
      }
    }

    resp.records.forEach { r ->
      val meta = r.metadata
      val recordId = meta.id
      val origin = meta.dataOrigin.packageName
      val recMethod = meta.recordingMethod?.toString()

      r.samples.forEach { s ->
        val key = "${s.time}|$origin|$recordId"
        if (seen.add(key)) {
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
    }

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun appendNextPageBloodPressure(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    nextPageToken: String,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = BloodPressureRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = nextPageToken
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

    val seen = HashSet<String>().apply {
      for (i in 0 until points.length()) {
        val obj = points.getJSONObject(i)
        when {
          obj.has("id") -> add(obj.getString("id"))
          else -> {
            // legacy fallback
            val t = obj.optString("time")
            val origin = obj.optString("origin")
            add("$t|$origin")
          }
        }
      }
    }

    resp.records.forEach { r ->
      val meta = r.metadata
      val id = meta.id ?: "${r.time}-${meta.dataOrigin.packageName}"
      if (seen.add(id)) {
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
    }

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun appendNextPageSpo2(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    nextPageToken: String,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = OxygenSaturationRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = nextPageToken
      )
    )
    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

    val seen = HashSet<String>().apply {
      for (i in 0 until points.length()) {
        val o = points.getJSONObject(i)
        val recId = o.optString("recordId", "")
        if (recId.isNotEmpty()) {
          add(recId)
        } else {
          val t = o.optString("time")
          val origin = o.optString("origin")
          add("$t|$origin")
        }
      }
    }

    resp.records.forEach { r ->
      val meta = r.metadata
      val recordId = meta.id
      val origin = meta.dataOrigin.packageName
      val recMethod = meta.recordingMethod?.toString()

      val key = recordId ?: "${r.time}|$origin"
      if (seen.add(key)) {
        points.put(
          JSONObject()
            .put("time", r.time.toString())
            .put("percentage", r.percentage.value)
            .put("recordId", recordId)
            .put("origin", origin)
            .put("recordingMethod", recMethod)
        )
      }
    }

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }
}
