import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export function useSupabaseUser() {
  const [user, setUser] = useState<User|null>(null)
    // This block is for ensuring that we can 
    useEffect(() => {
      const getUser = async () => {
        // sets user variable value from the supabase client cookie
        const { data } = await supabase.auth.getUser()
          if (data?.user){
            setUser(data.user)
          }
      }
      // Calls the function once on object mount
      getUser()
      // Listener for Auth State Change - updates the user whenever login, logout, or token refresh happens
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
        }
      )
      return () => {
        authListener.subscription.unsubscribe()
      }
    }, [])

  return user;
}