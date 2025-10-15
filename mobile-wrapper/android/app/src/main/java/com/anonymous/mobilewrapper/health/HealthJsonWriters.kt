package com.anonymous.mobilewrapper.health

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
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

  private fun exerciseTypeName(type: Int): String = when (type) {
    0 -> "OTHER_WORKOUT"
    2 -> "BADMINTON"
    4 -> "BASEBALL"
    5 -> "BASKETBALL"
    8 -> "BIKING"
    9 -> "BIKING_STATIONARY"
    10 -> "BOOT_CAMP"
    11 -> "BOXING"
    13 -> "CALISTHENICS"
    14 -> "CRICKET"
    16 -> "DANCING"
    25 -> "ELLIPTICAL"
    26 -> "EXERCISE_CLASS"
    27 -> "FENCING"
    28 -> "FOOTBALL_AMERICAN"
    29 -> "FOOTBALL_AUSTRALIAN"
    31 -> "FRISBEE_DISC"
    32 -> "GOLF"
    33 -> "GUIDED_BREATHING"
    34 -> "GYMNASTICS"
    35 -> "HANDBALL"
    36 -> "HIIT"
    37 -> "HIKING"
    38 -> "ICE_HOCKEY"
    39 -> "ICE_SKATING"
    44 -> "MARTIAL_ARTS"
    46 -> "PADDLING"
    47 -> "PARAGLIDING"
    48 -> "PILATES"
    50 -> "RACQUETBALL"
    51 -> "ROCK_CLIMBING"
    52 -> "ROLLER_HOCKEY"
    53 -> "ROWING"
    54 -> "ROWING_MACHINE"
    55 -> "RUGBY"
    56 -> "RUNNING"
    57 -> "RUNNING_TREADMILL"
    58 -> "SAILING"
    59 -> "SCUBA_DIVING"
    60 -> "SKATING"
    61 -> "SKIING"
    62 -> "SNOWBOARDING"
    63 -> "SNOWSHOEING"
    64 -> "SOCCER"
    65 -> "SOFTBALL"
    66 -> "SQUASH"
    68 -> "STAIR_CLIMBING"
    69 -> "STAIR_CLIMBING_MACHINE"
    70 -> "STRENGTH_TRAINING"
    71 -> "STRETCHING"
    72 -> "SURFING"
    73 -> "SWIMMING_OPEN_WATER"
    74 -> "SWIMMING_POOL"
    75 -> "TABLE_TENNIS"
    76 -> "TENNIS"
    78 -> "VOLLEYBALL"
    79 -> "WALKING"
    80 -> "WATER_POLO"
    81 -> "WEIGHTLIFTING"
    82 -> "WHEELCHAIR"
    83 -> "YOGA"
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

  suspend fun writeExerciseSessionsWindow(
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
      if (pagesFetched >= maxPages) break

      val resp = hc.readRecords(
        ReadRecordsRequest(
          recordType = ExerciseSessionRecord::class,
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
            .put("exerciseTypeName", exerciseTypeName(r.exerciseType))
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
}