import type React from "react"
import Link from "next/link"
import { Activity, Calendar, Cog, Heart, Laptop, Newspaper, User } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="w-[180px] border-r border-primary border-gray-300 bg-white flex flex-col h-full">
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          <SidebarItem href="/" icon={Activity} label="Overview" />
          <SidebarItem href="/screenings" icon={Calendar} label="Health Screenings" active />
          <SidebarItem href="/vitals" icon={Heart} label="Vitals" />
          <SidebarItem href="/devices" icon={Laptop} label="Connected Devices" />
          <SidebarItem href="/news" icon={Newspaper} label="Health News" />
          <SidebarItem href="/profile" icon={User} label="Profile" />
          <SidebarItem href="/settings" icon={Cog} label="Settings" />
        </nav>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
}

function SidebarItem({ href, icon: Icon, label, active }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}
