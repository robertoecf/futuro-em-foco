
import { secureStorage } from '@/lib/secureStorage';

// Function to load data from secure storage
export const loadFromStorage = (key: string, defaultValue: any) => {
  return secureStorage.get(key, defaultValue);
};

// Function to save to secure storage
export const saveToStorage = (key: string, value: any) => {
  secureStorage.set(key, value);
};

// Function to load data from a shared plan
export const loadFromSharedPlan = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  if (planId) {
    try {
      const planData = secureStorage.get(`planning_${planId}`);
      if (planData) {
        return planData.planningInputs;
      }
    } catch (error) {
      console.error('Error loading shared plan:', error);
    }
  }
  return null;
};

// Cleanup expired data on app start
export const cleanupExpiredData = () => {
  secureStorage.cleanup();
};
