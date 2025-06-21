# Plano de Refatoração - Futuro em Foco Planner

## Status: Em Progresso

### ✅ Fase 1: Correção Imediata dos Lints (CONCLUÍDA)

1. **Corrigir variáveis não utilizadas** ✅
   - Adicionado prefixo `_` nas variáveis de tempo não utilizadas em `useCalculatorEffects.ts`
   - Removida dependência desnecessária `calculationInputs` do useCallback
   - Corrigidos parâmetros não utilizados em `usePlanningData.ts`
   - Corrigida variável não utilizada em `ChartAnimationStates.tsx`

2. **Configurar ambiente local** ✅
   - Instalado husky e lint-staged
   - Configurado pre-commit hook para executar lint automaticamente
   - Adicionado script "prepare" no package.json
   - Configuração lint-staged para arquivos TypeScript

### 🔄 Fase 2: Refatoração da Calculadora (EM PROGRESSO)

3. **Otimizar renderização do gráfico** 🔄
   - ✅ Implementado React.memo em `ChartRenderer`
   - ✅ Implementado React.memo em `ChartComponent`
   - ✅ Adicionado useMemo para cálculos pesados em `ChartComponent`
   - ✅ Otimizado `useChartDataProcessor` com useMemo
   - ⏳ Próximo: Otimizar animações das 50 linhas do Monte Carlo

4. **Simplificar arquitetura dos hooks**
   - ⏳ Consolidar `useCalculatorState`, `useCalculatorHandlers` e `useCalculatorEffects`
   - ⏳ Implementar Context API para reduzir prop drilling
   - ⏳ Mover efeitos para componentes filhos quando apropriado

### 📋 Fase 3: Limpeza e Organização do Código

5. **Remover duplicações**
   - ⏳ Unificar `getAccumulationAnnualReturn` (existe em múltiplos arquivos)
   - ⏳ Centralizar constantes e tipos
   - ⏳ Criar módulo único para cálculos financeiros

6. **Reorganizar estrutura de pastas**
   ```
   src/
   ├── components/
   │   ├── calculator/
   │   │   ├── Calculator.tsx
   │   │   ├── hooks/
   │   │   ├── utils/
   │   │   └── types/
   │   ├── chart/
   │   │   ├── ChartComponent.tsx
   │   │   ├── hooks/
   │   │   └── utils/
   │   └── ui/
   ├── lib/
   │   ├── calculations/
   │   ├── storage/
   │   └── utils/
   └── hooks/
   ```

### 🧪 Fase 4: Qualidade e Manutenibilidade

7. **Adicionar testes unitários**
   - ⏳ Configurar Jest/Vitest
   - ⏳ Testar funções de cálculo críticas
   - ⏳ Testar hooks customizados
   - ⏳ Configurar coverage mínimo de 80%

8. **Documentação e tipagem**
   - ⏳ Adicionar JSDoc nas funções complexas
   - ⏳ Melhorar interfaces TypeScript
   - ⏳ Criar tipos compartilhados

## Problemas Identificados

### Flickering no Gráfico
- **Causa**: Re-renders desnecessários durante animações
- **Solução Parcial**: Implementada memoização nos componentes principais
- **Próximos Passos**: 
  - Otimizar o sistema de animação das 50 linhas
  - Implementar throttling/debouncing nas atualizações
  - Considerar usar React.Suspense para carregamento assíncrono

### Complexidade dos Hooks da Calculadora
- **Problema**: Lógica distribuída em múltiplos hooks interdependentes
- **Solução Proposta**: Criar um único hook `useCalculator` com sub-módulos internos

### Duplicação de Código
- **Problema**: Funções utilitárias duplicadas
- **Solução**: Criar módulos centralizados por domínio

## Comandos Úteis

```bash
# Executar lint
npm run lint

# Executar lint com correção automática
npx eslint . --fix

# Testar pre-commit hook
git add . && git commit -m "test"
```

## Observações

- Node.js v18.2.0 está abaixo da versão recomendada (>=18.18.0)
- Considerar atualizar Node.js para evitar warnings de compatibilidade
- Super Linter no GitHub Actions está configurado e funcionando 