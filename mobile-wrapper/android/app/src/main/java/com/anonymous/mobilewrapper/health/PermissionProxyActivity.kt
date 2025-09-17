package com.anonymous.mobilewrapper.health

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.PermissionController

class PermissionProxyActivity : ComponentActivity() {
  private var launcher: ActivityResultLauncher<Set<String>>? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

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
    const val EXTRA_PERMS = "EXTRA_PERMS"
  }
}
