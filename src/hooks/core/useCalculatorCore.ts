import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from '@/hooks';
import {
  calculateFullProjection,
  getVolatilityByProfile,
  type MonteCarloResult,
} from '@/lib/utils';
import { runCombinedMonteCarloSimulation } from '@/lib/gbm/combinedModel';
import type { CalculationResult, SharedPlanData } from '@/features/portfolio-planning/components/types';
import type { InvestorProfile } from '@/types/core/calculator';
import { DEFAULT_VALUES, STORAGE_KEYS } from '@/features/portfolio-planning/components/constants';
import { loadFromStorage, loadFromSharedPlan, saveToStorage } from '@/features/portfolio-planning/components/storageUtils';
import { getAccumulationAnnualReturn } from '@/features/portfolio-planning/components/insights/insightsCalculations';
import type { PlanningData } from '@/hooks';
// Importar função de projeção
import { calculateYearlyProjection } from '@/lib/calculations/financialCalculations';

// Import domain services
import { 
  financialCalculationService, 
  monteCarloSimulationService,
  planningDataRepository,
  Money 
} from '@/domain/services';

interface UseCalculatorCoreProps {
  crisisFrequency?: number;
  crisisMeanImpact?: number;
}

/**
 * Consolidated calculator core hook that manages all calculator state, handlers, and effects
 * Optimized for performance with proper memoization and debouncing
 */
export const useCalculatorCore = ({ 
  crisisFrequency = 0.1, 
  crisisMeanImpact = -0.15 
}: UseCalculatorCoreProps = {}) => {
  // Try to load from shared plan first
  const sharedPlanData = loadFromSharedPlan();
  
  // Cleanup tracking
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getValueOrDefault = useCallback(<T extends string | number | InvestorProfile>(
    key: keyof SharedPlanData,
    defaultValue: T
  ): T => {
    // First priority: shared data from URL
    if (sharedPlanData) {
      const sharedValue = sharedPlanData[key];
      if (sharedValue !== undefined && sharedValue !== null) {
        return sharedValue as T;
      }
    }
    // Second priority: local storage
    return loadFromStorage(key, defaultValue);
  }, [sharedPlanData]);

  // Core state - optimized initialization
  const [state, setState] = useState(() => ({
    // Financial inputs
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
    isCalculating: false,
    
    // Crisis parameters
    crisisFrequency,
    crisisMeanImpact,
  }));

  // Debounced values for performance optimization
  const debouncedInitialAmount = useDebounce(state.initialAmount, 300);
  const debouncedMonthlyAmount = useDebounce(state.monthlyAmount, 300);
  const debouncedRetirementIncome = useDebounce(state.retirementIncome, 300);
  const debouncedPortfolioReturn = useDebounce(state.portfolioReturn, 300);

  // Derived values - properly memoized
  const derivedValues = useMemo(() => ({
    accumulationYears: state.retirementAge - state.currentAge,
    retirementYears: state.lifeExpectancy - state.retirementAge,
    accumulationAnnualReturn: getAccumulationAnnualReturn(state.investorProfile),
    retirementAnnualReturn: state.portfolioReturn / 100,
  }), [state.retirementAge, state.currentAge, state.lifeExpectancy, state.investorProfile, state.portfolioReturn]);

  // Cleanup utility
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Optimized state update helper
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Monte Carlo state reset helper
  const resetMonteCarloState = useCallback(() => {
    // CORREÇÃO: Garantir que todos os estados relacionados sejam limpos
    updateState({
      isMonteCarloEnabled: false,
      isCalculating: false,
      monteCarloResult: null,
    });
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, false);
    
    // Abort any ongoing calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [updateState]);

  // Optimized handlers with proper memoization
  const handlers = {
    // Monte Carlo toggle
    handleMonteCarloToggle: useCallback((enabled: boolean) => {
  
      
      updateState({ isMonteCarloEnabled: enabled });
      saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);

      if (!enabled) {
        // CORREÇÃO: Garantir que todos os estados sejam limpos quando desabilitar
        updateState({ 
          isCalculating: false, 
          monteCarloResult: null 
        });
        
        // Abort any ongoing calculation
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      } else {
        // CORREÇÃO: Garantir que o estado seja configurado corretamente quando habilitar
        updateState({ isCalculating: true });
      }
    }, [state.isMonteCarloEnabled, updateState]),

    // Input handlers with validation and storage
    handleInitialAmountBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ initialAmount: finalValue });
      saveToStorage(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
      resetMonteCarloState();
    }, [updateState, resetMonteCarloState]),

    handleMonthlyAmountBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ monthlyAmount: finalValue });
      saveToStorage(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
      resetMonteCarloState();
    }, [updateState, resetMonteCarloState]),

    handleCurrentAgeBlur: useCallback((value: string) => {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        const updates: Partial<typeof state> = { currentAge: numericValue };
        
        // Auto-adjust retirement age if needed
        if (state.retirementAge <= numericValue) {
          const newRetirementAge = numericValue + 1;
          updates.retirementAge = newRetirementAge;
          saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, newRetirementAge);
        }
        
        updateState(updates);
        saveToStorage(STORAGE_KEYS.CURRENT_AGE, numericValue);
        resetMonteCarloState();
      }
    }, [state.retirementAge, updateState, resetMonteCarloState]),

    handleRetirementAgeBlur: useCallback((value: string) => {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue > state.currentAge) {
        updateState({ retirementAge: numericValue });
        saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
        resetMonteCarloState();
      }
    }, [state.currentAge, updateState, resetMonteCarloState]),

    handleLifeExpectancyChange: useCallback((value: number) => {
      updateState({ lifeExpectancy: value });
      saveToStorage(STORAGE_KEYS.LIFE_EXPECTANCY, value);
      resetMonteCarloState();
    }, [updateState, resetMonteCarloState]),

    handleRetirementIncomeBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value.replace(/\D/g, ''));
      const finalValue = isNaN(numericValue) ? 0 : numericValue;
      updateState({ retirementIncome: finalValue });
      saveToStorage(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
      resetMonteCarloState();
    }, [updateState, resetMonteCarloState]),

    handlePortfolioReturnBlur: useCallback((value: string) => {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        updateState({ portfolioReturn: numericValue });
        saveToStorage(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
        resetMonteCarloState();
      }
    }, [updateState, resetMonteCarloState]),

    handleInvestorProfileChange: useCallback((profile: InvestorProfile) => {
      updateState({ investorProfile: profile });
      saveToStorage(STORAGE_KEYS.INVESTOR_PROFILE, profile);
      resetMonteCarloState();
    }, [updateState, resetMonteCarloState]),

    finishCalculation: useCallback(() => {
      updateState({ isCalculating: false });
    }, [updateState]),

    // Crisis parameter handlers
    setCrisisFrequency: useCallback((frequency: number) => {
      updateState({ crisisFrequency: frequency });
    }, [updateState]),

    setCrisisMeanImpact: useCallback((impact: number) => {
      updateState({ crisisMeanImpact: impact });
    }, [updateState]),
  };

  // Optimized calculation function with domain service integration
  const calculateProjection = useCallback(async () => {
    // Abort any previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // CORREÇÃO: Garantir que o estado seja configurado corretamente no início do cálculo
    if (state.isMonteCarloEnabled && state.isCalculating) {
      updateState({ monteCarloResult: null });
    }

    try {
      // Create Money objects for domain service
      const initialAmount = Money.fromNumber(debouncedInitialAmount);
      const monthlyContribution = Money.fromNumber(debouncedMonthlyAmount);
      const desiredRetirementIncome = Money.fromNumber(debouncedRetirementIncome);

      // Use Financial Calculation Service for deterministic calculations
      const compoundGrowthResult = financialCalculationService.calculateCompoundGrowth({
        initialAmount,
        monthlyContribution,
        annualReturnRate: derivedValues.accumulationAnnualReturn,
        timeHorizonYears: derivedValues.accumulationYears,
        inflationRate: 0.04
      });

      // Calculate retirement planning metrics
      const retirementResult = financialCalculationService.calculateRetirementPlanning({
        currentAge: state.currentAge,
        targetRetirementAge: state.retirementAge,
        lifeExpectancy: state.lifeExpectancy,
        desiredMonthlyIncome: desiredRetirementIncome,
        initialAmount,
        monthlyContribution,
        investorProfile: state.investorProfile
      });

      // --- CORREÇÃO: gerar array completo até expectativa de vida ---
      // Fase de acumulação
      const accumulationArray = calculateYearlyProjection(
        initialAmount.value,
        monthlyContribution.value,
        derivedValues.accumulationAnnualReturn,
        derivedValues.accumulationYears
      );
      // Fase de aposentadoria (wealth depletion)
      const retirementYears = state.lifeExpectancy - state.retirementAge;
      let retirementArray: number[] = [];
      if (retirementYears > 0) {
        const initialRetirementBalance = accumulationArray[accumulationArray.length - 1];
        // Wealth depletion: saque mensal fixo, rendimento anual
        const monthlyReturn = Math.pow(1 + derivedValues.retirementAnnualReturn, 1 / 12) - 1;
        let balance = initialRetirementBalance;
        retirementArray = [balance];
        for (let year = 1; year <= retirementYears; year++) {
          for (let month = 1; month <= 12; month++) {
            balance -= desiredRetirementIncome.value;
            balance *= 1 + monthlyReturn;
            balance = Math.max(0, balance);
          }
          retirementArray.push(balance);
        }
        // Remove o primeiro elemento para não duplicar o saldo inicial
        retirementArray = retirementArray.slice(1);
      }
      // Array final: acumulação + aposentadoria
      const fullProjection = [...accumulationArray, ...retirementArray];
      // LOG DE DEBUG
  

      // Update state with domain service results
      updateState({
        calculationResult: {
          finalAmount: compoundGrowthResult.finalAmount.value,
          yearlyValues: fullProjection,
          monthlyIncome: retirementResult.sustainableMonthlyIncome.value,
        }
      });

      // Auto-save current session data
      await planningDataRepository.saveCurrentSession({
        personalInfo: {
          currentAge: state.currentAge,
          targetRetirementAge: state.retirementAge,
          lifeExpectancy: state.lifeExpectancy,
          investorProfile: state.investorProfile
        },
        financialInfo: {
          initialAmount,
          monthlyContribution,
          targetRetirementIncome: desiredRetirementIncome
        },
        preferences: {
          riskTolerance: 'medium',
          prioritizeGrowth: true,
          considerInflation: true,
          inflationRate: 0.04
        },
        calculationResults: {
          lastCalculatedAt: new Date(),
          projectedWealth: compoundGrowthResult.finalAmount,
          sustainableIncome: retirementResult.sustainableMonthlyIncome,
          successProbability: retirementResult.isRetirementViable ? 0.8 : 0.4
        }
      });

      // Only run Monte Carlo if explicitly enabled and calculating
      if (state.isMonteCarloEnabled && state.isCalculating) {
        // Use requestIdleCallback for better performance
        const scheduleWork = (callback: () => void) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
          } else {
            setTimeout(callback, 0);
          }
        };

        scheduleWork(async () => {
          try {
            if (abortControllerRef.current?.signal.aborted) return;

            // Use Monte Carlo Simulation Service for risk analysis
            // Calculate total life horizon (from current age to life expectancy)
            const totalLifeHorizonYears = state.lifeExpectancy - state.currentAge;
            
            const portfolioSimulationResult = await monteCarloSimulationService.runPortfolioSimulation({
              initialAmount,
              monthlyContribution,
              investorProfile: state.investorProfile,
              timeHorizonYears: totalLifeHorizonYears,
              numberOfSimulations: 1001,
              targetAmount: Money.fromNumber(retirementResult.requiredWealthAtRetirement.value),
              includeAllPaths: true,
              retirementMonthlyIncome: desiredRetirementIncome,
              retirementAnnualReturn: derivedValues.retirementAnnualReturn
            });

            if (abortControllerRef.current?.signal.aborted) return;

            // Convert domain service results to legacy format for compatibility
            const convertedResults = {
              scenarios: {
                pessimistic: portfolioSimulationResult.scenarios.pessimistic.map(m => m.value),
                median: portfolioSimulationResult.scenarios.median.map(m => m.value),
                optimistic: portfolioSimulationResult.scenarios.optimistic.map(m => m.value)
              },
              statistics: {
                percentile5: portfolioSimulationResult.statistics.percentile5.map(m => m.value),
                percentile25: portfolioSimulationResult.statistics.percentile25.map(m => m.value),
                percentile50: portfolioSimulationResult.statistics.percentile50.map(m => m.value),
                percentile75: portfolioSimulationResult.statistics.percentile75.map(m => m.value),
                percentile95: portfolioSimulationResult.statistics.percentile95.map(m => m.value),
                successProbability: portfolioSimulationResult.statistics.successProbability,
                standardDeviation: portfolioSimulationResult.statistics.standardDeviation.map(m => m.value),
                averageReturn: portfolioSimulationResult.statistics.averageReturn,
                volatilityRealized: portfolioSimulationResult.statistics.volatilityRealized,
              },
              allPaths: portfolioSimulationResult.allPaths?.map(path => path.map(m => m.value)),
            };

    
            updateState({
              monteCarloResult: convertedResults,
              isCalculating: false,
            });
          } catch (_error) {
            // CORREÇÃO: Garantir que o estado seja limpo em caso de erro ou abort
            if (abortControllerRef.current?.signal.aborted) {
              updateState({
                isCalculating: false,
                monteCarloResult: null,
              });
            } else {
              updateState({
                isCalculating: false,
                monteCarloResult: null,
              });
            }
          }
        });
      } else {
        if (!state.isMonteCarloEnabled) {
          updateState({ monteCarloResult: null });
        }
      }
    } catch (_error) {
      updateState({
        isCalculating: false,
        calculationResult: null,
        monteCarloResult: null,
      });
    }
  }, [
    state.isMonteCarloEnabled,
    state.isCalculating,
    state.investorProfile,
    state.lifeExpectancy,
    state.currentAge,
    state.crisisFrequency,
    state.crisisMeanImpact,
    derivedValues.accumulationYears,
    derivedValues.accumulationAnnualReturn,
    debouncedInitialAmount,
    debouncedMonthlyAmount,
    debouncedRetirementIncome,
    debouncedPortfolioReturn,
    updateState,
  ]);

  // Effect to handle calculations - optimized with debounced values
  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);

  // Effect to clear URL after loading shared plan
  useEffect(() => {
    if (sharedPlanData) {
      const url = new URL(window.location.href);
      
      // Only remove 'plan' parameter if it exists (legacy system)
      if (url.searchParams.has('plan')) {
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [sharedPlanData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Return optimized interface
  return {
    // State
    ...state,
    sharedPlanData,
    
    // Derived values
    accumulationYears: derivedValues.accumulationYears,
    retirementYears: derivedValues.retirementYears,
    accumulationAnnualReturn: derivedValues.accumulationAnnualReturn,
    retirementAnnualReturn: derivedValues.retirementAnnualReturn,
    
    // Handlers
    ...handlers,
    
    // Utilities
    calculateProjection,
    clearAllTimeouts,
  };
};