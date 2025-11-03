/**
 * @file health.ts
 * @brief Type-safe React Native bridge to the Android Health Connect native module.
 *
 * @description
 * This module provides a strongly typed JavaScript interface to the native
 * `HealthConnectModule` implemented in Kotlin. It acts as the middle layer between:
 *
 * WebView (Next.js) → React Native (JS Bridge) → Kotlin (NativeModule) → Health Connect API
 *
 * The exported `Health` object safely wraps calls to the underlying
 * Android native module, ensuring platform and availability checks are
 * performed before invoking native functions.
 *
 * @remarks
 * - These methods only execute on Android; they safely no-op or throw on iOS.
 *
 * @see com.anonymous.mobilewrapper.health.HealthConnectModule
 * @see ../index.tsx
 */

import { NativeModules, Platform } from "react-native";

type HealthConnectNative = {
  isAvailable: () => Promise<boolean>;
  hasRequiredPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<void>;
  extractBaselineAndStoreToken: (userId: string, token: string) => Promise<boolean>;
  runHealthSyncNow: (userId: string, token: string) => Promise<boolean>;
};

const native = NativeModules.HealthConnectModule as Partial<HealthConnectNative> | undefined;

// Optional: safe wrapper with platform/linking guards
export const Health: HealthConnectNative = {
  async isAvailable() {
    if (Platform.OS !== "android" || !native?.isAvailable) return false;
    return native.isAvailable();
  },
  async hasRequiredPermissions() {
    if (Platform.OS !== "android" || !native?.hasRequiredPermissions) return false;
    return native.hasRequiredPermissions();
  },
  async requestPermissions() {
    if (Platform.OS !== "android" || !native?.requestPermissions) {
      throw new Error("HealthConnectModule not available");
    }
    return native.requestPermissions();
  },
  async extractBaselineAndStoreToken(userId: string, token: string) {
    if (Platform.OS !== "android" || !native?.extractBaselineAndStoreToken)
      throw new Error("HealthConnectModule not available");
    return native.extractBaselineAndStoreToken(userId, token);
  },
  async runHealthSyncNow(userId: string, token: string) {
    if (Platform.OS !== "android" || !native?.runHealthSyncNow)
      throw new Error("HealthConnectModule not available");
    return native.runHealthSyncNow(userId, token);
  },

};
