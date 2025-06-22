// ==================== CONSTANTES DE CÁLCULO ====================

// Retornos por perfil de investidor (%)
export const ANNUAL_RETURNS = {
  CONSERVADOR: 0.04,  // 4% a.a.
  MODERADO: 0.055,    // 5.5% a.a.
  ARROJADO: 0.065,    // 6.5% a.a.
  DEFAULT: 0.055      // Default moderado
} as const;

// Volatilidade por perfil de investidor (%)
export const VOLATILITY = {
  CONSERVADOR: 0.10,  // 10%
  MODERADO: 0.15,     // 15%
  ARROJADO: 0.20,     // 20%
  DEFAULT: 0.15       // Default moderado
} as const;

// Constantes de cálculo
export const CALCULATION_CONSTANTS = {
  // Taxa de renda mensal padrão (0.4% am = 4.8% aa)
  MONTHLY_INCOME_RATE: 0.004,
  
  // Máximo de anos para simulação
  MAX_SIMULATION_YEARS: 50,
  
  // Tolerância para cálculos iterativos
  NUMERICAL_TOLERANCE: 1,
  
  // Máximo de iterações para convergência
  MAX_ITERATIONS: 100,
  
  // Retorno padrão para aposentadoria
  DEFAULT_RETIREMENT_RETURN: 0.04  // 4% a.a.
} as const;

// Simulação Monte Carlo
export const MONTE_CARLO = {
  // Número de simulações padrão
  DEFAULT_SIMULATIONS: 500,
  
  // Número de simulações para "magic moment"
  MAGIC_MOMENT_SIMULATIONS: 1001,
  
  // Percentis para análise
  PERCENTILES: {
    P5: 0.05,
    P25: 0.25,
    P50: 0.50,
    P75: 0.75,
    P95: 0.95
  }
} as const; 