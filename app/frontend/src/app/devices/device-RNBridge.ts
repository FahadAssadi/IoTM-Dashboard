import { useCallback, useEffect } from "react";

type RNInMsg =
  | { type: "HC_AVAILABLE"; payload: { ok: boolean } }
  | { type: "HC_AVAILABLE_ERROR"; payload?: { error?: string } }
  | { type: "HC_HAS_PERMS"; payload: { has: boolean } }
  | { type: "HC_PERMS_GRANTED" }
  | { type: "HC_PERMS_ERROR"; payload?: { error?: string } }
  | { type: "HC_UNAVAILABLE" }
  | { type: "HR_7D_READY"; payload?: any }
  | { type: "HEALTH_DUMP_ERROR"; payload?: { error?: string } }
  | { type: "HR_FILE_READY"; payload: { fileUri: string; size: number } }
  | { type: "HR_FILE_ERROR"; payload?: { error?: string } }
  | { type: string; payload?: any };

export function useRNBridge(onMessage?: (msg: RNInMsg) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let msg: RNInMsg | null = null;
      try { msg = JSON.parse(event.data); } catch { return; }
      onMessage?.(msg);
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
