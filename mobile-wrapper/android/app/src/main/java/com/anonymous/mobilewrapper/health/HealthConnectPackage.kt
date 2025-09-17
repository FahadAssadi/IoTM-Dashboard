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
