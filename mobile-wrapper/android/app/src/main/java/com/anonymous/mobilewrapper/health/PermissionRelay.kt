package com.anonymous.mobilewrapper.health

object PermissionRelay {
  @Volatile var callback: ((Set<String>) -> Unit)? = null
  fun deliver(granted: Set<String>) {
    callback?.invoke(granted)
    callback = null
  }
}
