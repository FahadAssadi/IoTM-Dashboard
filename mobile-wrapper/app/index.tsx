import React, { useCallback, useRef } from "react";
import { Alert, SafeAreaView, StyleSheet, View, Pressable, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Health } from "../lib/health";

const WEB_URL = "http://192.168.1.106:3000"; 

export default function Screen() {
  const webRef = useRef<WebView>(null);

  const postToWeb = useCallback((type: string, payload?: any) => {
    webRef.current?.postMessage(JSON.stringify({ type, ...(payload ? { payload } : {}) }));
  }, []);

  // Native actions exposed to the web
  const doExtractBaseline = useCallback(async (userId: string, token: string) => {
    try {
        if (!(await Health.isAvailable())) return postToWeb("HC_UNAVAILABLE");
        if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

        await Health.extractBaselineAndStoreToken(userId, token);
        postToWeb("BASELINE_OK", { dirHint: "files/health_data" });
      } catch (e) {
        postToWeb("BASELINE_ERROR", { error: String(e) });
      }
    },
    [postToWeb]
  );


  const doRunSyncNow = useCallback(async (userId: string, token: string) => {
    try {
        if (!(await Health.isAvailable())) return postToWeb("HC_UNAVAILABLE");
        if (!(await Health.hasRequiredPermissions())) await Health.requestPermissions();

        await Health.runHealthSyncNow(userId, token);
        postToWeb("RUN_NOW_OK");
      } catch (e) {
        postToWeb("HC_SYNC_ERROR", { error: String(e) });
      }
    },
    [postToWeb]
  );

  // Web -> RN bridge
  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }

    switch (msg.type) {
      case "EXTRACT_BASELINE":
        {
          const { userId, token } = msg.payload ?? {};
          if (!userId || !token) {
            postToWeb("BASELINE_ERROR", { error: "Missing userId or token" });
            return;
          }
          await doExtractBaseline(userId, token);
          break;
        }
      case "RUN_SYNC_NOW":
         {
          const { userId, token } = msg.payload ?? {};
          if (!userId || !token) {
            postToWeb("HC_SYNC_ERROR", { error: "Missing userId or token" });
            return;
          }
          await doRunSyncNow(userId, token);
          break;
        }
      default:
        // ignore unknown
        break;
    }
  }, [doExtractBaseline, doRunSyncNow]);

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
