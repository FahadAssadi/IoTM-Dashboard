/**
 * @file SleepPayload.kt
 * @brief Data model for representing and uploading sleep stage session data.
 *
 * @description
 * Defines the schema used to serialize sleep session records extracted from
 * Health Connect into a structured format for backend upload. Each `SleepPoint`
 * represents one contiguous sleep stage (e.g., REM, DEEP, LIGHT) with a start
 * and end time.
 *
 * @usage
 * Used by:
 * - `HealthJsonWriters` when serializing sleep session data to JSON
 * - `HealthConnectSyncWorker` and `ApiClient.uploadSleepSession()` for backend sync
 *
 * @see com.anonymous.mobilewrapper.health.HealthJsonWriters
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

package com.anonymous.mobilewrapper.models
import com.anonymous.mobilewrapper.models.Range

data class SleepPoint(
    val start: String,
    val end: String,
    val stageName: String,
    val stage: Int
)

data class SleepPayload(
    val range: Range,
    val points: List<SleepPoint>
)
