/**
 * @file BloodPressurePayload.kt
 * @brief Data model for representing and uploading blood pressure records.
 *
 * @description
 * Defines the schema used for serializing and uploading blood pressure
 * measurements from Health Connect to the backend API. The structure mirrors
 * the JSON format produced by `HealthJsonWriters.writeBloodPressureWindow()`.
 *
 * Each payload represents:
 * - A 30-day time range of data
 * - A list of discrete blood pressure readings, each containing
 *   systolic and diastolic values with timestamps.
 *
 * @usage
 * Used by:
 * - `HealthJsonWriters` to serialize JSON output
 * - `HealthConnectSyncWorker` and `ApiClient.uploadBloodPressure()` to upload
 *   this data to the remote server.
 *
 * @see com.anonymous.mobilewrapper.health.HealthJsonWriters
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

package com.anonymous.mobilewrapper.models
import com.anonymous.mobilewrapper.models.Range

data class BloodPressurePoint(
    val time: String,
    val sys: Int,
    val dia: Int
)

data class BloodPressurePayload(
    val range: Range,
    val points: List<BloodPressurePoint>
)
