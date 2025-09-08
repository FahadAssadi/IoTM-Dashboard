import { NativeModules, Platform } from "react-native";

type HealthConnectNative = {
  isAvailable: () => Promise<boolean>;
  hasRequiredPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<void>;
  writeLast7DaysHeartRateToFile: () => Promise<string>;
  writeLast7DaysHeartRateAggregateJson: () => Promise<string>;
  writeLast7DaysBloodPressureToFile: () => Promise<string>;
  writeLast7DaysOxygenSaturationToFile: () => Promise<string>;
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
  async writeLast7DaysHeartRateToFile() {
    if (Platform.OS !== "android" || !native?.writeLast7DaysHeartRateToFile) throw new Error("HealthConnectModule not available");
    return native.writeLast7DaysHeartRateToFile();
  },
  async writeLast7DaysHeartRateAggregateJson() {
    if (Platform.OS !== "android" || !native?.writeLast7DaysHeartRateAggregateJson) {
      throw new Error("HealthConnectModule not available");
    }
    return native.writeLast7DaysHeartRateAggregateJson();
  },
  async writeLast7DaysBloodPressureToFile() {
    if (Platform.OS !== "android" || !native?.writeLast7DaysBloodPressureToFile)
      throw new Error("HealthConnectModule not available");
    return native.writeLast7DaysBloodPressureToFile();
  },
  async writeLast7DaysOxygenSaturationToFile() {
    if (Platform.OS !== "android" || !native?.writeLast7DaysOxygenSaturationToFile)
      throw new Error("HealthConnectModule not available");
    return native.writeLast7DaysOxygenSaturationToFile();
  },

};
