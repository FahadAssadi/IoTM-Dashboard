import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5225/api'

interface OnboardingStatus {
  isOnboarded: boolean
  loading: boolean
  error: string | null
}

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>({
    isOnboarded: false,
    loading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error('Auth error:', authError)
          setStatus({ isOnboarded: false, loading: false, error: 'Not authenticated' })
          router.push('/login')
          return
        }

        // Check onboarding status from backend
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/onboarding-status`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        
        setStatus({
          isOnboarded: data.isOnboarded,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setStatus({
          isOnboarded: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    checkOnboardingStatus()
  }, [router])

  return status
}