"use client";

import React, { useMemo, useState } from "react";
import { useIsEmbeddedRN } from "./device-embeddedRN";
import { useRNBridge, RNSyncSnapshot } from "./device-RNBridge";
import { supabase } from "@/lib/supabase/client";

function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={
        "rounded-xl border bg-background p-5 " + (props.className ?? "")
      }
    />
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {desc ? <p className="text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center rounded-md border px-3 py-2 " +
        "text-sm font-semibold shadow-sm " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        "bg-teal-600 text-white border-teal-700 hover:bg-teal-700 " +
        (className ?? "")
      }
    />
  );
}

const ORIGIN_FRIENDLY: Record<string, string> = {
  "com.google.android.apps.fitness": "Google Fit",
  "com.samsung.android.app.health": "Samsung Health",
};

function formatOrigin(pkg: string) {
  return ORIGIN_FRIENDLY[pkg] ?? pkg;
}
function formatWhen(ms?: number) {
  if (!ms) return "—";
  const dt = new Date(ms);
  return dt.toLocaleString();
}
function formatIso(iso?: string) {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleString();
}

export default function DevicesPage() {
  const isEmbedded = useIsEmbeddedRN();
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [lastSyncMs, setLastSyncMs] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<RNSyncSnapshot | null>(null);

  const { post } = useRNBridge((msg) => {
    switch (msg.type) {
      case "HC_UNAVAILABLE":
        alert("Health Connect is not available on this device");
        setLinking(false);
        setSyncing(false);
        break;
      case "BASELINE_OK":
        setLinking(false);
        alert("Health Connect linked");
        break;
      case "RUN_NOW_OK":
        setSyncing(false);
        setLastSyncMs(Date.now());
        alert("Health Connect data synced successfully");
        break;
      case "SYNC_SNAPSHOT":
        setSyncing(false);
        setSnapshot(msg.payload ?? null);
        setLastSyncMs(msg.payload?.lastSync ?? Date.now());
        break;
      case "BASELINE_ERROR":
      case "HC_SYNC_ERROR":
        alert(`Error: ${msg.payload?.error ?? "Unknown error"}`);
        setLinking(false);
        setSyncing(false);
        break;
      default:
        break;
    }
  });

  const originRows = useMemo(() => {
    const origins = snapshot?.origins ?? {};
    const keys = Object.keys(origins);
    if (keys.length === 0) return null;
    return keys.sort().map((pkg) => {
      const o = origins[pkg]!;
      return (
        <tr key={pkg} className="border-t">
          <td className="py-2 pr-3 align-top">
            <div className="font-medium">{formatOrigin(pkg)}</div>
            <div className="text-xs text-muted-foreground">{pkg}</div>
          </td>
          <td className="py-2 px-3 text-center">{o.hr ?? 0}</td>
          <td className="py-2 px-3 text-center">{o.bp ?? 0}</td>
          <td className="py-2 px-3 text-center">{o.spo2 ?? 0}</td>
          <td className="py-2 px-3">{formatIso(o.lastSeen)}</td>
        </tr>
      );
    });
  }, [snapshot]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-8 pt-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Connected Devices</h1>
          <p className="text-muted-foreground">
            Link your data via Health Connect and keep it in sync in the background.
          </p>
        </div>

        {/* Section 1: Connected Devices */}
        <Card>
          <SectionHeader
            title="Connected via Health Connect"
            desc="Connect Health Connect to allow this app to read Heart Rate, Blood Pressure and SpO₂. You can disconnect at any time from system settings."
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              When linked, we’ll request a baseline (last 30 days) and store a changes token
              for low-rate incremental syncs.
            </div>
            {isEmbedded ? (
              <Button
                onClick={async () => {
                  try {
                    setLinking(true);
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();

                    if (!user || !session?.access_token) {
                      alert("Missing user session. Please re-login.");
                      setLinking(false);
                      return;
                    }
                    post("EXTRACT_BASELINE", { userId: user.id, token: session.access_token});
                  } catch (err) {
                    console.error("Error linking:", err);
                    alert("Failed to link Health Connect");
                  } finally {
                    setLinking(false);
                  }
                }}
                disabled={linking}
              >
                {linking ? "Linking…" : "Link Health Connect"}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Open in the Android app to link via Health Connect.
              </span>
            )}
          </div>
        </Card>

        {/* Section 2: Sync Status */}
        <Card>
          <SectionHeader
            title="Sync Status"
            desc="See the latest sync across each origin provider (e.g., Samsung Health, Google Fit)."
          />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Last sync:</span>{" "}
              <span className="font-medium">{formatWhen(snapshot?.lastSync ?? lastSyncMs ?? undefined)}</span>
            </div>
            {isEmbedded ? (
              <Button
                onClick={async () => {
                  try {
                    setSyncing(true);

                    // Get the current Supabase user and session
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();

                    if (!user || !session?.access_token) {
                      alert("Missing user session. Please re-login.");
                      setSyncing(false);
                      return;
                    }

                    // Let RN WebView know sync started
                    post("RUN_SYNC_NOW", { userId: user.id, token: session.access_token});

                  } catch (err) {
                    console.error("Error running sync:", err);
                    alert("Failed to start sync");
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing}
              >
                {syncing ? "Syncing…" : "Sync Data"}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                Open in the Android app to trigger a manual sync.
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 pr-3">Origin</th>
                  <th className="pb-2 px-3 text-center">HR</th>
                  <th className="pb-2 px-3 text-center">BP</th>
                  <th className="pb-2 px-3 text-center">SpO₂</th>
                  <th className="pb-2 px-3">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {originRows ?? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No origin breakdown yet. Run a sync to populate this table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
