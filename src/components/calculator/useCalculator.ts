import { useCalculatorState } from './useCalculatorState';
import { useCalculatorHandlers } from './useCalculatorHandlers';
import { useCalculatorEffects } from './useCalculatorEffects';
import { useState } from 'react';

export { type InvestorProfile, type CalculationResult } from './types';

export const useCalculator = () => {
  const state = useCalculatorState();
  const handlers = useCalculatorHandlers(state);
  
  // New crisis parameter states
  const [crisisFrequency, setCrisisFrequency] = useState(0.1); // Default: 1 crisis every 10 years
  const [crisisMeanImpact, setCrisisMeanImpact] = useState(-0.15); // Default: -15% impact
  
  const accumulationYears = state.retirementAge - state.currentAge;
  
  const validRetirementAge = state.retirementAge || (state.currentAge + accumulationYears);

  // Use effects with crisis parameters
  useCalculatorEffects({
    ...state,
    ...handlers,
    accumulationYears,
    crisisFrequency,
    crisisMeanImpact,
  });

  return {
    ...state,
    ...handlers,
    accumulationYears,
    possibleRetirementAge: validRetirementAge,
    crisisFrequency,
    setCrisisFrequency,
    crisisMeanImpact,
    setCrisisMeanImpact,
  };
};
