import React, { useCallback, useRef } from "react";
import { Alert, SafeAreaView, StyleSheet, View, Pressable, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Health } from "../lib/health"; 

const WEB_URL = "http://192.168.1.112:3000"; 

export default function Screen() {
  const webRef = useRef<WebView>(null);

  const postToWeb = useCallback((type: string, payload?: any) => {
    webRef.current?.postMessage(JSON.stringify({ type, payload }));
  }, []);

  // ---- Buttons (call native) ----
  const onCheckAvailable = useCallback(async () => {
    try {
      const ok = await Health.isAvailable();
      Alert.alert("Health Connect available?", String(ok));
      postToWeb("HC_AVAILABLE", { ok });
    } catch (e) {
      Alert.alert("HC available error", String(e));
      postToWeb("HC_AVAILABLE_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const onHasPerms = useCallback(async () => {
    try {
      const has = await Health.hasRequiredPermissions();
      Alert.alert("Has required permissions?", String(has));
      postToWeb("HC_HAS_PERMS", { has });
    } catch (e) {
      Alert.alert("Has perms error", String(e));
      postToWeb("HC_HAS_PERMS_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const onRequestPerms = useCallback(async () => {
    try {
      await Health.requestPermissions(); // Step 0/1 stubs will reject; that's expected
      Alert.alert("Permissions", "Granted");
      postToWeb("HC_PERMS_GRANTED");
    } catch (e) {
      Alert.alert("Permissions error", String(e));
      postToWeb("HC_PERMS_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  const onDump = useCallback(async () => {
    try {
      const json = await Health.dumpLast7DaysJson(); // Step 0/1 returns stub JSON
      let payload: any;
      try { payload = JSON.parse(json); } catch { payload = json; }
      Alert.alert("Dump", typeof payload === "string" ? payload : "JSON received");
      postToWeb("HEALTH_DUMP_READY", payload);
    } catch (e) {
      Alert.alert("Dump error", String(e));
      postToWeb("HEALTH_DUMP_ERROR", { error: String(e) });
    }
  }, [postToWeb]);

  // ---- Handle web → RN requests (optional) ----
  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg?.type === "REQUEST_HEALTH_DUMP") {
        await onDump();
      }
    } catch {}
  }, [onDump]);

  return (
    <SafeAreaView style={styles.container}>
      <WebView ref={webRef} source={{ uri: WEB_URL }} onMessage={onMessage} />
      <View style={styles.debug}>
        <Row>
          <Btn label="isAvailable" onPress={onCheckAvailable} />
          <Btn label="hasPerms" onPress={onHasPerms} />
          <Btn label="requestPerms" onPress={onRequestPerms} />
          <Btn label="dump7d" onPress={onDump} />
        </Row>
      </View>
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
