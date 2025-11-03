/**
 * @file HealthConnectPackage.kt
 * @brief React Native package registration class for the Health Connect bridge module.
 *
 * @description
 * This file defines the `HealthConnectPackage`, which registers the
 * `HealthConnectModule` as a native module for use in the React Native
 * JavaScript layer.
 *
 * - The package registers `HealthConnectModule`, which exposes all
 *   Health Connect–related methods to JavaScript (see `HealthConnectModule.kt`).
 * - No native UI components are created, so `createViewManagers()` returns an empty list.
 *
 * @usage
 * The React Native runtime automatically loads this package when the app initializes,
 * enabling JavaScript to call `NativeModules.HealthConnectModule` methods directly.
 *
 */

package com.anonymous.mobilewrapper.health

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HealthConnectPackage : ReactPackage {
  override fun createNativeModules(rc: ReactApplicationContext): List<NativeModule> =
    listOf(HealthConnectModule(rc))
  override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
