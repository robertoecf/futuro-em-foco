
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from '@/lib/posthog'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const location = useLocation()

  useEffect(() => {
    // Track page views manually
    posthog.capture('$pageview')
  }, [location])

  return <>{children}</>
}
