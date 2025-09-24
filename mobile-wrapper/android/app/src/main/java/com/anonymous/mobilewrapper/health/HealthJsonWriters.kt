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

  private fun loadOrCreate(rangeStart: String, rangeEnd: String, file: File): JSONObject {
    // Used by append* paths. If file missing, create a container.
    return if (file.exists()) JSONObject(file.readText())
    else newContainer(rangeStart, rangeEnd)
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
  // These now OVERWRITE the file so a re-seed doesn't duplicate page 1.
  // ----------------------------

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

    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

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

    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
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

    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
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

  suspend fun writeFirstPageSteps(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = null
      )
    )

    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

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

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun writeFirstPageSleepSessions(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = SleepSessionRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = null
      )
    )

    val json = newContainer(tr.startTime.toString(), tr.endTime.toString())
    val points = json.getJSONArray("points")

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
            .put("stage", s.stage) // int (e.g., 2=SLEEPING, 4=LIGHT, 5=DEEP, 6=REM)
            .put("stageName", stageName(s.stage))
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

  // ----------------------------
  // APPEND NEXT PAGE (uses existing file)
  // ----------------------------

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
        if (obj.has("id")) add(obj.getString("id")) else {
          val t = obj.optString("time")
          val origin = obj.optString("origin")
          add("$t|$origin")
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
        if (recId.isNotEmpty()) add(recId) else {
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

  suspend fun appendNextPageSteps(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    nextPageToken: String,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = tr,
        pageSize = pageSize,
        pageToken = nextPageToken
      )
    )

    val json = loadOrCreate(tr.startTime.toString(), tr.endTime.toString(), file)
    val points = json.getJSONArray("points")

    // de-dupe by recordId or start|end|origin as a fallback
    val seen = HashSet<String>().apply {
      for (i in 0 until points.length()) {
        val o = points.getJSONObject(i)
        val recId = o.optString("recordId")
        val key = if (recId.isNotEmpty()) recId else "${o.optString("start")}|${o.optString("end")}|${o.optString("origin")}"
        add(key)
      }
    }

    resp.records.forEach { r ->
      val meta = r.metadata
      val recId = meta.id ?: "${r.startTime}|${r.endTime}|${meta.dataOrigin.packageName}"
      if (seen.add(recId)) {
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
    }

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }

  suspend fun appendNextPageSleepSessions(
    hc: HealthConnectClient,
    tr: TimeRangeFilter,
    file: File,
    nextPageToken: String,
    pageSize: Int = 1000
  ): String? {
    val resp = hc.readRecords(
      ReadRecordsRequest(
        recordType = SleepSessionRecord::class,
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
        val recId = o.optString("recordId")
        val key = if (recId.isNotEmpty()) recId else "${o.optString("start")}|${o.optString("end")}|${o.optString("origin")}"
        add(key)
      }
    }

    resp.records.forEach { session ->
      val meta = session.metadata
      val recordId = meta.id
      val origin = meta.dataOrigin.packageName
      val recMethod = meta.recordingMethod?.toString()

      session.stages.forEach { s ->
        val key = "${recordId}|${s.startTime}|${s.endTime}|${s.stage}|$origin"
        if (seen.add(key)) {
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
    }

    json.put("partial", resp.pageToken != null)
    json.put("nextPageToken", resp.pageToken ?: JSONObject.NULL)
    save(file, json)
    return resp.pageToken
  }
}
