
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      host: '::',
      port: 8080,
      watch: {
        usePolling: true,
        interval: 1000
      },
      // Relaxed security headers for Lovable compatibility
      headers: mode === 'development' ? {
        'X-Content-Type-Options': 'nosniff',
        // Removed X-Frame-Options to allow Lovable iframe embedding
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Relaxed Permissions-Policy for development
        'Permissions-Policy': 'camera=(), microphone=()'
      } : {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react']
    },
    build: {
    // Remove console logs in production
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-checkbox']
          }
        }
      }
    },
    define: {
      'process.env': {
        SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
        SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY),
        POSTHOG_TOKEN: JSON.stringify(env.POSTHOG_TOKEN),
        POSTHOG_HOST: JSON.stringify(env.POSTHOG_HOST)
      }
    }
  }
})
