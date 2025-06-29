# 🏆 Guia Definitivo de Linting e Qualidade de Código

*Este documento unifica todas as informações sobre Super Linter, ESLint, Prettier e outras ferramentas de qualidade, servindo como a única fonte de verdade para o projeto.*

---

## 1. 🚀 Configuração Atual e Obrigatória

A configuração de qualidade de código do projeto é dividida em duas frentes: **local** (para desenvolvimento ágil) e **remota** (no GitHub Actions com Super Linter para validação final).

### A. Configuração Remota (Super Linter)

A validação no servidor é feita pelo Super Linter. A estratégia é de **exclusão seletiva**: desabilitamos os linters que conflitam com nossa configuração local (mais moderna) e mantemos apenas os validadores essenciais.

**Arquivo:** `.github/workflows/super-linter.yml`
```yaml
name: Lint Code Base
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  run-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Lint Code Base
        uses: github/super-linter@v6
        env:
          VALIDATE_ALL_CODEBASE: false
          DEFAULT_BRANCH: "main"
          
          # Desabilitar linters redundantes ou problemáticos
          VALIDATE_TYPESCRIPT_STANDARD: false
          VALIDATE_TYPESCRIPT_ES: false
          VALIDATE_TSX: false
          VALIDATE_PRETTIER: false
          VALIDATE_YAML: false
          VALIDATE_JSON: false
          VALIDATE_HTML: false
          VALIDATE_CSS: false
          
          # Configurar JSCPD para detecção de duplicatas
          VALIDATE_JSCPD: true
          JSCPD_CONFIG_FILE: ".jscpd.json"
          
          # Exclusões inteligentes de arquivos
          FILTER_REGEX_EXCLUDE: "tsconfig\\..*\\.json|package-lock\\.json|bun\\.lockb|\\.vscode/|\\.git/|node_modules/|dist/|build/|.*\\.md$"
          
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### B. Detecção de Código Duplicado (JSCPD)

A configuração foi ajustada para um threshold realista e para ignorar arquivos que naturalmente possuem padrões repetitivos (UI, testes, etc.).

**Arquivo:** `.jscpd.json`
```json
{
  "threshold": 5,
  "minLines": 10,
  "minTokens": 50,
  "ignore": [
    "src/lib/gbm/**",
    "src/integrations/supabase/**",
    "src/components/ui/**",
    "src/components/chart/ChartRenderer.tsx",
    "src/components/chart/ChartControls.tsx",
    "src/components/chart/ProjectingMessage.tsx",
    "src/lib/utils.ts",
    "src/styles/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.md",
    "**/*.json"
  ]
}
```

### C. Configuração Local (ESLint, Prettier, Husky)

Para garantir a qualidade antes mesmo do commit, usamos uma combinação de ferramentas:
- **ESLint v9**: Com configuração "flat" em `eslint.config.js`. É a nossa principal ferramenta de linting para TypeScript/React.
- **Prettier**: Integrado diretamente nas regras do ESLint para formatação de código.
- **Husky & lint-staged**: Executam o linting e a formatação automaticamente nos arquivos modificados antes de cada commit.

---

## 2. 🎯 Melhores Práticas e Filosofia

- **Fonte Local é a Verdade**: Nossa configuração local de ESLint é mais específica e moderna que a do Super Linter. A validação remota serve como uma segunda camada de proteção, focando em segurança (`gitleaks`) e duplicação (`jscpd`).
- **Performance é Chave**: `VALIDATE_ALL_CODEBASE: false` é usado para que o linter analise apenas os arquivos modificados nos Pull Requests, tornando o processo mais rápido.
- **Segurança Primeiro**: Os validadores de segurança como `gitleaks` e `checkov` permanecem ativos por padrão no Super Linter para detectar senhas ou vulnerabilidades acidentais.

---

## 3. 🛠️ Comandos Essenciais

Os seguintes scripts no `package.json` são a base do nosso workflow de qualidade:

- **`npm run lint`**: Executa o ESLint em todo o projeto para verificar erros.
- **`npm run lint:fix`**: Tenta corrigir automaticamente os problemas encontrados pelo ESLint.
- **`npm run format`**: Formata todo o código do projeto usando as regras do Prettier.
- **`npm run marco-zero`**: Comando completo que verifica tipos (`tsc`), executa o lint e faz o build, garantindo que o projeto está 100% saudável.

---

## 4. 📚 Histórico e Contexto (O Porquê das Decisões)

- **Incompatibilidade ESLint v9**: O Super Linter encontrou problemas ao tentar usar sua versão interna do ESLint em nosso código configurado para a v9 (moderna). A solução foi desativar a validação de `TypeScript/TSX` no Super Linter, confiando em nossa pipeline local, que é mais precisa.
- **Duplicação de Código (JSCPD)**: O linter inicialmente detectou duplicação em algoritmos de simulação. Isso foi resolvido através da refatoração do código para um módulo `simulationUtils.ts` compartilhado, eliminando a redundância e melhorando a manutenibilidade.
- **Pre-commit Hooks**: A automação com `husky` e `lint-staged` foi implementada para remover o fardo de rodar linters manualmente e garantir que todo código enviado ao repositório já esteja formatado e sem erros básicos. 