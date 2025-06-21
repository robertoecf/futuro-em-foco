import posthog from 'posthog-js'

// 🚫 DESABILITAR POSTHOG EM DESENVOLVIMENTO
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'

// Initialize PostHog only if token is configured AND not in development
if (typeof window !== 'undefined' && process.env.POSTHOG_TOKEN && !isDevelopment) {
  posthog.init(process.env.POSTHOG_TOKEN, {
    api_host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export default posthog
