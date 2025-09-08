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
      r.samples.forEach { s ->
        points.put(JSONObject().put("time", s.time.toString()).put("bpm", s.beatsPerMinute))
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
      val id = r.metadata.id ?: "${r.time}-${r.metadata.dataOrigin.packageName}"
      points.put(
        JSONObject()
          .put("id", id)
          .put("time", r.time.toString())
          .put("sys", r.systolic.inMillimetersOfMercury)
          .put("dia", r.diastolic.inMillimetersOfMercury)
          .put("origin", r.metadata.dataOrigin.packageName)
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
      points.put(JSONObject().put("time", r.time.toString()).put("percentage", r.percentage.value))
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
    val seen = HashSet<String>().apply {
      for (i in 0 until points.length()) add(points.getJSONObject(i).getString("time"))
    }
    resp.records.forEach { r ->
      r.samples.forEach { s ->
        val key = s.time.toString()
        if (seen.add(key)) {
          points.put(JSONObject().put("time", key).put("bpm", s.beatsPerMinute))
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
        if (obj.has("id")) add(obj.getString("id")) else add(obj.getString("time"))
      }
    }
    resp.records.forEach { r ->
      val id = r.metadata.id ?: "${r.time}-${r.metadata.dataOrigin.packageName}"
      if (seen.add(id)) {
        points.put(
          JSONObject()
            .put("id", id)
            .put("time", r.time.toString())
            .put("sys", r.systolic.inMillimetersOfMercury)
            .put("dia", r.diastolic.inMillimetersOfMercury)
            .put("origin", r.metadata.dataOrigin.packageName)
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
      for (i in 0 until points.length()) add(points.getJSONObject(i).getString("time"))
    }
    resp.records.forEach { r ->
      val key = r.time.toString()
      if (seen.add(key)) {
        points.put(JSONObject().put("time", key).put("percentage", r.percentage.value))
      }
    }
    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }
}
