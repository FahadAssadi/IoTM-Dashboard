import { Watch, Scale, Heart } from "lucide-react"

export type Device = {
  id: string
  name: string
  type: string
  icon: React.ComponentType<{ className?: string }>
  lastSync: string
  battery: number
  status: "active" | "inactive"
  connected: boolean
}

export const devices: Device[] = [
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