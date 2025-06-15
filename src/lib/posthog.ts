
import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_lt0ZuK1fMmvEEjuOTU9lHyMDf0FIEZ3iPQ15hPwVNHk', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true, // Changed to true
    capture_session_replay: true // Added
  })
}

export default posthog
