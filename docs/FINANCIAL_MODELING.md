# Projeção Patrimonial com Monte Carlo e Movimento Browniano Geométrico

## Início

Introdução

Este documento apresenta a aplicação de simulações de Monte Carlo sobre um Movimento Browniano Geométrico (GBM) – e suas extensões com ruído Laplace (caudas mais gordas) e saltos Poisson (eventos súbitos) – para projeção patrimonial e cálculo de aposentadoria. Ele demonstra como gerar milhares de cenários futuros para uma carteira de investimentos, quantificar incertezas e traduzir esses resultados em recomendações práticas para o cliente.

Estrutura em alto nível:

1. Resumo — visão executiva do modelo, suas extensões e por que usá‑los.
2. Como o advisor explica ao cliente — narrativa prática focada em planejamento patrimonial.
3. Relatório detalhado — fundamentos teóricos, passo‑a‑passo da simulação, visualizações, extensões (Laplace & Poisson) e limitações.
4. Código de referência — função Python para replicar e adaptar as simulações.

## 1. Resumo

O que é? Partimos de um Movimento Browniano (passeio aleatório aditivo) e o aplicamos de forma multiplicativa para obter o Movimento Browniano Geométrico (GBM): a variação percentual em cada instante tem retorno médio (μ) e volatilidade (σ) constantes.

Como simulamos? Dividimos o horizonte em pequenos passos (Δt) e, em cada passo, aplicamos um choque aleatório √Δt·N(0, 1). Repetimos o processo em M caminhos (ex.: 10 000) — técnica de Monte Carlo.

Como lemos? Ao fim, temos M valores de preço. A média indica o cenário "central"; os percentis 5 % e 95 % delimitam faixa pessimista/otimista.

Por que usar? É rápido, intuitivo e comunica risco de forma visual (fan‑chart, histograma). Limitações: caudas finas, volatilidade constante.

## 2. Como o advisor explica ao cliente

"Projetar patrimônio não é prever o futuro, mas mapear cenários prováveis. Usamos um modelo estatístico que gera milhares de futuros possíveis para sua carteira, cada um respeitando o histórico de retorno e volatilidade. A média desses cenários mostra onde você tende a chegar; a faixa entre o pior 5 % e o melhor 5 % ajuda a responder: e se o mercado surpreender? Assim, definimos metas e colchões de liquidez com números — não palpites."

Pontos‑chave que convencem:

- Transparência: apresentar inputs (retorno histórico, volatilidade) e deixar claro que são revisados periodicamente.
- Gestão de expectativas: a faixa de incerteza lembra que alta performance exige tolerância a riscos.
- Ação prática: usar o percentil 5 % como stress test para checar se o plano de vida se mantém viável mesmo em anos ruins.

## 3. Relatório detalhado

### 3.1 Fundamentos teóricos

Elemento | Expressão | Intuição
--- | --- | ---
Browniano padrão (Wₜ) | Wₜ ~ 𝒩(0, t) (ou dW ~ 𝒩(0, dt)) | Ruído aleatório que serve de "motor" estocástico
GBM | dS/S = μ dt + σ dW | Drift μ puxa a média; σ amplia a dispersão
Solução | Sₜ = S₀·exp[(μ − ½σ²) t + σ Wₜ] | log S é Normal → S é Log‑normal
Hipóteses | choques independentes | μ e σ fixos, sem saltos

### 3.2 Passo‑a‑passo da simulação

Defina inputs: S₀, μ, σ, horizonte T, passos N, simulações M.
Calcule dt = T / N e constantes: drift = (μ − ½σ²)·dt, diff = σ √dt.
Gere matriz Z ~ N(0, 1) tamanho N × M.
Construa cada trajetória:  S_{t+1} = S_t·exp(drift + diff·Z).
Colete S_T de cada caminho.
Resumo estatístico: média, mediana, desvio‑padrão, p5, p95, VaR, CVaR.

### 3.3 Visualizações sugeridas

- Fan chart ao longo do tempo (bandas 50 %, 75 %, 95 %).
- Histograma de S_T marcando média e caudas.
- Tabela compacta para relatórios executivos.

### 3.4 Limitações e extensões

Limitação | Ajuste possível
--- | ---
Caudas finas | Distribuição t, Cornish‑Fisher
Volatilidade constante | GARCH, Heston
Falta de saltos | Modelos jump‑diffusion
Um único ativo | Vetor GBM com correlação ou copulas

### 3.5 Incorporando distribuições Laplace e saltos Poisson

Objetivo | Abordagem | Ajuste na simulação
--- | --- | ---
Capturar caudas mais gordas (Laplace) | Substituir o ruído Normal por ruído Laplace (0, b), onde b = σ/√2 preserva a variância. | Gere Z = np.random.laplace(0, b, size) no lugar de np.random.normal.  A fórmula discreta continua: S_{t+1} = S_t · exp(drift + diff · Z).
Modelar saltos eventuais (Poisson) | Adotar um modelo de salto‑difusão (Merton). Acrescenta‑se: dS/S = (μ − λκ) dt + σ dW + J dN. dN é Poisson(λ dt); J = exp(Y) − 1 com Y ~ 𝒩(μ_J, σ_J²). | Na discretização, para cada passo: jump = np.random.poisson(λ dt, sims) S *= np.exp(jump*np.random.normal(μ_J, σ_J)).

Impacto prático:

- Laplace aumenta a frequência de retornos extremos sem alterar média/vol.
- Poisson permite choques de grande magnitude, refletindo crises ou anúncios.
- Ambos melhoram o stress‑test de planos de aposentadoria, mostrando cenários mais severos.

## 4. Código de referência (Python)

```python
import numpy as np

def monte_carlo_gbm(S0, mu, sigma, T, steps=252, sims=10000, seed=None):
    if seed is not None:
        np.random.seed(seed)
    dt = T / steps
    drift = (mu - 0.5 * sigma**2) * dt
    diff  = sigma * np.sqrt(dt)
    Z = np.random.normal(size=(steps, sims))
    S = np.empty_like(Z)
    S[0] = S0
    for t in range(1, steps):
        S[t] = S[t-1] * np.exp(drift + diff * Z[t])
    return S[-1]  # valores no horizonte T
```

### Exemplo de uso

```python
final_prices = monte_carlo_gbm(100, 0.08, 0.20, 1)
print(np.percentile(final_prices, [5, 50, 95]))
```

Documento criado para auxiliar advisors na comunicação de risco e retorno usando GBM + Monte Carlo.

## Fim
