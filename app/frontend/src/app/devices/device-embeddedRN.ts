export function useIsEmbeddedRN(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const byQuery = params.get("embedded") === "rn";
  const byBridge = Boolean((window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView);
  return byQuery || byBridge;
}