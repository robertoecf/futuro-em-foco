# 🏆 SUPER LINTER BEST PRACTICES - Stack Específico

## 🎯 **NOSSO STACK TECNOLÓGICO (2025)**

### **Frontend Core:**
- **React 18.3.1** + **TypeScript 5.8.3**
- **Vite 5.4.19** (build tool moderno)
- **Tailwind CSS 3.4.11** (utility-first CSS)
- **Radix UI** (headless components)
- **Recharts** (data visualization)

### **Backend & Services:**
- **Supabase** (backend-as-a-service)
- **PostHog** (product analytics)

### **Development Tools:**
- **ESLint 9.29.0** + **Prettier 3.5.3**
- **Husky 9.1.7** (git hooks)
- **lint-staged 16.1.2** (staged files linting)

## 🚀 **CONFIGURAÇÃO OTIMIZADA SUPER LINTER**

### **1. Approach: SELECTIVE EXCLUSION**
```yaml
# ✅ RECOMENDADO: Usar apenas exclusões (VALIDATE_*=false)
# ❌ EVITAR: Misturar inclusões e exclusões
env:
  VALIDATE_ALL_CODEBASE: false
  DEFAULT_BRANCH: "main"
  
  # Disable problematic/redundant linters
  VALIDATE_TYPESCRIPT_STANDARD: false  # Conflita com ESLint v9
  VALIDATE_TYPESCRIPT_ES: false        # Redundante com nosso ESLint
  VALIDATE_TSX: false                   # Redundante com nosso ESLint
  VALIDATE_PRETTIER: false             # Já integrado no ESLint
  VALIDATE_YAML: false                  # Muitos false positives
  VALIDATE_JSON: false                  # Muitos false positives
  
  # Keep essential linters (default enabled)
  # VALIDATE_JSCPD: true (default)
  # VALIDATE_GITLEAKS: true (default)
  # VALIDATE_CHECKOV: true (default)
```

### **2. Configuração JSCPD Otimizada**
```json
{
  "threshold": 5,
  "minLines": 10,
  "minTokens": 50,
  "ignore": [
    "src/lib/gbm/**",           // Algoritmos matemáticos complexos
    "src/integrations/**",      // Código de integração padronizado
    "src/components/ui/**",     // Componentes Radix/shadcn
    "src/styles/**",            // CSS utilitário
    "**/*.test.ts",             // Testes podem ter padrões similares
    "**/node_modules/**",       // Dependências
    "**/dist/**",               // Build artifacts
    "**/*.md"                   // Documentação
  ],
  "reporters": ["console"],
  "format": ["typescript", "javascript", "tsx", "jsx"]
}
```

### **3. Exclusões de Arquivos Inteligentes**
```yaml
FILTER_REGEX_EXCLUDE: "tsconfig\\..*\\.json|package-lock\\.json|bun\\.lockb|\\.vscode/|\\.git/|node_modules/|dist/|build/|coverage/|.*\\.md$"
```

## 🎯 **MELHORES PRÁTICAS POR CATEGORIA**

### **A. TypeScript & React**
- ✅ **Usar ESLint local** em vez do Super Linter para TS/TSX
- ✅ **Configurar tsconfig.json** com strict mode
- ✅ **Usar Prettier integrado** no ESLint
- ❌ **Evitar** VALIDATE_TYPESCRIPT_* no Super Linter

### **B. Segurança**
- ✅ **Manter GITLEAKS** habilitado (default)
- ✅ **Manter CHECKOV** habilitado (default)
- ✅ **Configurar .gitleaksignore** se necessário
- ✅ **Revisar regularmente** dependências vulneráveis

### **C. Qualidade de Código**
- ✅ **JSCPD configurado** com threshold realista (5%)
- ✅ **Exclusões inteligentes** para código gerado/padrão
- ✅ **Monitoramento contínuo** de duplicação
- ✅ **Refatoração proativa** quando threshold excedido

### **D. Performance**
- ✅ **VALIDATE_ALL_CODEBASE: false** para PRs
- ✅ **Exclusões específicas** para arquivos grandes
- ✅ **Cache de dependências** quando possível
- ✅ **Paralelização** de linters independentes

## 🔧 **CONFIGURAÇÃO RECOMENDADA FINAL**

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
          
          # Disable redundant/problematic linters
          VALIDATE_TYPESCRIPT_STANDARD: false
          VALIDATE_TYPESCRIPT_ES: false
          VALIDATE_TSX: false
          VALIDATE_PRETTIER: false
          VALIDATE_YAML: false
          VALIDATE_JSON: false
          VALIDATE_HTML: false
          VALIDATE_CSS: false
          
          # Configure JSCPD
          JSCPD_CONFIG_FILE: ".jscpd.json"
          
          # Smart exclusions
          FILTER_REGEX_EXCLUDE: "tsconfig\\..*\\.json|package-lock\\.json|bun\\.lockb|\\.vscode/|\\.git/|node_modules/|dist/|build/|.*\\.md$"
          
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📊 **MÉTRICAS DE QUALIDADE**

### **Target Goals:**
- 🎯 **JSCPD**: < 5% duplicação
- 🎯 **GITLEAKS**: 0 secrets expostos
- 🎯 **CHECKOV**: 0 vulnerabilidades críticas
- 🎯 **Build Time**: < 2 minutos
- 🎯 **False Positives**: < 5%

### **Monitoramento:**
- ✅ **Weekly Review** dos resultados
- ✅ **Threshold Adjustment** baseado em métricas
- ✅ **Exclusion Tuning** para reduzir ruído
- ✅ **Performance Tracking** do pipeline

## 🚨 **TROUBLESHOOTING COMUM**

### **Erro: "Behavior not supported"**
- **Causa**: Mistura de VALIDATE=true e VALIDATE=false
- **Solução**: Usar apenas exclusões (VALIDATE=false)

### **JSCPD False Positives**
- **Causa**: Threshold muito baixo ou padrões normais
- **Solução**: Ajustar threshold e adicionar exclusões

### **Performance Issues**
- **Causa**: VALIDATE_ALL_CODEBASE=true em repos grandes
- **Solução**: Usar VALIDATE_ALL_CODEBASE=false

### **TypeScript Conflicts**
- **Causa**: Super Linter ESLint vs Local ESLint
- **Solução**: Desabilitar VALIDATE_TYPESCRIPT_* no Super Linter

## 🎉 **RESULTADO ESPERADO**

Com essa configuração otimizada:
- ✅ **Zero conflitos** de configuração
- ✅ **Tempo de execução** reduzido
- ✅ **False positives** minimizados  
- ✅ **Qualidade de código** mantida
- ✅ **Developer Experience** melhorada 

---

## 📚 **HISTÓRICO E CONTEXTO (O PORQUÊ DAS DECISÕES)**

- **Incompatibilidade ESLint v9**: O Super Linter encontrou problemas ao tentar usar sua versão interna do ESLint em nosso código configurado para a v9 (moderna). A solução foi desativar a validação de `TypeScript/TSX` no Super Linter, confiando em nossa pipeline local, que é mais precisa.
- **Duplicação de Código (JSCPD)**: O linter inicialmente detectou duplicação em algoritmos de simulação. Isso foi resolvido através da refatoração do código para um módulo `simulationUtils.ts` compartilhado, eliminando a redundância e melhorando a manutenibilidade.
- **Pre-commit Hooks**: A automação com `husky` e `lint-staged` foi implementada para remover o fardo de rodar linters manualmente e garantir que todo código enviado ao repositório já esteja formatado e sem erros básicos.

---

## 🛠️ **COMANDOS ESSENCIAIS (WORKFLOW LOCAL)**

Os seguintes scripts no `package.json` são a base do nosso workflow de qualidade diário:

- **`npm run lint`**: Executa o ESLint em todo o projeto para verificar erros.
- **`npm run lint:fix`**: Tenta corrigir automaticamente os problemas encontrados pelo ESLint.
- **`npm run format`**: Formata todo o código do projeto usando as regras do Prettier.
- **`npm run marco-zero`**: Comando completo que verifica tipos (`tsc`), executa o lint e faz o build, garantindo que o projeto está 100% saudável. 