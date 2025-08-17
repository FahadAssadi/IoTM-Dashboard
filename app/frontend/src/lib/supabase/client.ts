import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createPagesBrowserClient()

// In a client side component use the following 


// 'use client'

// import { supabase } from '@/lib/supabase/client'
// import { useRouter } from 'next/navigation'

// export default function LoginForm() {
//   const router = useRouter()

//   const handleLogin = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password })

//     if (error) {
//       console.error('Login failed:', error.message)
//     } else {
//       router.refresh() // Refresh to update server-side session
//     }
//   }

//   return (
//     <button onClick={() => handleLogin('user@example.com', 'password')}>
//       Login
//     </button>
//   )
// }
