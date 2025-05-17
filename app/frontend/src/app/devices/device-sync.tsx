"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"

// Sample sync data
const initialSyncData = [
  {
    id: "1",
    deviceName: "Fitbit Charge 5",
    lastSync: "2 hours ago",
    status: "success",
    details: "All data synchronized successfully",
  },
  {
    id: "2",
    deviceName: "Withings Body+",
    lastSync: "1 day ago",
    status: "success",
    details: "Weight and body composition data updated",
  },
  {
    id: "3",
    deviceName: "Polar H10",
    lastSync: "3 days ago",
    status: "warning",
    details: "Partial data sync - some heart rate data missing",
  },
]

export function DeviceSync() {
  const [syncData, setSyncData] = useState(initialSyncData)
  const [isSyncing, setIsSyncing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSync = () => {
    setIsSyncing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSyncing(false)
          setSyncData(
            syncData.map((item) => ({
              ...item,
              lastSync: "Just now",
              status: "success",
            }))
          )
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Device Synchronization</h2>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded bg-[#0D9488] px-4 py-2 text-sm text-white hover:bg-[#0C8178] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync All Devices"}
        </Button>
      </div>

      {isSyncing && (
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm font-medium">
            <span>Syncing in progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
            <div
              className="h-full bg-[#0D9488] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {syncData.map((item) => (
          <div key={item.id} className="flex justify-between border-b pb-4 last:border-none last:pb-0">
            <div>
              <div className="font-medium">{item.deviceName}</div>
              <div className="text-sm text-gray-500">Last sync: {item.lastSync}</div>
              <div className="text-sm">{item.details}</div>
            </div>
            <div className="flex items-center">{getStatusIcon(item.status)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
