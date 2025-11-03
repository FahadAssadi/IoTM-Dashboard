/**
 * @file PermissionProxyActivity.kt
 * @brief Temporary proxy activity that requests Health Connect permissions
 *        and relays results back to the React Native bridge.
 *
 * @description
 * `PermissionProxyActivity` is a lightweight, invisible `ComponentActivity`
 * launched by the `HealthConnectModule` when permission requests must be
 * handled outside the React Native context.
 *
 * The activity:
 * 1. Receives a list of required Health Connect permissions via intent extras.
 * 2. Launches the Android Health Connect permission screen using
 *    `PermissionController.createRequestPermissionResultContract()`.
 * 3. Forwards the granted permissions to `PermissionRelay`, which notifies
 *    the pending React Native promise callback.
 * 4. Finishes immediately after completion.
 *
 *
 * @see com.anonymous.mobilewrapper.health.HealthConnectModule
 * @see androidx.health.connect.client.PermissionController
 */

package com.anonymous.mobilewrapper.health

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.PermissionController

// Activity used as a trampoline to handle Health Connect permission requests.
class PermissionProxyActivity : ComponentActivity() {
  private var launcher: ActivityResultLauncher<Set<String>>? = null

  // Launches the Health Connect permission dialog immediately.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Extract the permissions passed via intent
    val perms = intent.getStringArrayListExtra(EXTRA_PERMS)?.toSet() ?: emptySet()

    launcher = registerForActivityResult(
      PermissionController.createRequestPermissionResultContract()
    ) { granted ->
      PermissionRelay.deliver(granted)
      finish()
    }

    launcher?.launch(perms)
  }

  companion object {
    // Intent extra key for permission list
    const val EXTRA_PERMS = "EXTRA_PERMS"
  }
}
