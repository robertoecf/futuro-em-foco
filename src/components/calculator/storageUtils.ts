
import { optimizedStorage } from '@/lib/optimizedStorage';

// Function to load data from optimized storage
export const loadFromStorage = (key: string, defaultValue: any) => {
  return optimizedStorage.get(key, defaultValue);
};

// Function to save to optimized storage with batching
export const saveToStorage = (key: string, value: any) => {
  optimizedStorage.set(key, value);
};

// Function to load data from a shared plan
export const loadFromSharedPlan = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  if (planId) {
    try {
      const planData = optimizedStorage.get(`planning_${planId}`);
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
