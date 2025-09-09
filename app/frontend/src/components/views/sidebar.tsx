"use client"

import type React from "react"
import { useState } from "react"
import { Activity, Calendar, Cog, Heart, Laptop, Newspaper, User, ChevronsRight, ChevronsLeft } from "lucide-react"
import ActiveLink from "./ActiveLink"
import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"

export default function Sidebar() {
  const user = useSupabaseUser();
  const [isCollapsed, setIsCollapsed] = useState(false)
  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <div className={`h-full border-r border-gray-300 bg-white flex flex-col transition-all duration-300 
      ${isCollapsed ? "w-16" : "w-48"}`}>
      <div className="flex items-center justify-center px-2 py-2">
        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900 text-center">
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
      <div className="flex-1">
        <nav className="space-y-1 px-2">
          <SidebarItem href="/" icon={Activity} label="Overview" isCollapsed={isCollapsed} />
          <SidebarItem href="/screenings" icon={Calendar} label="Health Screenings" isCollapsed={isCollapsed} />
          <SidebarItem href="/health-insights" icon={Heart} label="Health Insights" isCollapsed={isCollapsed} />
          <SidebarItem href="/devices" icon={Laptop} label="Connected Devices" isCollapsed={isCollapsed} />
          <SidebarItem href="/news" icon={Newspaper} label="Health News" isCollapsed={isCollapsed} />
          {user && <SidebarItem href="/profile" icon={User} label="Profile" isCollapsed={isCollapsed} />}
          <SidebarItem href="/settings" icon={Cog} label="Settings" isCollapsed={isCollapsed} />
        </nav>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  isCollapsed: boolean
  active?: boolean
}

function SidebarItem({ href, icon: Icon, label, isCollapsed }: SidebarItemProps) {
  const activeClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-teal-50 text-teal-700 border-l-4 border-teal-500 pl-2";
  const inactiveClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <ActiveLink href={href} activeClassName={activeClassName} inactiveClassName={inactiveClassName}>
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span>{label}</span>}
    </ActiveLink>
  );
}