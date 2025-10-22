package com.anonymous.mobilewrapper.network

import com.anonymous.mobilewrapper.models.*
import retrofit2.Call
import retrofit2.http.*

interface HealthConnectApi {

    @POST("api/HealthConnect/bloodPressure/{userId}")
    fun uploadBloodPressure(
        @Path("userId") userId: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: BloodPressurePayload
    ): Call<Void>

     @POST("api/HealthConnect/bpm/{userId}")
    fun uploadHeartRate(
        @Path("userId") userId: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: HeartRatePayload
    ): Call<Void>

    @POST("api/HealthConnect/spo2/{userId}")
    fun uploadOxygenSaturation(
        @Path("userId") userId: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: SpO2Payload
    ): Call<Void>

    @POST("api/HealthConnect/sleep/{userId}")
    fun uploadSleepSession(
        @Path("userId") userId: String,
        @Header("Authorization") bearerToken: String,
        @Body payload: SleepPayload
    ): Call<Void>
}
