# Next.js 2025 — Melhores Práticas

## Sumário de Ações (Checklist)

- [ ] Estrutura de Pastas e Arquitetura
- [ ] Variáveis de Ambiente e Segurança
- [ ] SSR, SSG, ISR e Data Fetching
- [ ] Componentização: Server vs Client
- [ ] Otimização de Imagens e Fontes
- [ ] SEO e Metadata
- [ ] Navegação e Roteamento
- [ ] Integração com APIs e Backend
- [ ] Performance e Bundle Analysis
- [ ] Acessibilidade e Linting
- [ ] Testes e Monitoramento
- [ ] Segurança Avançada (CSP, Tainting)
- [ ] Deploy, Build e Produção
- [ ] Documentação e Manutenção

---

## Estrutura de Pastas e Arquitetura
- Use `/app` (App Router) para novos projetos, `/pages` para legado.
- Separe `/components`, `/lib`, `/hooks`, `/public`, `/styles`.
- Utilize layouts compartilhados em `app/layout.js`.
- Prefira Server Components para lógica não interativa.

## Variáveis de Ambiente e Segurança
- Adicione `.env.*` ao `.gitignore`.
- Prefixe variáveis públicas com `NEXT_PUBLIC_`.
- Nunca exponha segredos no client.
- Implemente Content Security Policy (CSP) robusta.

## SSR, SSG, ISR e Data Fetching
- Defina para cada página: SSR, SSG ou ISR.
- Use Server Components para data fetching eficiente.
- Prefira `fetch` com caching e paralelismo.
- Use `unstable_cache` para requests não-fetch.
- Utilize ISR para atualizar páginas estáticas sem rebuild total.

## Componentização: Server vs Client
- Use Server Components por padrão.
- Marque componentes interativos com `'use client'`.
- Otimize o uso do boundary `'use client'` para reduzir bundle JS.

## Otimização de Imagens e Fontes
- Use `<Image />` para otimização automática (WebP, lazy loading).
- Configure `remotePatterns` e `localPatterns` em `next.config.js`.
- Use Font Module para hospedar fontes localmente e evitar CLS.

## SEO e Metadata
- Use Metadata API para títulos, descrições e OpenGraph.
- Gere sitemaps e robots.txt.
- Use `<Head />` no Pages Router.
- Crie OG Images para social sharing.

## Navegação e Roteamento
- Use `<Link />` para navegação client-side.
- Prefira roteamento declarativo.
- Evite `<a>` para rotas internas.
- Use Route Handlers (`app/api/route.js`) para backend no App Router.

## Integração com APIs e Backend
- Use API Routes (`pages/api/*.js`) no Pages Router.
- Use Route Handlers no App Router.
- Nunca exponha segredos no client.
- Prefira fetch paralelo e preloading de dados.

## Performance e Bundle Analysis
- Use `@next/bundle-analyzer` para analisar bundles.
- Use ferramentas externas: Import Cost, Bundle Phobia.
- Otimize imports de bibliotecas (ex: ícones).
- Use streaming e Suspense para carregamento progressivo.

## Acessibilidade e Linting
- Use `eslint-plugin-jsx-a11y` para linting de acessibilidade.
- Teste com Lighthouse e Web Vitals.
- Garanta textos alternativos em imagens (`alt`).

## Testes e Monitoramento
- Use `useReportWebVitals` para enviar métricas.
- Teste localmente com `next build` e `next start`.
- Implemente testes unitários e de integração.

## Segurança Avançada (CSP, Tainting)
- Implemente CSP para bloquear XSS e injeção.
- Use tainting para evitar vazamento de dados sensíveis.
- Proteja Server Actions com autorização robusta.

## Deploy, Build e Produção
- Sempre rode `next build` e `next start` localmente antes do deploy.
- Use Turbopack para builds rápidos.
- Analise Core Web Vitals com Lighthouse.

## Documentação e Manutenção
- Documente decisões de arquitetura e padrões.
- Mantenha exemplos de uso para componentes e APIs.
- Atualize o checklist conforme novas práticas surgirem.

---

**Referências:**
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/production-checklist)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/with-nextjs) 