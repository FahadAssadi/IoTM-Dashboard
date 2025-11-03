/**
 * @file HealthConnectApi.kt
 * @brief Retrofit interface defining endpoints for uploading Health Connect data to the .NET backend.
 *
 * @description
 * This interface defines the HTTP endpoints used by the Android wrapper to send
 * health metric payloads (Blood Pressure, Heart Rate, SpO2, and Sleep) to the
 * backend API for persistence and analytics.
 *
 * Each function uses Retrofit’s `@POST` annotation to send data as JSON in the
 * request body, authenticated via a Bearer token from Supabase.
 *
 * @see com.anonymous.mobilewrapper.network.ApiClient
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

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
