#!/bin/bash

# 🎯 SUPER LINTER MONITOR - Protocolo Roberto
# Monitora o status do Super Linter em tempo real

GITHUB_TOKEN="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"
RUN_ID="15797566619"
REPO="robertoecf/futuro-em-foco-planner"

echo "🚀 SUPER LINTER MONITOR ATIVO"
echo "================================"
echo "📊 Run ID: $RUN_ID"
echo "🔗 Repo: $REPO"
echo "⏰ Iniciado: $(date)"
echo ""

while true; do
    # Buscar status atual
    response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/actions/runs/$RUN_ID")
    
    status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    conclusion=$(echo "$response" | grep -o '"conclusion":"[^"]*"' | cut -d'"' -f4)
    updated_at=$(echo "$response" | grep -o '"updated_at":"[^"]*"' | cut -d'"' -f4)
    
    echo "⏰ $(date '+%H:%M:%S') | Status: $status | Conclusion: $conclusion"
    
    # Se completou, mostrar resultado final
    if [ "$status" = "completed" ]; then
        echo ""
        echo "🎉 SUPER LINTER FINALIZADO!"
        echo "📊 Status Final: $status"
        echo "✅ Resultado: $conclusion"
        echo "⏰ Atualizado em: $updated_at"
        echo ""
        
        if [ "$conclusion" = "success" ]; then
            echo "🎯 ✅ SUCESSO! Super Linter passou em todos os testes!"
            echo "🚀 PR #35 está pronto para merge!"
        else
            echo "❌ FALHA! Super Linter encontrou problemas."
            echo "🔍 Verificar logs em: https://github.com/$REPO/actions/runs/$RUN_ID"
        fi
        
        # Notificar Roberto via webhook/ping
        echo "📢 PING PARA ROBERTO: Super Linter finalizado com status: $conclusion"
        break
    fi
    
    # Aguardar 30 segundos antes da próxima verificação
    sleep 30
done

echo ""
echo "🏁 Monitoramento finalizado - $(date)"
