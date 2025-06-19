
import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_lt0ZuK1fMmvEEjuOTU9lHyMDf0FIEZ3iPQ15hPwVNHk', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export default posthog
