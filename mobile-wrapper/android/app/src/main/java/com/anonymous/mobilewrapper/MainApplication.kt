/**
 * @file MainApplication.kt
 * @brief Initializes the Android application, React Native host, Expo lifecycle, and WorkManager configuration.
 *
 * @description
 * The `MainApplication` class serves as the **global entry point** for the hybrid Android app.
 * It integrates the following key components:
 *
 * - **React Native Host**: Loads the JavaScript bundle via Metro or the compiled `.expo` entry point.
 * - **Expo Modules**: Manages application lifecycle through `ApplicationLifecycleDispatcher`.
 * - **WorkManager**: Configured globally to schedule background tasks (e.g., Health Connect syncs).
 * - **Custom Native Modules**: Registers the `HealthConnectPackage` for accessing native Health Connect APIs.
 *
 * This class ensures that the Android and JavaScript layers are properly initialized
 * before rendering begins in `MainActivity`.
 *
 * @remarks
 * - The app uses **WorkManagerConfiguration.Provider** to set debug-level logging for background sync tasks.
 * - Health Connect’s periodic background worker (`HealthConnectSyncWorker`) depends on this configuration.
 *
 * @see com.anonymous.mobilewrapper.health.HealthConnectPackage
 * @see com.anonymous.mobilewrapper.health.HealthConnectSyncWorker
 */

package com.anonymous.mobilewrapper

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.anonymous.mobilewrapper.health.HealthConnectPackage

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

import androidx.work.Configuration as WorkManagerConfiguration
import androidx.work.WorkManager
import android.util.Log

class MainApplication : Application(), ReactApplication, WorkManagerConfiguration.Provider {

  override val workManagerConfiguration: WorkManagerConfiguration
    get() = WorkManagerConfiguration.Builder()
      .setMinimumLoggingLevel(Log.DEBUG)
      .build()

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): MutableList<ReactPackage> {
            val packages = PackageList(this).packages
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(MyReactNativePackage())
            packages.add(HealthConnectPackage())
            return packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }


  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
