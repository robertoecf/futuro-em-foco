import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from '@/lib/posthog'

interface PostHogProviderProps {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const location = useLocation()

  useEffect(() => {
    const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'
    
    if (!isDevelopment && typeof window !== 'undefined') {
      posthog.capture('$pageview')
    }
  }, [location])

  return <>{children}</>
}
