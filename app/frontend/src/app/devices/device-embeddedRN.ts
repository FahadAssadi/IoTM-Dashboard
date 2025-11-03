/**
 * @file Provides the `useIsEmbeddedRN` React hook — a utility for detecting
 * whether the current web app instance is running inside a React Native
 * WebView (such as in the mobile companion app) or in a standard browser.
 *
 * @remarks
 * This hook is part of the hybrid web–mobile integration strategy used in the
 * project, enabling a single Next.js web app to also function when embedded
 * within an Android or iOS React Native shell. The native layer (Kotlin/Swift)
 * injects the `ReactNativeWebView` object, which this hook detects.
 *
 * @example
 * ```tsx
 * import { useIsEmbeddedRN } from "@/hooks/device-embeddedRN";
 *
 * export default function Example() {
 *   const isEmbedded = useIsEmbeddedRN();
 *   return (
 *     <p>
 *       {isEmbedded
 *         ? "Running inside the React Native WebView"
 *         : "Running in a standard browser"}
 *     </p>
 *   );
 * }
 * ```
 *
 * @returns {boolean} `true` if the app is running inside a React Native WebView,
 * otherwise `false`.
 */

export function useIsEmbeddedRN(): boolean {
  // Returns false on the server (SSR context)
  if (typeof window === "undefined") return false;
  // Parse URL query parameters (e.g., ?embedded=rn)
  const params = new URLSearchParams(window.location.search);
  const byQuery = params.get("embedded") === "rn";
  // Detect presence of the injected React Native WebView bridge object
  const byBridge = Boolean((window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView);
  // Return true if either the query parameter or WebView object is present
  return byQuery || byBridge;
}