import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: '::',
      port: 8080,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      // Relaxed security headers for Lovable compatibility
      headers:
        mode === 'development'
          ? {
              'X-Content-Type-Options': 'nosniff',
              // Removed X-Frame-Options to allow Lovable iframe embedding
              'X-XSS-Protection': '1; mode=block',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              // Relaxed Permissions-Policy for development
              'Permissions-Policy': 'camera=(), microphone=()',
            }
          : {
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'X-XSS-Protection': '1; mode=block',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            },
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      // Remove console logs in production
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-checkbox'],
          },
        },
      },
    },
    // 🎯 CORREÇÃO: Usar import.meta.env com variáveis VITE_ corretamente
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || 'https://hcmjavggiphoulwgcoej.supabase.co'
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbWphdmdnaXBob3Vsd2djb2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDUzMzMsImV4cCI6MjA2NTkyMTMzM30.rUBOj4-iEYQ77UaqaSfNFMSi84_Xsf6iTBmE7mWtjv4'
      ),
      'import.meta.env.VITE_POSTHOG_TOKEN': JSON.stringify(env.VITE_POSTHOG_TOKEN),
      'import.meta.env.VITE_POSTHOG_HOST': JSON.stringify(
        env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
      ),
    },
    // 🎯 FASE 4 ITEM 7: Configuração do Vitest
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.d.ts',
          'src/test/**',
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  };
});
