# 📋 Daily Workflow Checklist

## 🌅 INÍCIO DO DIA (5 minutos)

### Verificação Inicial

```bash
git status
git pull origin main
npm run marco-zero
```

**Checklist:**

- [ ] Working tree limpo
- [ ] Branch atualizado  
- [ ] Marco Zero confirmado (0 erros)
- [ ] Build funcionando

---

## 🔥 DURANTE O DESENVOLVIMENTO

### Ciclo de 30 minutos

1. **Desenvolver** (25 min)
2. **Verificar** (3 min)
3. **Commit** (2 min)

### Comandos do Ciclo

```bash
# Verificação rápida
npm run lint:fix
npm run build

# Commit incremental
git add .
git commit -m "🎯 FEAT: [descrição clara]"
```

---

## 🎯 FIM DO DIA (10 minutos)

### Verificação Final

```bash
npm run marco-zero
git status
git log --oneline -3
```

**Checklist Final:**

- [ ] Marco Zero mantido
- [ ] Commits descritivos
- [ ] Working tree limpo
- [ ] Progresso documentado

---

## 🚀 COMANDOS ESSENCIAIS

### Verificação Completa

```bash
npm run marco-zero
```

### Correção Automática

```bash
npm run lint:fix
```

### Status do Projeto

```bash
git status && git log --oneline -5
```

---

## 🏆 METAS DIÁRIAS

- [ ] **Marco Zero**: 0 erros ESLint
- [ ] **Build**: < 5 segundos
- [ ] **Commits**: Mensagens descritivas
- [ ] **Progresso**: Features incrementais

---

*Baseado no guia de boas práticas - mantenha a disciplina!* 🚀
