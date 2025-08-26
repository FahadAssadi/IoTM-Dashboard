"use client"

import dynamic from "next/dynamic"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { useSupabaseUser } from "@/lib/supabase/useSupabaseUser"
// import { redirect } from "next/navigation"
// import { toast } from "react-toastify"

const ProfilePersonalInformation = dynamic(() => import("./profile-personal-information"))
const ProfileSecurity = dynamic(() => import("./profile-security"))
const ProfilePreferences = dynamic(() => import("./profile-preferences"))

export default function ProfilePage() {

    // Protect the page from being accessed when no user is logged in
    // const user = useSupabaseUser()
    // if (!user) {
    //     // The notification doesn't work yet...
    //     toast.error("Unathourised Navigation: Please login to access profile page")
    //     redirect("/login")
    // }

    return (
        <main className="min-h-screen flex-1 overflow-auto bg-slate-50">
            <div className="p-6 bg-slate-50">
                <h1 className="text-2xl font-semibold mb-2">Account Management</h1>
                <p className="text-muted-foreground mb-8">Update your personal details</p>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                        <TabsTrigger value="personal" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="data-[state=active]:bg-teal-700 data-[state=active]:text-white">
                            Preferences
                        </TabsTrigger>
                    </TabsList>

                    <ProfilePersonalInformation />
                    <ProfileSecurity />
                    <ProfilePreferences />
                </Tabs>
            </div>
        </main>
    )
}
