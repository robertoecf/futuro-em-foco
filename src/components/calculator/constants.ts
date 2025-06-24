// Default values - Updated to match production parameters
export const DEFAULT_VALUES = {
  INITIAL_AMOUNT: 1000000,  // R$ 1.000.000
  MONTHLY_AMOUNT: 10000,    // R$ 10.000
  CURRENT_AGE: 30,          // 30 anos
  RETIREMENT_AGE: 50,       // 50 anos
  LIFE_EXPECTANCY: 100,     // 100 anos
  RETIREMENT_INCOME: 20000, // R$ 20.000
  PORTFOLIO_RETURN: 4,      // 4% default
  INVESTOR_PROFILE: 'moderado' as const,
  MONTE_CARLO_ENABLED: false
};

// Magic Moment Animation Timers - Roteiro Corrigido Conforme Especificado
export const MAGIC_MOMENT_TIMERS = {
  PROJECTING_DURATION: 1999, // CENA 1: 1999ms - "Calculando possíveis resultados..."
  PATHS_DURATION: 3999, // CENA 2: 3999ms - Carregando todas as trajetórias
  OPTIMIZING_DURATION: 1999, // CENA 3: 1999ms - "Otimizando visualização..." 
  DRAWING_FINAL_DURATION: 3000, // CENA 4: 3000ms - Desenhar cada linha em 1000ms (3 linhas)
  TOTAL_ANIMATION_DURATION: 10997 // Total: 1999 + 3999 + 1999 + 3000
};

// Line Drawing Animation Configuration
export const LINE_ANIMATION = {
  DRAWING_DURATION: 2000, // 2 seconds total for all lines to appear (configurable)
  ANIMATION_CURVE: 'ease-out' as const,
  TOTAL_LINES: 1001, // Aumentado de 500 para 1001
  BATCH_SIZE: 100, // Renderizar em lotes de 100 linhas (otimizado para 1001)
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
  DRAWING_DURATION: 3000, // 3 seconds total for final 3 lines - all synchronized
  DELAY_BETWEEN_LINES: 0, // All lines start at the same time for synchronized animation
  STROKE_ANIMATION_DURATION: 1000, // 1000ms to draw each individual line
  ANIMATION_CURVE: 'ease-out' as const,
  OPACITY_FADE_DURATION: 200, // Quick fade-in
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
