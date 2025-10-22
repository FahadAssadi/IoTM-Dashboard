package com.anonymous.mobilewrapper.models
import com.anonymous.mobilewrapper.models.Range

data class SpO2Point(
    val time: String,
    val percentage: Double
)

data class SpO2Payload(
    val range: Range,
    val points: List<SpO2Point>
)
