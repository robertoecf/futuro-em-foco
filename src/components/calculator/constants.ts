// Default values
export const DEFAULT_VALUES = {
  INITIAL_AMOUNT: 15000,
  MONTHLY_AMOUNT: 1000,
  CURRENT_AGE: 30,
  RETIREMENT_AGE: 65,
  LIFE_EXPECTANCY: 100,
  RETIREMENT_INCOME: 0,  
  PORTFOLIO_RETURN: 4, // 4% default
  INVESTOR_PROFILE: 'moderado' as const,
  MONTE_CARLO_ENABLED: false
};

// Magic Moment Animation Timers - Cronologia Corrigida
export const MAGIC_MOMENT_TIMERS = {
  PROJECTING_DURATION: 2000, // 2 seconds - "Projetando futuros possíveis..." (reduzido de 3000ms)
  PATHS_DURATION: 6000, // 6 seconds - Mostra as 50 linhas coloridas
  OPTIMIZING_DURATION: 2000, // 2 seconds - "Otimizando exibição..."
  DRAWING_FINAL_DURATION: 4000, // 4 seconds - Desenha as 3 linhas finais
  TOTAL_ANIMATION_DURATION: 14000 // 14 seconds total (reduzido de 15 para 14)
};

// Line Drawing Animation Configuration
export const LINE_ANIMATION = {
  DRAWING_DURATION: 2000, // 2 seconds total for all lines to appear (configurable)
  ANIMATION_CURVE: 'ease-out' as const,
  TOTAL_LINES: 500, // Aumentado de 50 para 500
  BATCH_SIZE: 50, // Renderizar em lotes de 50 linhas
  get DELAY_BETWEEN_LINES() {
    return this.DRAWING_DURATION / this.TOTAL_LINES; // Auto-calculated delay
  },
  STROKE_ANIMATION_DURATION: 1500, // Duration for each individual line to draw
  OPACITY_FADE_DURATION: 300, // Quick fade-in after line is drawn
  USE_CANVAS_RENDERING: true, // Flag para usar Canvas em vez de SVG
  ENABLE_VIRTUALIZATION: true // Renderizar apenas linhas visíveis
};

// Final Lines Drawing Animation Configuration
export const FINAL_LINES_ANIMATION = {
  DRAWING_DURATION: 4000, // 4 seconds total for final 3 lines
  DELAY_BETWEEN_LINES: 1200, // 1.2 seconds between each line start
  STROKE_ANIMATION_DURATION: 2000, // 2 seconds to draw each individual line (slower)
  ANIMATION_CURVE: 'ease-out' as const,
  OPACITY_FADE_DURATION: 400, // Slightly longer fade-in
  LINES: ['pessimistic', 'median', 'optimistic'] as const
};

// Storage keys for localStorage
export const STORAGE_KEYS = {
  INITIAL_AMOUNT: 'calculator_initial_amount',
  MONTHLY_AMOUNT: 'calculator_monthly_amount',
  CURRENT_AGE: 'calculator_current_age',
  RETIREMENT_AGE: 'calculator_retirement_age',
  LIFE_EXPECTANCY: 'calculator_life_expectancy',
  RETIREMENT_INCOME: 'calculator_retirement_income',
  PORTFOLIO_RETURN: 'calculator_portfolio_return',
  INVESTOR_PROFILE: 'calculator_investor_profile',
  MONTE_CARLO_ENABLED: 'calculator_monte_carlo_enabled'
} as const;
