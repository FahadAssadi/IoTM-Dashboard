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
