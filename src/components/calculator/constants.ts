
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

// Magic Moment Animation Timers - Cronologia Melhorada
export const MAGIC_MOMENT_TIMERS = {
  PROJECTING_DURATION: 2000, // 2 seconds - "Projetando futuros possíveis..."
  PATHS_DURATION: 12000, // 12 seconds - Mostra as 500 linhas coloridas (aumentado para ser mais devagar)
  OPTIMIZING_DURATION: 2000, // 2 seconds - "Otimizando exibição..."
  DRAWING_FINAL_DURATION: 4000, // 4 seconds - Desenha as 3 linhas finais
  TOTAL_ANIMATION_DURATION: 20000 // 20 seconds total (aumentado de 14 para 20)
};

// Line Drawing Animation Configuration - 500 Cenários
export const LINE_ANIMATION = {
  DRAWING_DURATION: 6000, // Mantém 6 segundos original
  ANIMATION_CURVE: 'ease-in-out' as const,
  TOTAL_LINES: 500, // Aumentado para 500 cenários
  get DELAY_BETWEEN_LINES() {
    return this.DRAWING_DURATION / this.TOTAL_LINES; // 12ms delay entre cada linha
  },
  FADE_IN_DURATION: 2000, // 2 seconds para cada linha fazer fade-in (sem stroke animation)
  OPACITY_FADE_DURATION: 800, // Fade-in mais longo e suave
  STROKE_ANIMATION_DURATION: 2000, // Mantido para compatibilidade
  // Configurações para degradê sutil
  GRADIENT_OPACITY: {
    TOP: 0.7, // Linhas no topo (valores altos) - mais sutil
    MIDDLE: 0.5, // Linhas no meio
    BOTTOM: 0.3 // Linhas na base (valores baixos)
  }
};

// Final Lines Drawing Animation Configuration
export const FINAL_LINES_ANIMATION = {
  DRAWING_DURATION: 4000, // 4 seconds total for final 3 lines
  DELAY_BETWEEN_LINES: 1200, // 1.2 seconds between each line start
  STROKE_ANIMATION_DURATION: 2000, // 2 seconds to draw each individual line (slower)
  ANIMATION_CURVE: 'ease-in-out' as const, // Mais suave
  OPACITY_FADE_DURATION: 600, // Fade-in mais suave
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
