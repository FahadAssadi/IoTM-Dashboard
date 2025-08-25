"use client"

import { Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function Header() {
  const user = useSupabaseUser()
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    toast.success("User logged out Succesfully")
    router.push("/login") // Go back to the login page
  }

  return (
    <header className="w-full border-b border-gray-300 bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded border border-slate-900 flex items-center justify-center">
          <Heart className="h-4 w-4 text-slate-900" />
        </div>
        <span className="font-semibold text-slate-900 text-lg">HealthTrack</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gray-100"></div>
        {user ? (
          <>
            <span className="text-sm text-gray-700">
              {user.user_metadata.full_name ?? user.email}
            </span>
            <Button onClick={logout}>Logout</Button>
          </>
        ) : (
          <HeaderItem href="/login" label="Login"></HeaderItem>
        )}
      </div>
    </header>
  )
}

interface HeaderItemProps {
  href: string
  label: string
  active?: boolean
}

function HeaderItem({ href, label }: HeaderItemProps) {
  //const activeClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-teal-50 text-teal-700 border-l-4 border-teal-500 pl-2";
  const inactiveClassName = "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <Link href={href} className={inactiveClassName}>
      <span>{label}</span>
    </Link>
  );
}
