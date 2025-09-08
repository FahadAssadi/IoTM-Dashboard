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
      case "HC_AVAILABLE":
        if (msg.payload?.ok) alert("Health Connect is available ");
        else alert("Health Connect is not available ");
        break;
      case "HC_HAS_PERMS":
        alert(`Permissions: ${msg.payload?.has ? "granted " : "not granted "}`);
        break;
      case "HC_PERMS_GRANTED":
        alert("Permissions granted ");
        break;
      case "HC_UNAVAILABLE":
        alert("Health Connect is not available on this device ");
        break;
      case "HR_FILE_READY":
        alert(`Saved heart rate JSON \nPath: ${msg.payload?.fileUri}\nSize: ${msg.payload?.size} bytes`);
        break;
      case "BP_FILE_READY":
        alert(`Saved blood pressure JSON \nPath: ${msg.payload?.fileUri}\nSize: ${msg.payload?.size} bytes`);
        break;
      case "SPO2_FILE_READY":
        alert(`Saved SPO2 JSON \nPath: ${msg.payload?.fileUri}\nSize: ${msg.payload?.size} bytes`);
        break;
      case "HC_AVAILABLE_ERROR":
      case "HC_PERMS_ERROR":
      case "HEALTH_DUMP_ERROR":
      case "HR_FILE_ERROR":
        alert(`Error: ${msg.payload?.error ?? "Unknown error"}`);
        break;
      case "BP_FILE_ERROR":
        alert(`BP error: ${msg.payload?.error ?? "Unknown error"}`);
        break;
      case "SPO2_FILE_ERROR":
        alert(`SpO2 error: ${msg.payload?.error ?? "Unknown error"}`);
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
        <Button onClick={() => post("CHECK_AVAILABLE")}>Check Available</Button>
        <Button onClick={() => post("CHECK_PERMISSIONS")}>Has Perms?</Button>
        <Button onClick={() => post("REQUEST_PERMISSIONS")}>Request Perms</Button>
        <Button onClick={() => post("WRITE_HR_FILE")}>Save HR to File</Button>
        <Button onClick={() => post("WRITE_HR_AGGREGATE_FILE")}>Save aggregate HR to File</Button>
        <Button onClick={() => post("WRITE_BP_FILE")}>Save BP to File</Button>
        <Button onClick={() => post("WRITE_SPO2_FILE")}>Save SPO2 to File</Button>
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
