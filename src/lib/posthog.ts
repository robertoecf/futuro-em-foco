
import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_your_project_api_key', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export default posthog
