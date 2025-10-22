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