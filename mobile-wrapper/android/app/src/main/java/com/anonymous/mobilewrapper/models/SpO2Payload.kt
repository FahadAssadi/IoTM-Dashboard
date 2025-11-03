/**
 * @file SpO2Payload.kt
 * @brief Data model for representing and uploading blood oxygen saturation readings.
 *
 * @description
 * Defines the schema used to serialize oxygen saturation data
 * extracted from Health Connect into a standardized format for backend upload.
 *
 * Each `SpO2Point` represents a single measurement of peripheral oxygen saturation,
 * recorded as a percentage value at a specific timestamp.
 *
 *
 * @usage
 * Used by:
 * - `HealthJsonWriters` to export SpO2 data from Health Connect
 * - `HealthConnectSyncWorker` and `ApiClient.uploadOxygenSaturation()` to
 *   upload data to the backend server
 *
 * @see com.anonymous.mobilewrapper.health.HealthJsonWriters
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

package com.anonymous.mobilewrapper.models
import com.anonymous.mobilewrapper.models.Range

data class SpO2Point(
    val time: String,
    val percentage: Int
)

data class SpO2Payload(
    val range: Range,
    val points: List<SpO2Point>
)
