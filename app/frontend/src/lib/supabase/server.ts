import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}


// Use the Supabase client in server components or API routes like so:

// import { createServerSupabaseClient } from '@/lib/supabase/server'

// export default async function Page() {
//   const supabase = createServerSupabaseClient()
//   const {
//     data: { user }
//   } = await supabase.auth.getUser()

//   return <div>Welcome {user?.email}</div>
// }
