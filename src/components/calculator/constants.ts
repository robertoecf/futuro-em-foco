
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
