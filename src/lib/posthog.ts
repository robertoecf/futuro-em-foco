
import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.POSTHOG_TOKEN ?? '', {
    api_host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export default posthog
