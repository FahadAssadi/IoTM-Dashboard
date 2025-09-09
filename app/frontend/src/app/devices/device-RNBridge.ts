import { useCallback, useEffect } from "react";

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

type RNInMsg =
  | { type: "HC_UNAVAILABLE" }
  | { type: "BASELINE_OK" }
  | { type: "RUN_NOW_OK" }
  | { type: "BASELINE_ERROR"; payload?: { error?: string } }
  | { type: "HC_SYNC_ERROR"; payload?: { error?: string } }
  | { type: "SYNC_SNAPSHOT"; payload: RNSyncSnapshot }
  | { type: string; payload?: any }; // future-proof

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

    window.addEventListener("message", handler as EventListener);
    document.addEventListener("message", handler as EventListener);

    return () => {
      window.removeEventListener("message", handler as EventListener);
      document.removeEventListener("message", handler as EventListener);
    };
  }, [onMessage]);

  const post = useCallback((type: string, payload?: any) => {
    (window as any).ReactNativeWebView?.postMessage(
      JSON.stringify({ type, ...(payload ? { payload } : {}) })
    );
  }, []);

  return { post };
}

