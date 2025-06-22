import { useState, useCallback, useEffect } from 'react';
import { calculateFullProjection, type MonteCarloResult } from '@/lib/utils';
import { runUltraOptimizedMonteCarloSimulation } from '@/lib/gbm/ultraOptimizedSimulation';
import { useDebounce } from '@/hooks/useDebounce';
// PlanningData type removed as it's not used directly in this file
import type { InvestorProfile, CalculationResult } from '../types';
import { DEFAULT_VALUES, STORAGE_KEYS } from '../utils/constants';
import { loadFromStorage, loadFromSharedPlan, saveToStorage } from '../utils/storageUtils';
import { getAccumulationAnnualReturn, getVolatilityByProfile } from '@/lib/calculations/financialCalculations';

export { type InvestorProfile, type CalculationResult } from '../types';

/**
 * 🎯 FASE 4 ITEM 8: Hook principal da calculadora de aposentadoria
 * 
 * Hook consolidado que gerencia todo o estado e lógica da calculadora de planejamento
 * para aposentadoria. Oferece funcionalidades completas incluindo:
 * 
 * ## Funcionalidades:
 * - ✅ Gerenciamento de estado otimizado com batch updates
 * - ✅ Cálculos determinísticos e simulações Monte Carlo
 * - ✅ Persistência automática no localStorage
 * - ✅ Debounce para evitar recálculos excessivos
 * - ✅ Validação de inputs e edge cases
 * - ✅ Integração com simulações GBM otimizadas
 * 
 * ## Estado Gerenciado:
 * - Parâmetros de entrada (valores, idades, perfil)
 * - Resultados de cálculos determinísticos
 * - Resultados de simulações Monte Carlo
 * - Estados de loading e controle de interface
 * 
 * @returns Objeto com estado completo e handlers da calculadora
 * 
 * @example
 * ```typescript
 * const {
 *   initialAmount,
 *   monthlyAmount,
 *   calculationResult,
 *   handleInitialAmountBlur,
 *   handleMonteCarloToggle
 * } = useCalculator();
 * ```
 */
// 🎯 FASE 2 ITEM 4: Hook consolidado e otimizado
export const useCalculator = () => {
  // ==================== STATE MANAGEMENT ====================
  
  // Try to load from shared plan first
  const sharedPlanData = loadFromSharedPlan();
  const shouldUseNewDefaults = true; // Force new defaults for migration

  const getValueOrDefault = useCallback(<T>(key: string, defaultValue: T): T => {
    if (shouldUseNewDefaults) return defaultValue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sharedPlanData ? (sharedPlanData as any)[key] || defaultValue : loadFromStorage(key, defaultValue);
  }, [sharedPlanData, shouldUseNewDefaults]);

  // 🎯 CONSOLIDAÇÃO: All state in one place with optimized initialization
  const [state, setState] = useState(() => ({
    // Form inputs
    initialAmount: getValueOrDefault('initialAmount', DEFAULT_VALUES.INITIAL_AMOUNT),
    monthlyAmount: getValueOrDefault('monthlyAmount', DEFAULT_VALUES.MONTHLY_AMOUNT),
    currentAge: getValueOrDefault('currentAge', DEFAULT_VALUES.CURRENT_AGE),
    retirementAge: getValueOrDefault('retirementAge', DEFAULT_VALUES.RETIREMENT_AGE),
    lifeExpectancy: getValueOrDefault('lifeExpectancy', DEFAULT_VALUES.LIFE_EXPECTANCY),
    retirementIncome: getValueOrDefault('retirementIncome', DEFAULT_VALUES.RETIREMENT_INCOME),
    portfolioReturn: getValueOrDefault('portfolioReturn', DEFAULT_VALUES.PORTFOLIO_RETURN),
    investorProfile: getValueOrDefault('investorProfile', DEFAULT_VALUES.INVESTOR_PROFILE) as InvestorProfile,
    
    // Calculation results
    calculationResult: null as CalculationResult | null,
    
    // Monte Carlo states
    isMonteCarloEnabled: false,
    monteCarloResult: null as MonteCarloResult | null,
    isCalculating: false
  }));

  // Derived values with memoization
  const accumulationYears = state.retirementAge - state.currentAge;

  // 🎯 OTIMIZAÇÃO: Debounced values to prevent excessive recalculations
  const debouncedInitialAmount = useDebounce(state.initialAmount, 300);
  const debouncedMonthlyAmount = useDebounce(state.monthlyAmount, 300);
  const debouncedRetirementIncome = useDebounce(state.retirementIncome, 300);
  const debouncedPortfolioReturn = useDebounce(state.portfolioReturn, 300);

  // ==================== UTILITY FUNCTIONS ====================

  // 🎯 OTIMIZAÇÃO: Batch state updates to reduce re-renders
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // 🎯 CONSOLIDAÇÃO: Unified storage and Monte Carlo reset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveValueAndResetMonteCarlo = useCallback((key: string, value: any) => {
    saveToStorage(key, value);
    updateState({
      isMonteCarloEnabled: false,
      isCalculating: false,
      monteCarloResult: null
    });
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, false);
  }, [updateState]);

  // ==================== CALCULATION LOGIC ====================

  // Calculate possible retirement age based on desired income
  const calculatePossibleRetirementAge = useCallback(() => {
    if (debouncedRetirementIncome <= 0) return state.retirementAge;
    
    const requiredWealth = (debouncedRetirementIncome * 12) / (debouncedPortfolioReturn / 100);
    const accumulationAnnualReturn = getAccumulationAnnualReturn(state.investorProfile);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    
    let balance = debouncedInitialAmount;
    let years = 0;
    const maxYears = 50;
    
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += debouncedMonthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      years++;
    }
    
    return state.currentAge + years;
  }, [
    debouncedRetirementIncome, 
    debouncedPortfolioReturn, 
    state.investorProfile, 
    debouncedInitialAmount, 
    debouncedMonthlyAmount, 
    state.currentAge, 
    state.retirementAge
  ]);

  // 🎯 CONSOLIDAÇÃO: Main calculation logic with Monte Carlo
  const calculateProjection = useCallback(async () => {
    const accumulationAnnualReturn = getAccumulationAnnualReturn(state.investorProfile);
    const retirementAnnualReturn = debouncedPortfolioReturn / 100;
    const monthlyIncomeRate = 0.004;
    
    // Always calculate deterministic projection first
    const result = calculateFullProjection(
      debouncedInitialAmount,
      debouncedMonthlyAmount,
      accumulationYears,
      state.lifeExpectancy - state.currentAge,
      accumulationAnnualReturn,
      monthlyIncomeRate,
      debouncedRetirementIncome,
      retirementAnnualReturn
    );
    
    updateState({
      calculationResult: {
        finalAmount: result.retirementAmount,
        yearlyValues: result.yearlyValues,
        monthlyIncome: result.monthlyIncome
      }
    });

    // Only run Monte Carlo if explicitly calculating (triggered by user click)
    if (state.isMonteCarloEnabled && state.isCalculating) {
      // Use requestIdleCallback if available, otherwise setTimeout
      const scheduleWork = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback);
        } else {
          setTimeout(callback, 0);
        }
      };
      
      scheduleWork(async () => {
        try {
          const volatility = getVolatilityByProfile(state.investorProfile);
          
          // Use ultra-optimized version for 1001 simulations
          const gbmResults = await runUltraOptimizedMonteCarloSimulation(
            debouncedInitialAmount,
            debouncedMonthlyAmount,
            accumulationYears,
            state.lifeExpectancy - state.currentAge,
            accumulationAnnualReturn,
            volatility,
            monthlyIncomeRate,
            debouncedRetirementIncome,
            retirementAnnualReturn,
            1001 // 1001 simulations for the magic moment
          );
          
          const convertedResults = {
            scenarios: gbmResults.scenarios,
            statistics: gbmResults.statistics
          };
          
          console.log('✅ MONTE CARLO FINALIZADO - dados prontos para animação');
          updateState({
            monteCarloResult: convertedResults,
            isCalculating: false
          });
          
        } catch (error) {
          console.error('❌ Monte Carlo calculation failed:', error);
          updateState({
            isCalculating: false,
            monteCarloResult: null
          });
        }
      });
      
    } else {
      // Monte Carlo not active
      if (!state.isMonteCarloEnabled) {
        updateState({ monteCarloResult: null });
      }
    }
  }, [
    state.isMonteCarloEnabled,
    state.isCalculating,
    state.investorProfile,
    state.lifeExpectancy,
    state.currentAge,
    accumulationYears,
    debouncedInitialAmount,
    debouncedMonthlyAmount,
    debouncedRetirementIncome,
    debouncedPortfolioReturn,
    updateState
  ]);

  // ==================== EVENT HANDLERS ====================

  // 🎯 CONSOLIDAÇÃO: All handlers in one place with optimized callbacks
  const handlers = {
    finishCalculation: useCallback(() => {
      updateState({ isCalculating: false });
    }, [updateState]),

    handleMonteCarloToggle: useCallback((enabled: boolean) => {
      console.log('🎬 BOTÃO CALCULAR CLICADO:', { enabled, wasEnabled: !enabled });
      
      updateState({ isMonteCarloEnabled: enabled });
      saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);
      
      if (!enabled) {
        console.log('🔄 DESATIVANDO Monte Carlo');
        updateState({
          isCalculating: false,
          monteCarloResult: null
        });
      } else {
        // When enabling (clicking "Calcular"), start the calculation immediately
        updateState({ isCalculating: true });
      }
    }, [updateState]),

    handleInitialAmountBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ initialAmount: finalValue });
      saveValueAndResetMonteCarlo(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
    }, [updateState, saveValueAndResetMonteCarlo]),

    handleMonthlyAmountBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ monthlyAmount: finalValue });
      saveValueAndResetMonteCarlo(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
    }, [updateState, saveValueAndResetMonteCarlo]),

    handleCurrentAgeBlur: useCallback((value: string) => {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue > 0) {
                 const updates: Record<string, number> = { currentAge: numericValue };
        
        if (state.retirementAge <= numericValue) {
          const newRetirementAge = numericValue + 1;
          updates.retirementAge = newRetirementAge;
          saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, newRetirementAge);
        }
        
        updateState(updates);
        saveValueAndResetMonteCarlo(STORAGE_KEYS.CURRENT_AGE, numericValue);
      }
    }, [state.retirementAge, updateState, saveValueAndResetMonteCarlo]),

    handleRetirementAgeBlur: useCallback((value: string) => {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue > state.currentAge) {
        updateState({ retirementAge: numericValue });
        saveValueAndResetMonteCarlo(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
      }
    }, [state.currentAge, updateState, saveValueAndResetMonteCarlo]),
    
    handleLifeExpectancyChange: useCallback((value: number) => {
      updateState({ lifeExpectancy: value });
      saveValueAndResetMonteCarlo(STORAGE_KEYS.LIFE_EXPECTANCY, value);
    }, [updateState, saveValueAndResetMonteCarlo]),
    
    handleRetirementIncomeBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ retirementIncome: finalValue });
      saveValueAndResetMonteCarlo(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
    }, [updateState, saveValueAndResetMonteCarlo]),

    handlePortfolioReturnBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        updateState({ portfolioReturn: numericValue });
        saveValueAndResetMonteCarlo(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
      }
    }, [updateState, saveValueAndResetMonteCarlo]),

    handleInvestorProfileChange: useCallback((profile: InvestorProfile) => {
      updateState({ investorProfile: profile });
      saveValueAndResetMonteCarlo(STORAGE_KEYS.INVESTOR_PROFILE, profile);
    }, [updateState, saveValueAndResetMonteCarlo])
  };

  // ==================== EFFECTS ====================

  // Calculate on input changes - using debounced values
  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);

  // Clear URL after loading shared plan
  useEffect(() => {
    if (sharedPlanData) {
      const url = new URL(window.location.href);
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.toString());
    }
  }, [sharedPlanData]);

  // ==================== RETURN API ====================

  const possibleRetirementAge = calculatePossibleRetirementAge();

  // 🎯 FASE 2 ITEM 4 CONCLUÍDO: Simplified, consolidated API
  return {
    // State values  
    ...state,
    possibleRetirementAge,
    accumulationYears,
    sharedPlanData,
    
    // Handlers
    ...handlers,
    
    // Legacy alias for compatibility
    setInvestorProfile: handlers.handleInvestorProfileChange,
    
    // Utility functions
    calculateProjection
  };
};
