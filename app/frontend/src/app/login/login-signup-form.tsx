"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "./login-form"
import SignUpForm from "./signup-form"
import { useState } from "react"
import supabase from "./auth-functions"

type LoginSignUpFormProps = {
    tabProp: string;
};

console.log(supabase);

export default function LoginSignUpForm({ tabProp }: LoginSignUpFormProps) {

  const [tab, setTab] = useState(tabProp);

  return (
    <div className="mx-auto w-full max-w-md">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-300">
          <TabsTrigger value="login" className="data-[state=active]:bg-white">Login</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-white">Sign Up</TabsTrigger>
        </TabsList>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <TabsContent value="login">
              <LoginForm setTab={setTab}/>
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm setTab={setTab}/>
            </TabsContent>
          </div>
      </Tabs>
    </div>
  )
}
