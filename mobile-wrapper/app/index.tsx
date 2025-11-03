/**
 * @file index.tsx
 * @brief Entry point for the Android wrapper application.
 *
 * @description
 * This screen embeds the hosted web application inside a React Native WebView
 * and enables **two-way communication** between:
 *
 * - The **web frontend** (Next.js app) and
 * - The **native Android layer** (Health Connect Kotlin modules)
 *
 * The React Native bridge listens for JSON messages from the web app
 * (e.g., `EXTRACT_BASELINE`, `RUN_SYNC_NOW`) and executes corresponding native
 * actions through the `Health` module.
 *
 * Native responses (e.g., `BASELINE_OK`, `HC_SYNC_ERROR`) are sent back to the
 * web layer via `window.ReactNativeWebView.postMessage`.
 *
 * @remarks
 * - The WebView points to a **deployed web app** hosted on Vercel.
 * - Each health-related operation requires permissions via Health Connect.
 * - This layer keeps the native logic thin and delegates UI to the web layer.
 *
 * @see ../lib/health
 * @see com.anonymous.mobilewrapper.health.HealthConnectModule
 */

import React, { useCallback, useRef } from "react";
import { Alert, SafeAreaView, StyleSheet, View, Pressable, Text } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Health } from "../lib/health";

const WEB_URL = "https://previe-ten.vercel.app/"; 

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
