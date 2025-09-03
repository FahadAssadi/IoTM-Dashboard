import React, { useCallback, useRef } from "react";
import { Alert, SafeAreaView, StyleSheet, View, Pressable, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import { Health } from "../lib/health";

const WEB_URL = "http://192.168.1.112:3000/?embedded=rn"; 

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

  const doFetchHeartRate7Days = useCallback(async () => {
    try {
      const available = await Health.isAvailable();
      if (!available) {
        postToWeb("HC_UNAVAILABLE");
        return;
      }
      const has = await Health.hasRequiredPermissions();
      if (!has) await Health.requestPermissions();

      const json = await Health.getLast7DaysHeartRateJson();
      let payload: any;
      try { payload = JSON.parse(json); } catch { payload = json; }
      postToWeb("HR_7D_READY", { records: payload?.records ?? payload });
    } catch (e) {
      postToWeb("HEALTH_DUMP_ERROR", { error: String(e) });
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
      case "REQUEST_HR_7D":
        await doFetchHeartRate7Days();
        break;
      case "WRITE_HR_FILE":
        await doWriteFile();
        break;
      default:
        // ignore unknown
        break;
    }
  }, [doCheckAvailable, doCheckPerms, doRequestPerms, doFetchHeartRate7Days, doWriteFile]);

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
