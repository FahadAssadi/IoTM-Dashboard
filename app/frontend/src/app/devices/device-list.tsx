"use client"

import { useState } from "react"
import { Watch, Scale, Heart, MoreVertical, Trash2, Edit, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

// Sample device data
const devices = [
  {
    id: "1",
    name: "Fitbit Charge 5",
    type: "smartwatch",
    icon: Watch,
    lastSync: "2 hours ago",
    battery: 72,
    status: "active",
    connected: true,
  },
  {
    id: "2",
    name: "Withings Body+",
    type: "scale",
    icon: Scale,
    lastSync: "1 day ago",
    battery: 85,
    status: "active",
    connected: true,
  },
  {
    id: "3",
    name: "Polar H10",
    type: "heart-monitor",
    icon: Heart,
    lastSync: "3 days ago",
    battery: 45,
    status: "active",
    connected: true,
  },
  {
    id: "4",
    name: "Old Fitness Band",
    type: "smartwatch",
    icon: Watch,
    lastSync: "2 months ago",
    battery: 0,
    status: "inactive",
    connected: false,
  },
]

interface DeviceListProps {
  filterStatus?: "active" | "inactive"
}

export function DeviceList({ filterStatus }: DeviceListProps) {
  const [deviceList, setDeviceList] = useState(devices)

  const filteredDevices = filterStatus
    ? deviceList.filter((device) => device.status === filterStatus)
    : deviceList

  const toggleDeviceStatus = (id: string) => {
    setDeviceList((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === "active" ? "inactive" : "active",
              connected: d.status !== "active",
            }
          : d
      )
    )
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return "text-green-600"
    if (battery > 20) return "text-yellow-500"
    return "text-red-500"
  }

  if (filteredDevices.length === 0) {
    return (
      <div className="p-8 text-center border rounded bg-gray-50 text-gray-500">
        No devices found.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredDevices.map((device) => {
        const Icon = device.icon
        return (
          <div
            key={device.id}
            className="border rounded-lg shadow-sm bg-white p-4 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-8 w-8 text-black-600" />
                <div>
                  <h3 className="text-lg font-semibold">{device.name}</h3>
                  <p className="text-sm text-gray-500">Last synced: {device.lastSync}</p>
                </div>
              </div>
              <button
                className="p-1 rounded hover:bg-gray-100"
                title="Actions (Not functional in simplified version)"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`flex items-center gap-1 ${
                    device.connected ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {device.connected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Disconnected
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Battery</span>
                <span
                  className={`font-medium ${device.battery > 0 ? getBatteryColor(device.battery) : "text-gray-400"}`}
                >
                  {device.battery > 0 ? `${device.battery}%` : "N/A"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-3 flex justify-between items-center">
              <label
                htmlFor={`toggle-${device.id}`}
                className="text-sm cursor-pointer"
              >
                {device.status === "active" ? "Enabled" : "Disabled"}
              </label>
              <input
                id={`toggle-${device.id}`}
                type="checkbox"
                checked={device.status === "active"}
                onChange={() => toggleDeviceStatus(device.id)}
                className="w-5 h-5 cursor-pointer accent-[#0D9488]"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
