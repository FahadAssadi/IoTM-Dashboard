"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Activity, Calendar, Cog, Heart, Laptop, Newspaper, User, ChevronsRight, ChevronsLeft, Menu, X } from "lucide-react"
import ActiveLink from "./ActiveLink"
import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"

export default function Sidebar() {
  const user = useSupabaseUser();
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => setIsCollapsed((v) => !v)
  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)

  // Close the mobile drawer on route change (best-effort: watch hash/location)
  useEffect(() => {
    const handler = () => setMobileOpen(false)
    window.addEventListener("hashchange", handler)
    return () => window.removeEventListener("hashchange", handler)
  }, [])

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex h-full border-r border-gray-300 bg-white flex-col transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-48"
        }`}
      >
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

      {/* Mobile trigger button (top-left) */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm text-slate-700"
        aria-label="Open menu"
        onClick={openMobile}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} aria-hidden="true" />
          {/* Panel */}
          <div className="absolute left-0 top-0 h-full w-[80vw] max-w-xs bg-white shadow-xl border-r border-slate-200 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-semibold text-slate-900">Menu</span>
              <button className="p-2" onClick={closeMobile} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-2 space-y-1">
              <SidebarItem href="/" icon={Activity} label="Overview" isCollapsed={false} />
              <SidebarItem href="/screenings" icon={Calendar} label="Health Screenings" isCollapsed={false} />
              <SidebarItem href="/health-insights" icon={Heart} label="Health Insights" isCollapsed={false} />
              <SidebarItem href="/devices" icon={Laptop} label="Connected Devices" isCollapsed={false} />
              <SidebarItem href="/news" icon={Newspaper} label="Health News" isCollapsed={false} />
              {user && <SidebarItem href="/profile" icon={User} label="Profile" isCollapsed={false} />}
              <SidebarItem href="/settings" icon={Cog} label="Settings" isCollapsed={false} />
            </nav>
          </div>
        </div>
      )}
    </>
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