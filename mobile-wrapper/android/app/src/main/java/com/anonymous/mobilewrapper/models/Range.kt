/**
 * @file Range.kt
 * @brief Common model representing a time range for all health data payloads.
 *
 * @description
 * Defines the `Range` data class, which represents a start and end timestamp
 * (both in ISO-8601 string format). This class is used across all uploadable
 * payloads (e.g., HeartRatePayload, BloodPressurePayload, SleepPayload)
 * to indicate the period of data extraction from Health Connect.
 *
 * @usage
 * - Serialized by `HealthJsonWriters` when generating JSON files.
 * - Included in all payload classes uploaded via `ApiClient`.
 */

package com.anonymous.mobilewrapper.models

data class Range(
    val start: String,
    val end: String
)
