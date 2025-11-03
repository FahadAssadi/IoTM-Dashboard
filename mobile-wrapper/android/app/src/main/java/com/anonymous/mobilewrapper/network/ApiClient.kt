/**
 * @file ApiClient.kt
 * @brief Retrofit API client configuration for communicating with the .NET backend.
 *
 * @description
 * This file configures the Retrofit HTTP client used by the Android wrapper
 * to send serialized health data (e.g., heart rate, SpO₂, blood pressure, etc.)
 * to the backend API.
 *
 * The API is currently hosted locally at `http://192.168.1.103:5225/` and exposed
 * over the local network for development and testing purposes.
 *
 * @limitations
 * - Since the .NET API is not deployed to a remote or cloud server, external devices
 *   (e.g., physical Android phones not on the same Wi-Fi network) **cannot access it**.
 * - Mobile WebViews or emulators **must share the same network** as the host machine.
 * - There is **no HTTPS/TLS encryption**, which makes it unsuitable for production use.
 * - The IP address may change depending on your local machine’s network interface.
 * - The backend must be running manually via `dotnet run` or similar commands for requests to succeed.
 *
 * @future
 * In production, this should be replaced with a deployed API endpoint (e.g., on Azure, AWS, or Supabase Edge)
 * secured via HTTPS and with CORS configured for your web and mobile clients.
 *
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 * @see com.anonymous.mobilewrapper.models
 */

package com.anonymous.mobilewrapper.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "http://192.168.1.103:5225/"

    private val interceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(interceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val instance: HealthConnectApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(HealthConnectApi::class.java)
    }
}
