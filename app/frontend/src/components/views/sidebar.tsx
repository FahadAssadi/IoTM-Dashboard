"use client"

import type React from "react"
import { Activity, Calendar, Cog, Heart, Laptop, Newspaper, User } from "lucide-react"
import ActiveLink from "./ActiveLink"
import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"

export default function Sidebar() {
  const user = useSupabaseUser();
  return (
    <div className="w-[180px] border-r border-gray-300 bg-white flex flex-col h-full">
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          <SidebarItem href="/" icon={Activity} label="Overview" />
          <SidebarItem href="/screenings" icon={Calendar} label="Health Screenings" />
          <SidebarItem href="/health-insights" icon={Heart} label="Health Insights" />
          <SidebarItem href="/devices" icon={Laptop} label="Connected Devices" />
          <SidebarItem href="/news" icon={Newspaper} label="Health News" />
          {user && (<SidebarItem href="/profile" icon={User} label="Profile" />)}
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

function SidebarItem({ href, icon: Icon, label }: SidebarItemProps) {
  const activeClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-teal-50 text-teal-700 border-l-4 border-teal-500 pl-2";
  const inactiveClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <ActiveLink href={href} activeClassName={activeClassName} inactiveClassName={inactiveClassName}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </ActiveLink>
  );
}