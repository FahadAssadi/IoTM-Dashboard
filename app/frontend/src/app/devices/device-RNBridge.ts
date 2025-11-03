/**
 * @file Provides the `useRNBridge` React hook — a communication bridge between
 * the web layer (Next.js/React app) and the native Android/iOS layer hosting it
 * inside a React Native WebView.
 *
 * @remarks
 * This hook allows the embedded web app to exchange messages with the native
 * React Native wrapper through `window.ReactNativeWebView.postMessage` and
 * event listeners for incoming messages. It is a key part of the hybrid
 * web-mobile integration design, enabling features such as:
 * - Health Connect synchronization
 * - Real-time updates and error messages from the native module
 * - Triggering native actions (e.g., `RUN_SYNC_NOW`)
 *
 */

import { useCallback, useEffect } from "react";

// Describes the structure of a synchronization snapshot message from native
export type RNSyncSnapshot = {
  lastSync?: number; // epoch ms
  origins?: {
    [originPkg: string]: {
      hr?: number;
      bp?: number;
      spo2?: number;
      lastSeen?: string; // ISO
    };
  };
};

// Message types exchanged between WebView and native.
type RNInMsg =
  | { type: "HC_UNAVAILABLE" }
  | { type: "BASELINE_OK" }
  | { type: "RUN_NOW_OK" }
  | { type: "BASELINE_ERROR"; payload?: { error?: string } }
  | { type: "HC_SYNC_ERROR"; payload?: { error?: string } }
  | { type: "SYNC_SNAPSHOT"; payload: RNSyncSnapshot }
  | { type: string; payload?: Record<string, unknown> }; 

// Extend the Window interface to include the React Native WebView bridge
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

// React hook to establish a two-way message bridge between the web app and the React Native WebView container.
export function useRNBridge(onMessage?: (msg: RNInMsg) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let msg: RNInMsg | null = null;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg !== null) {
        onMessage?.(msg);
      }
    };

    // Listen to both window and document events for WebView compatibility
    window.addEventListener("message", handler as EventListener);
    document.addEventListener("message", handler as EventListener);

    return () => {
      window.removeEventListener("message", handler as EventListener);
      document.removeEventListener("message", handler as EventListener);
    };
  }, [onMessage]);

  // Sends a message to the native React Native WebView layer.
  const post = useCallback((type: string, payload?: unknown) => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type, ...(payload ? { payload } : {}) })
    );
  }, []);

  return { post };
}

