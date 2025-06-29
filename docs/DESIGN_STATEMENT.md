**&DESIGN STATEMENT**
**BEGIN**
# Manual de Estilo: Tecno-Etéreo
**Versão:** 1.1
**Autor:** Roberto E. C. Freitas, CFP® (Conceito), Gemini (Documentação e Revisão Técnica)
**Data:** 18 de Junho de 2025

## 1. Filosofia e Conceito Principal
O estilo "Tecno-Etéreo" é a fundação visual e interativa deste projeto. O objetivo é criar uma interface que seja simultaneamente tecnologicamente precisa e visualmente fluida, transmitindo sofisticação, clareza e modernidade.

A experiência do usuário deve evocar a sensação de interagir com painéis de vidro inteligentes flutuando sobre uma nebulosa de luz e dados em constante movimento. Este documento serve como a "estrela do norte" para todas as decisões de design e desenvolvimento futuras, garantindo consistência e qualidade.

## 2. Princípios Fundamentais
Todo componente, tela ou funcionalidade nova deve aderir aos seguintes princípios:

### A. Profundidade Através de Camadas:
O design é construído em uma hierarquia de camadas que interagem entre si. A ordem, da mais profunda para a mais superficial, é inviolável:

1.  **Fundo Sólido ou Efeito Aurora:** A base da interface, definida pela variável `--background`.
2.  **Grade Técnica:** Uma textura sutil de grid que confere estrutura, aplicada globalmente ao `body::after`.
3.  **Painéis de Glassmorphism:** Onde o conteúdo reside, utilizando `backdrop-filter` e as variáveis `--card` e `--popover`.
4.  **Conteúdo e Tipografia:** O texto e os elementos da interface, utilizando `--foreground`.
5.  **Efeitos de Luz Interativos:** Como o cursor, que ilumina todas as camadas abaixo (se aplicável).

### B. Animação com Propósito:
Animações devem ser fluidas, informativas e nunca gratuitas. Elas servem para guiar o usuário e dar feedback, reforçando a sensação de uma interface responsiva e polida.

-   **Aprovado:** Transições suaves (`ease-in-out`), `fade-in` combinado com `slide-up`, expansão de elementos com `max-height` (como em `accordion-down`).
-   **Rejeitado:** Animações bruscas, "saltitantes" (bouncing), efeitos que parecem desconectados do layout.

### C. Theming Reativo e Coeso:
O sistema suporta nativamente os modos **claro**, **escuro** e **default do sistema**. O uso de variáveis CSS, gerenciadas pelo TailwindCSS e definidas em `src/styles/base.css`, é mandatório.

-   **Modo Claro:** Ativado por padrão.
-   **Modo Escuro:** Ativado pela classe `.dark` no `<html>`.

### D. Tipografia Estruturada:
O sistema de fontes duplo é uma característica central da identidade.

-   **Fonte Primária (`Inter`):** Utilizada para todo o conteúdo principal, garantindo máxima legibilidade. Definida no `body`.
-   **Fonte de Destaque (`JetBrains Mono`):** Utilizada estrategicamente para reforçar a estética "tech". Aplicada com a classe utilitária `.font-tech`.

## 3. Fundamentos Visuais e Efeitos Chave

### A. Paleta de Cores (Definida em `src/styles/base.css`):
As cores são gerenciadas por variáveis HSL para fácil manipulação.

#### Modo Claro (`:root`)
-   `--background: 0 0% 88%` (#E0E0E0)
-   `--foreground: 222.2 84% 4.9%`
-   `--card: 0 0% 88%`
-   `--primary: 210 40% 98%`
-   `--secondary: 217.2 32.6% 17.5%`
-   `--accent: 217.2 32.6% 17.5%`
-   `--border: 217.2 32.6% 17.5%`

#### Modo Escuro (`.dark`)
-   `--background: 0 0% 8%` (#141414)
-   `--foreground: 210 40% 98%`
-   `--card: 0 0% 8%`
-   `--primary: 210 40% 98%`
-   `--secondary: 217.2 32.6% 17.5%`
-   `--accent: 217.2 32.6% 17.5%`
-   `--border: 217.2 32.6% 17.5%`

### B. Efeitos Visuais Mandatórios:
-   **Painéis de Vidro:** O efeito de "glassmorphism" deve ser aplicado com `backdrop-filter: blur(40px);` (ou valor similar) e uma cor de fundo com transparência, como `rgba(224, 224, 224, 0.9)` no modo claro.
-   **Grade Técnica:** Implementada via `body::after` com `background-image` de gradientes lineares e uma opacidade baixa (`opacity: 0.02`).

## 4. Diretrizes de Interação
-   **Hover States:** Todos os elementos clicáveis devem ter um estado de hover claro, utilizando as classes do Tailwind que se baseiam nas variáveis de tema (`hover:bg-accent`, `hover:text-accent-foreground`).
-   **Transições de Conteúdo:** A troca de seções deve, por padrão, utilizar animações sutis de fade e slide.
-   **Menus Expansíveis:** Devem utilizar as animações `accordion-down` e `accordion-up` definidas em `tailwind.config.ts`.

## 5. Linguagem e Palavras-Chave do Design
Ao descrever ou projetar novos elementos, utilize as seguintes palavras-chave para manter o alinhamento com a visão:

-   **Fluido:** Movimentos e transições suaves.
-   **Preciso:** Layouts limpos, tipografia clara, alinhamento rigoroso.
-   **Imersivo:** O design deve "envelopar" o usuário através das camadas.
-   **Sofisticado:** Elegância nos detalhes, ausência de elementos supérfluos.
-   **Etéreo:** Qualidade de leveza e transparência.
-   **Estruturado:** A base organizada sobre a qual a fluidez acontece.

**END**

**Projeção Patrimonial com Monte Carlo e Movimento Browniano Geométrico**
**BEGIN**
**END** 