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
