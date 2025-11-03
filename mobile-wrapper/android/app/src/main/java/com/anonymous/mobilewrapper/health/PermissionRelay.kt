/**
 * @file PermissionRelay.kt
 * @brief Provides a static relay mechanism for delivering Health Connect
 *        permission results back to the React Native bridge.
 *
 * @description
 * `PermissionRelay` acts as a lightweight singleton callback holder
 * that bridges between:
 * - `PermissionProxyActivity`, which receives Android Health Connect
 *   permission results, and
 * - `HealthConnectModule`, which initiated the permission request and
 *   is waiting on a JavaScript promise.
 *
 * @usage
 * - `HealthConnectModule` assigns `PermissionRelay.callback` before
 *   launching `PermissionProxyActivity`.
 * - `PermissionProxyActivity` calls `PermissionRelay.deliver(granted)`
 *   once it receives the result from the system permission flow.
 *
 * @see com.anonymous.mobilewrapper.health.PermissionProxyActivity
 * @see com.anonymous.mobilewrapper.health.HealthConnectModule
 */

package com.anonymous.mobilewrapper.health

object PermissionRelay {
  @Volatile var callback: ((Set<String>) -> Unit)? = null
  fun deliver(granted: Set<String>) {
    callback?.invoke(granted)
    callback = null
  }
}
