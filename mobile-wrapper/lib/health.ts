import { NativeModules, Platform } from "react-native";

type HealthConnectNative = {
  isAvailable: () => Promise<boolean>;
  hasRequiredPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<void>;
  dumpLast7DaysJson: () => Promise<string>; // returns JSON string

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
  async dumpLast7DaysJson() {
    if (Platform.OS !== "android" || !native?.dumpLast7DaysJson) {
      throw new Error("HealthConnectModule not available");
    }
    return native.dumpLast7DaysJson();
  },

};
