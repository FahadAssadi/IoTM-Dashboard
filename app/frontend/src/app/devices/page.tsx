import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeviceList } from "./device-list"
import { DeviceSync } from "./device-sync"
import { AddDeviceButton } from "./add-device-button"

export default function DevicesPage() {
  return (
    <div className="w-full flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="space-y-4 p-8 pt-6 bg-slate-50">
        {/* Dashboard Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Connected Devices</h1>
            <p className="text-muted-foreground">
              Manage your fitness trackers and health monitoring devices.
            </p>
          </div>
          <AddDeviceButton />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mt-6 w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
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
          <h2 className="text-xl font-semibold tracking-tight px-2 pt-2">Sync Status</h2>
          <DeviceSync />
        </div>
      </main>
    </div>
  )
}
