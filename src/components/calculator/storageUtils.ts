
import { optimizedStorage } from '@/lib/optimizedStorage';

// Function to load data from optimized storage
export const loadFromStorage = <T>(key: string, defaultValue: T): T | null => {
  return optimizedStorage.get(key, defaultValue);
};

// Function to save to optimized storage with batching
export const saveToStorage = <T>(key: string, value: T): void => {
  optimizedStorage.set(key, value);
};

// Function to load data from a shared plan
import type { PlanningData } from '@/hooks/usePlanningData';

export const loadFromSharedPlan = (): PlanningData['planningInputs'] | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  if (planId) {
    try {
      const planData = optimizedStorage.get<PlanningData>(`planning_${planId}`);
      if (planData) {
        return planData.planningInputs;
      }
    } catch (error) {
      console.error('Error loading shared plan:', error);
    }
  }
  return null;
};

// Async cleanup of expired data
export const cleanupExpiredData = async () => {
  await optimizedStorage.cleanup();
};
