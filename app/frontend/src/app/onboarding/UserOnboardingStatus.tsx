/**
 * @file Provides the 'useOnboardingStatus' custom hook - checks whether the
 * current authenticated user has completed the onboarding process
 * 
 * @remarks
 * This hook handles:
 * - Fetching the current user from Supabase authentication
 * - Checking onboarding completion status from backend API
 * - Managing loading states during async operations
 * - Error handling for authentication and API failures
 * - Automatic redirect to login page if user is not authenticated
 * - Returning onboarding status, loading state, and error information
 *
 * The hook makes an API call to GET /users/{id}/onboarding-status
 * which returns an object indicating whether the user has completed
 * the onboarding process (isOnboarded: boolean).
 *
 * Used by protected route components and layout wrappers to determine
 * whether to show the onboarding flow or allow access to the main application.
 * Typically used in conjunction with route guards to enforce onboarding
 * completion before accessing certain features.
 * 
 * @returns {OnboardingStatus} Object containing:
 * - isOnboarded: boolean indicating completion status
 * - loading: boolean indicating if check is in progress
 * - error: string | null with any error messages
 */

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