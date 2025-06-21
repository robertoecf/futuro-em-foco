import posthog from 'posthog-js'

// Initialize PostHog only if token is configured
if (typeof window !== 'undefined' && process.env.POSTHOG_TOKEN) {
  posthog.init(process.env.POSTHOG_TOKEN, {
    api_host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
} else {
  console.log('📊 PostHog desabilitado - token não configurado (desenvolvimento)')
}

export default posthog
