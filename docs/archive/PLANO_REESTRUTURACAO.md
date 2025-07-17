# Plano de Reestruturação do Projeto

Este documento detalha o plano incremental para reestruturação da base de código,
centralizando configs e migrando para uma organização por features.

## Etapas e Tarefas

1. **[x] Criar pasta `.config` na raiz do projeto para centralizar arquivos de configuração.**

2. **[x] Mover arquivos de configuração (exceto eslint.config.js e vite.config.ts) da raiz para `.config/`. Manter eslint.config.js e vite.config.ts na raiz.**

3. **[x] Rodar eslint após mover arquivos de configuração para garantir que não houve problemas.**

4. **[x] Ajustar scripts e paths das ferramentas para buscar configs em `.config/` (Vite, ESLint, etc.).**

5. **[x] Testar build, lint e dev server após mover cada config para garantir funcionamento.**

6. **[x] Criar (ou expandir) pasta `src/features/` para adotar organização por features.**

7. **[x] Migrar componentes, hooks e lógica de domínio relevantes para dentro de `src/features/` (ex: analytics, planning, lead-generation, etc.).**

8. **Rodar eslint após cada migração de feature/componente para garantir integridade.**

9. **Adotar colocação de testes ao lado dos arquivos de implementação (colocated tests).**

10. **Configurar imports absolutos no tsconfig para facilitar refatoração e organização.**

11. **Documentar a nova estrutura e convenções no README ou `docs/` para alinhamento futuro.**

---

> **Observação:**
>
> - Após cada etapa crítica, rodar `eslint` para identificar rapidamente eventuais
>   problemas.
> - O plano pode ser executado incrementalmente, validando o funcionamento a cada passo.
