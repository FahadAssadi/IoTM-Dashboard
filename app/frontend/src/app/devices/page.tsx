"use client";

import React, { useMemo } from "react";
import { useIsEmbeddedRN } from "./device-embeddedRN";
import { useRNBridge } from "./device-RNBridge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceList } from "./device-list";
import { DeviceSync } from "./device-sync";
import { AddDeviceButton } from "./add-device-button";

function EmbeddedToolbar() {
  const isEmbedded = useIsEmbeddedRN();
  const { post } = useRNBridge((msg) => {
    switch (msg.type) {
      case "HC_UNAVAILABLE":
        alert("Health Connect is not available on this device ");
        break;
      case "BASELINE_OK":
        alert("Health Connect linked");
        break;
      case "RUN_NOW_OK":
        alert("Health Connect data synced successfully");
        break;
      case "HC_AVAILABLE_ERROR":
      case "HC_PERMS_ERROR":
      case "HEALTH_DUMP_ERROR":
      case "BASELINE_ERROR":
      case "HC_SYNC_ERROR":
        alert(`Error: ${msg.payload?.error ?? "Unknown error"}`);
        break;
      default:
        break;
    }
  });

  if (!isEmbedded) return null;

  const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#0D9488",
        color: "white",
        fontWeight: 600,
      }}
    />
  );

  return (
    <div className="mb-4 rounded-xl border p-3">
      <div className="mb-2 text-sm font-semibold text-muted-foreground">
        Android actions
      </div>
      <div className="flex flex-wrap gap-8">
        <Button onClick={() => post("EXTRACT_BASELINE")}>Link Health Connect</Button>
        <Button onClick={() => post("RUN_SYNC_NOW")}>Sync Data</Button>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Connected Devices</h1>
            <p className="text-muted-foreground">
              Manage your fitness trackers and health monitoring devices.
            </p>
          </div>
          <AddDeviceButton />
        </div>

        <EmbeddedToolbar />

        {/* Tabs */}
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="bg-background border">
            <TabsTrigger value="all">All Devices</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-6">
              <DeviceList />
            </div>
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <div className="grid gap-6">
              <DeviceList filterStatus="active" />
            </div>
          </TabsContent>
          <TabsContent value="inactive" className="mt-4">
            <div className="grid gap-6">
              <DeviceList filterStatus="inactive" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Sync Section */}
        <div className="grid gap-6">
          <h2 className="text-xl font-semibold tracking-tight">Sync Status</h2>
          <DeviceSync />
        </div>
      </main>

    </div>
  );
}
