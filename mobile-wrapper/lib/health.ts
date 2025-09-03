import { NativeModules, Platform } from "react-native";

type HealthConnectNative = {
  isAvailable: () => Promise<boolean>;
  hasRequiredPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<void>;
  getLast7DaysHeartRateJson: () => Promise<string>;
  writeLast7DaysHeartRateToFile: () => Promise<string>;
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
  async getLast7DaysHeartRateJson() {
    if (Platform.OS !== "android" || !native?.getLast7DaysHeartRateJson) {
      throw new Error("HealthConnectModule not available");
    }
    return native.getLast7DaysHeartRateJson();
  },
  async writeLast7DaysHeartRateToFile() {
    if (Platform.OS !== "android" || !native?.writeLast7DaysHeartRateToFile) throw new Error("HealthConnectModule not available");
    return native.writeLast7DaysHeartRateToFile();
  },

};
