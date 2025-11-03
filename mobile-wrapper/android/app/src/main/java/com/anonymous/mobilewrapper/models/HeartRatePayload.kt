/**
 * @file HeartRatePayload.kt
 * @brief Data model for representing and uploading heart rate records.
 *
 * @description
 * Defines the schema used for serializing heart rate data extracted from
 * Health Connect into a format ready for backend upload. This structure
 * directly matches the JSON produced by
 * `HealthJsonWriters.writeHeartRateWindow()`.
 *
 * Each payload includes:
 * - A time range 
 * - A list of heart rate points, each containing a timestamp and beats per minute (BPM)
 *
 * @usage
 * Used by:
 * - `HealthJsonWriters` for JSON serialization of heart rate data
 * - `HealthConnectSyncWorker` and `ApiClient.uploadHeartRate()` to send the data
 *   to the server.
 *
 * @see com.anonymous.mobilewrapper.health.HealthJsonWriters
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

package com.anonymous.mobilewrapper.models
import com.anonymous.mobilewrapper.models.Range

data class HeartRatePoint(
    val time: String,
    val bpm: Int
)

data class HeartRatePayload(
    val range: Range,
    val points: List<HeartRatePoint>
)