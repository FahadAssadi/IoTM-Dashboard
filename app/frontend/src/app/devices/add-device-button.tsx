"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AddDeviceButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#0D9488] text-white hover:bg-[#0C8178]"
      >
        <PlusCircle className="h-4 w-4" />
        Add Device
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Add New Device</h2>
            <p className="text-sm text-gray-500 mb-4">
              Connect a new fitness or health monitoring device to your dashboard.
            </p>
            <form className="grid gap-4">
              <div className="grid gap-1">
                <label htmlFor="device-type" className="text-sm font-medium">
                  Device Type
                </label>
                <select
                  id="device-type"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select device type</option>
                  <option value="smartwatch">Smartwatch / Fitness Tracker</option>
                  <option value="scale">Smart Scale</option>
                  <option value="heart-monitor">Heart Rate Monitor</option>
                  <option value="blood-pressure">Blood Pressure Monitor</option>
                  <option value="glucose">Glucose Monitor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="device-name" className="text-sm font-medium">
                  Device Name
                </label>
                <input
                  id="device-name"
                  type="text"
                  placeholder="Enter device name"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="device-brand" className="text-sm font-medium">
                  Brand
                </label>
                <select
                  id="device-brand"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select brand</option>
                  <option value="fitbit">Fitbit</option>
                  <option value="garmin">Garmin</option>
                  <option value="apple">Apple</option>
                  <option value="samsung">Samsung</option>
                  <option value="withings">Withings</option>
                  <option value="polar">Polar</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="connection-method" className="text-sm font-medium">
                  Connection Method
                </label>
                <select
                  id="connection-method"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select method</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="wifi">Wi-Fi</option>
                  <option value="usb">USB</option>
                  <option value="api">API Integration</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="bg-[#0D9488] text-white hover:bg-[#0C8178]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={() => setOpen(false)}
                  className="bg-[#0D9488] text-white hover:bg-[#0C8178]"
                >
                  Add Device
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
