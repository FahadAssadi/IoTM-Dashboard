import React, { useCallback, useRef } from "react";
import { Alert, SafeAreaView, StyleSheet, View, Pressable, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { Health } from "../lib/health";

const WEB_URL = "http://192.168.1.109:3000/?embedded=rn"; 

export default function Screen() {
  const webRef = useRef<WebView>(null);

  const postToWeb = useCallback((type: string, payload?: any) => {
    webRef.current?.postMessage(JSON.stringify({ type, ...(payload ? { payload } : {}) }));
  }, []);

  // Native actions exposed to the web
  const doCheckAvailable = useCallback(async () => {
    try {
      const ok = await Health.isAvailable();
      postToWeb("HC_AVAILABLE", { ok });
      return ok;
    } catch (e) {
      postToWeb("HC_AVAILABLE_ERROR", { error: String(e) });
      throw e;
    }
  }, [postToWeb]);

  const doCheckPerms = useCallback(async () => {
    try {
      const has = await Health.hasRequiredPermissions();
      postToWeb("HC_HAS_PERMS", { has });
      return has;
    } catch (e) {
      postToWeb("HC_HAS_PERMS_ERROR", { error: String(e) });
      throw e;
    }
  }, [postToWeb]);

  const doRequestPerms = useCallback(async () => {
    try {
      await Health.requestPermissions();
      postToWeb("HC_PERMS_GRANTED");
      return true;
    } catch (e) {
      postToWeb("HC_PERMS_ERROR", { error: String(e) });
      throw e;
    }
  }, [postToWeb]);

  const doWriteFile = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) {
        postToWeb("HC_UNAVAILABLE");
        return;
      }
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      const fileUri = await Health.writeLast7DaysHeartRateToFile(); // returns "file://..."
      const info = await FileSystem.getInfoAsync(fileUri);
      postToWeb("HR_FILE_READY", { fileUri, size: info.exists ? info.size ?? 0 : 0 });
    } catch (e) {
      postToWeb("HR_FILE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const fetchHrAgg7d = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) {
        postToWeb("HC_UNAVAILABLE");
        return;
      }
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      const fileUri = await Health.writeLast7DaysHeartRateAggregateJson(); // returns "file://..."
      const info = await FileSystem.getInfoAsync(fileUri);
      postToWeb("HR_FILE_READY", { fileUri, size: info.exists ? info.size ?? 0 : 0 });
    } catch (e) {
      postToWeb("HR_FILE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const fetchBPA7d = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) {
        postToWeb("HC_UNAVAILABLE");
        return;
      }
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      const fileUri = await Health.writeLast7DaysBloodPressureToFile(); // returns "file://..."
      const info = await FileSystem.getInfoAsync(fileUri);
      postToWeb("BP_FILE_READY", { fileUri, size: info.exists ? info.size ?? 0 : 0 });
    } catch (e) {
      postToWeb("BP_FILE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const fetchSPO27d = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) {
        postToWeb("HC_UNAVAILABLE");
        return;
      }
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      const fileUri = await Health.writeLast7DaysOxygenSaturationToFile(); // returns "file://..."
      const info = await FileSystem.getInfoAsync(fileUri);
      postToWeb("SPO2_FILE_READY", { fileUri, size: info.exists ? info.size ?? 0 : 0 });
    } catch (e) {
      postToWeb("SPO2_FILE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const doExtractBaseline = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) return postToWeb("HC_UNAVAILABLE");
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      await Health.extractBaselineAndStoreToken();
      postToWeb("BASELINE_OK", { dirHint: "files/health_data" });
    } catch (e) {
      postToWeb("BASELINE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const doScheduleSync = useCallback(
    async (hours = 1) => {
      try {
        if (!(await Health.isAvailable())) return postToWeb("HC_UNAVAILABLE");
        if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

        await Health.schedulePeriodicHealthSync(hours);
        postToWeb("SCHEDULED_OK", { hours });
      } catch (e) {
        postToWeb("HC_SYNC_ERROR", { error: String(e) });
      }
    },
    [postToWeb]
  );

  const doRunSyncNow = useCallback(async () => {
    try {
      if (!(await Health.isAvailable())) return postToWeb("HC_UNAVAILABLE");
      if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

      await Health.runHealthSyncNow();
      postToWeb("RUN_NOW_OK");
    } catch (e) {
      postToWeb("HC_SYNC_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  // Web -> RN bridge
  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }

    switch (msg.type) {
      case "CHECK_AVAILABLE":
        await doCheckAvailable();
        break;
      case "CHECK_PERMISSIONS":
        await doCheckPerms();
        break;
      case "REQUEST_PERMISSIONS":
        await doRequestPerms();
        break;
      case "WRITE_HR_FILE":
        await doWriteFile();
        break;
      case "WRITE_HR_AGGREGATE_FILE":
        await fetchHrAgg7d();
        break;
      case "WRITE_BP_FILE":
        await fetchBPA7d();
        break;
      case "WRITE_SPO2_FILE":
        await fetchSPO27d();
        break;
      case "EXTRACT_BASELINE":
        await doExtractBaseline();
        break;
      case "SCHEDULE_SYNC":
        await doScheduleSync(msg.hours ?? 1);
        break;
      case "RUN_SYNC_NOW":
        await doRunSyncNow();
        break;
      default:
        // ignore unknown
        break;
    }
  }, [doCheckAvailable, doCheckPerms, doRequestPerms, doWriteFile, fetchHrAgg7d, fetchBPA7d, fetchSPO27d, doExtractBaseline, doScheduleSync, doRunSyncNow]);

  return (
    <SafeAreaView style={styles.container}>
      <WebView ref={webRef} source={{ uri: WEB_URL }} onMessage={onMessage} />
    </SafeAreaView>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>;
}
function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  debug: {
    position: "absolute",
    bottom: 16,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 8,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  btnText: { color: "white", fontSize: 12 },
});
