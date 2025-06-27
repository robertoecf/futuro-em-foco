import posthog from 'posthog-js';

// 🚫 DESABILITAR POSTHOG EM DESENVOLVIMENTO
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// 🎯 CORREÇÃO: Usar as variáveis VITE_ corretas
const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

// Initialize PostHog only if token is configured AND not in development
if (typeof window !== 'undefined' && POSTHOG_TOKEN && !isDevelopment) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  });
}

export default posthog;
