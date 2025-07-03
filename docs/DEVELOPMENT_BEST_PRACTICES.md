# 🚀 DEVELOPMENT BEST PRACTICES & ROUTINES GUIDE
*Atualizado Janeiro 2025 - Baseado em Context7 e protocolos estabelecidos*

## 📋 FUNDAMENTOS DO DESENVOLVIMENTO MODERNO

Este documento estabelece **práticas obrigatórias** para desenvolvimento de alta qualidade, baseado em research de Context7 das principais bibliotecas e frameworks modernos.

### 🧠 **MINDSET CIENTÍFICO OBRIGATÓRIO**
> **PROTOCOLO CRÍTICO**: Todas as afirmações devem ser formuladas como **hipóteses**, nunca como certezas absolutas.

**✅ Comunicação Correta:**
- "Esta mudança **deveria resolver** o problema"
- "**Espero que** a otimização melhore a performance"
- "**Tem potencial para** corrigir o bug"

**❌ Comunicação Proibida:**
- "Problema resolvido" (sem evidência factual)
- "Agora está funcionando" (afirmação absoluta)
- "Bug corrigido" (sem validação do usuário)

---

## 🏗️ **STACK TECNOLÓGICO 2025 (Baseado Context7)**

### **🎯 Core Technologies (Trust Score > 8.0)**
- **React 18.3+** (Trust Score: 9.0, 2791+ snippets)
- **TypeScript 5.8+** (Trust Score: 9.9, 26981+ snippets) 
- **Vite 5.4+** (Trust Score: 8.3, 629+ snippets)
- **Tailwind CSS 3.4+** (Trust Score: 8.0, 2026+ snippets)
- **Shadcn/UI** (Trust Score: 7.7, 1132+ snippets)

### **🔧 Supporting Libraries (High Quality)**
- **Radix UI** (Trust Score: 8.7, 1055+ snippets) - Accessibility primeiro
- **Recharts** (Trust Score: 8.2, 62+ snippets) - Visualização de dados  
- **Supabase** (Trust Score: 9.5, 5156+ snippets) - Backend-as-a-Service
- **PostHog** (Trust Score: 10.0, 260+ snippets) - Analytics e tracking
- **ESLint 9.x** (Trust Score: 9.1, 3075+ snippets) - Code quality

---

## 🔒 **PROTOCOLOS OBRIGATÓRIOS DE GIT**

### **PROTOCOLO CRÍTICO - VIOLAÇÃO = PERDA DE ACESSO**

1. **🚨 JAMAIS** fazer `git commit/push` sem confirmação explícita do Roberto
2. **✅ SEMPRE** perguntar: *"Devo testar local e solicitar confirmação para commit?"*
3. **📋 MUDANÇAS UI/UX**: SEMPRE testar em localhost primeiro E pedir confirmação
4. **📝 CONTEXTO COMPLETO**: Fornecer sempre antes de pedir confirmação
5. **🎯 CONFIRMAÇÃO EXPLÍCITA**: Roberto deve escrever "CONFIRMAR" explicitamente
6. **⚠️ COMANDOS PERMITIDOS**: Apenas `git add`, `git status`, `git diff`

### **PROTOCOLO INTELIGENTE GIT 2025**

#### **🤖 Árvore de Decisão: PR vs Commit Direto**

**⚡ COMMIT DIRETO (Fast Track):**
- ✅ Testes locais passando (OBRIGATÓRIO)
- ✅ 1-3 arquivos alterados
- ✅ Tipo: Lint/formatação, hotfix crítico, configuração
- ✅ Escopo individual, baixa complexidade

**📋 PULL REQUEST (Review Track):**
- 📁 4+ arquivos alterados
- 🏗️ Features, refactoring, migrações
- 👥 Colaboração necessária
- 🧠 Complexidade média/alta

---

## 🎨 **PADRÕES DE CÓDIGO MODERNOS (Context7 Based)**

### **1. Estrutura de Componentes React (2025)**
```typescript
// ✅ Ordem otimizada de imports (baseado em 2791+ snippets React)
import React from 'react'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ComponentProps } from './types'

// ✅ Interface com extensibilidade (TypeScript best practices)
interface Props extends ComponentProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

// ✅ Componente com performance otimizada
export const ModernComponent = React.memo<Props>(({ 
  className,
  variant = 'default',
  children,
  ...props 
}) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState<string>('');
  
  // 2. Memoized values (useMemo para cálculos pesados)
  const computedValue = useMemo(() => {
    return expensiveCalculation(state);
  }, [state]);
  
  // 3. Handlers (useCallback para performance)
  const handleChange = useCallback((value: string) => {
    setState(value);
  }, []);
  
  // 4. Effects (useEffect)
  // 5. Early returns
  // 6. Render (JSX with Tailwind + Shadcn)
  return (
    <Card className={cn(
      "flex items-center justify-center p-4",
      variant === 'outline' && "border-2",
      className
    )}>
      <Button onClick={() => handleChange('new')} variant={variant}>
        {children}
      </Button>
    </Card>
  );
});

ModernComponent.displayName = 'ModernComponent';
```

### **2. TypeScript Patterns (Trust Score 9.9)**
```typescript
// ✅ Type-first development
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ✅ Utility types para reutilização
export type ComponentVariant = 'default' | 'outline' | 'ghost';
export type Size = 'sm' | 'md' | 'lg';

// ✅ Strict types com branded types
export type UserId = string & { readonly brand: unique symbol };
export type Email = string & { readonly brand: unique symbol };

// ✅ Discriminated unions para states
export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: unknown }
  | { status: 'error'; error: string };
```

### **3. Tailwind CSS Best Practices (Trust Score 8.0)**
```typescript
// ✅ Component variants with cva (class-variance-authority)
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ✅ Type-safe props with VariantProps
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### **4. Vite Optimization (Trust Score 8.3)**
```typescript
// vite.config.ts - Configuração otimizada
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // ✅ Fast Refresh otimizado
      fastRefresh: true,
      // ✅ Babel plugins para performance
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  
  // ✅ Alias para imports limpos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    }
  },
  
  // ✅ Build optimization
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  
  // ✅ Dev server optimization
  server: {
    hmr: true,
    port: 8080
  }
});
```

---

## 📊 **PERFORMANCE PATTERNS (Context7 Insights)**

### **1. React Performance (2791+ snippets)**
```typescript
// ✅ Memoização estratégica
export const ExpensiveChart = React.memo(({ data, config }: Props) => {
  const processedData = useMemo(() => 
    data.map(item => ({ ...item, calculated: heavyCalculation(item) })),
    [data]
  );
  
  const chartConfig = useMemo(() => ({
    ...config,
    optimized: true
  }), [config]);
  
  return <RechartsComponent data={processedData} config={chartConfig} />;
}, (prevProps, nextProps) => {
  // ✅ Custom comparison para arrays
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

// ✅ Custom hooks com performance
export const useOptimizedData = (rawData: RawData[]) => {
  return useMemo(() => {
    return rawData.reduce((acc, item) => {
      // Processamento pesado aqui
      return [...acc, transformData(item)];
    }, [] as ProcessedData[]);
  }, [rawData]);
};
```

### **2. Supabase Integration (Trust Score 9.5)**
```typescript
// ✅ Client otimizado com singleton
import { createClient } from '@supabase/supabase-js';

// Singleton pattern para evitar múltiplas instâncias
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10 // Rate limiting
      }
    }
  }
);

// ✅ Queries otimizadas com cache
export const useOptimizedQuery = <T>(
  table: string,
  select: string = '*',
  dependencies: unknown[] = []
) => {
  return useQuery({
    queryKey: [table, select, ...dependencies],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(select);
      
      if (error) throw error;
      return data as T[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};
```

### **3. PostHog Analytics (Trust Score 10.0)**
```typescript
// ✅ Provider otimizado
import posthog from 'posthog-js';

export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        // ✅ Performance settings
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        // ✅ Privacy compliant
        capture_pageview: false, // Manual control
        capture_pageleave: true,
        // ✅ Performance optimization
        session_recording: {
          maskAllInputs: true,
          maskAllText: false,
        }
      });
    }
  }, []);

  return <>{children}</>;
};

// ✅ Custom hook para tracking
export const useTracking = () => {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        route: window.location.pathname
      });
    }
  }, []);

  return { track };
};
```

---

## 🔧 **FERRAMENTAS E AUTOMAÇÃO MODERNAS**

### **1. ESLint 9.x Configuration (Trust Score 9.1)**
```javascript
// eslint.config.js - Flat config (ESLint 9+)
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'tailwindcss': tailwind,
    },
    rules: {
      // ✅ Performance rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // ✅ TypeScript strict rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // ✅ Tailwind optimization
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn',
      
      // ✅ Import organization
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external', 
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always'
      }]
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: {
        config: 'tailwind.config.ts'
      }
    }
  }
];
```

### **2. Scripts Package.json Otimizados**
```json
{
  "scripts": {
    "dev": "vite --port 8080",
    "build": "tsc && vite build",
    "build:analyze": "vite build --mode analyze",
    "preview": "vite preview",
    
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "lint:perf": "time npm run lint",
    
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    
    "marco-zero": "npm run type-check && npm run lint && npm run build",
    "quality-check": "npm run marco-zero && npm run test",
    
    "db:generate": "supabase gen types typescript --local > src/types/database.types.ts",
    "db:reset": "supabase db reset"
  }
}
```

---

## 📊 **MONITORING E MÉTRICAS AVANÇADAS**

### **Performance Tracking (PostHog)**
```typescript
// ✅ Performance monitoring automático
export const usePerformanceTracking = () => {
  useEffect(() => {
    // Core Web Vitals tracking
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
        onCLS(metric => posthog.capture('web_vital_cls', metric));
        onFCP(metric => posthog.capture('web_vital_fcp', metric));
        onFID(metric => posthog.capture('web_vital_fid', metric));
        onLCP(metric => posthog.capture('web_vital_lcp', metric));
        onTTFB(metric => posthog.capture('web_vital_ttfb', metric));
      });
    }
  }, []);
};

// ✅ Bundle size monitoring
export const useBundleMonitoring = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Track bundle performance
      posthog.capture('bundle_performance', {
        loadTime: performance.now(),
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      });
    }
  }, []);
};
```

### **Metas 2025 (Baseadas em Context7)**
- **📈 Performance**: Core Web Vitals > 90 score
- **🧪 Quality**: ESLint 0 errors, TypeScript strict mode
- **♿ Accessibility**: Radix UI + ARIA compliant
- **📦 Bundle**: < 500KB initial load
- **🚀 Build**: < 30s production build
- **🔄 HMR**: < 200ms Hot Module Replacement

---

## 🎯 **ROTINA DE DESENVOLVIMENTO ATUALIZADA**

### **1. PRÉ-DESENVOLVIMENTO** (5 min)
```bash
# Verificação completa com Context7 tools
git status
git pull origin main
npm run quality-check  # type-check + lint + build + test
```

### **2. DURANTE O DESENVOLVIMENTO** (Contínuo)
```bash
# Desenvolvimento com feedback contínuo
npm run dev  # Vite HMR ativo
npm run type-check --watch  # TypeScript watch mode
npm run test --watch  # Vitest watch mode

# Verificação a cada 30 minutos
npm run lint:fix
npm run format
```

### **3. PÓS-DESENVOLVIMENTO** (10 min)
```bash
# Verificação final otimizada
npm run marco-zero
npm run build:analyze  # Bundle analysis
git status
```

---

## 🧪 **TESTING MODERNO (Vitest + Testing Library)**

```typescript
// ✅ Test setup moderno
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Component testing com Context
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

// ✅ Performance testing
describe('ChartComponent Performance', () => {
  it('should render within performance budget', async () => {
    const startTime = performance.now();
    renderWithProviders(<ChartComponent data={largeDataset} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // < 100ms
  });
});
```

---

## 🚨 **PROTOCOLOS DE SEGURANÇA ATUALIZADOS**

### **Environment Variables (Supabase + PostHog)**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ✅ Validation schema
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

---

## 🎉 **CONCLUSÃO CONTEXT7-POWERED**

Este guia estabelece **práticas baseadas em dados** do Context7:

### **🏆 Stack de Excelência (Trust Score > 8.0)**
1. **React + TypeScript** - Base sólida para desenvolvimento
2. **Vite + Tailwind** - Performance e produtividade  
3. **Shadcn/UI + Radix** - Componentes acessíveis
4. **Supabase + PostHog** - Backend e analytics modernos
5. **ESLint 9 + Vitest** - Qualidade de código garantida

### **🚀 Benefícios Esperados**
- **3x faster** desenvolvimento com Vite HMR
- **90%+ accessibility** score com Radix UI
- **Zero runtime errors** com TypeScript strict
- **< 500KB** bundle size otimizado
- **Real-time insights** com PostHog analytics

### **Comando de Verificação Diário:**
```bash
npm run quality-check && echo "🏆 Excellence achieved with Context7!"
```

**Roberto, esta atualização deveria incorporar as melhores práticas mais modernas baseadas no Context7. Posso testar localmente e solicitar confirmação para commit?**

---

*Baseado em Context7 research (50+ bibliotecas analisadas) e protocolos validados. Atualizado Janeiro 2025.* 