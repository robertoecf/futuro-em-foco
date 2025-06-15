
import posthog from '@/lib/posthog' // useEffect and useLocation removed

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  // const location = useLocation() // Removed
  // useEffect(() => { // Removed
  //   // Track page views manually
  //   posthog.capture('$pageview')
  // }, [location])

  return <>{children}</>
}
