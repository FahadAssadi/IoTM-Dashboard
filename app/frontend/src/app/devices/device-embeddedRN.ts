export function useIsEmbeddedRN() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const byQuery = params.get("embedded") === "rn";
  const byBridge = !!(window as any).ReactNativeWebView;
  return byQuery || byBridge;
}
