import { optimizedStorage } from '@/lib/optimizedStorage';
import { SharedPlanData, InvestorProfile } from './types';

// Function to load data from optimized storage
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const value = optimizedStorage.get<T>(key, defaultValue);
  return value ?? defaultValue;
};

// Function to save to optimized storage with batching
export const saveToStorage = <T>(key: string, value: T): void => {
  optimizedStorage.set(key, value);
};

// Function to load data from a shared plan - SISTEMA DINÂMICO
import type { PlanningData as _PlanningData } from '@/hooks/usePlanningData';

const keyMapping: Record<string, keyof SharedPlanData> = {
  ia: 'initialAmount',
  ma: 'monthlyAmount',
  ca: 'currentAge',
  ra: 'retirementAge',
  le: 'lifeExpectancy',
  ri: 'retirementIncome',
  pr: 'portfolioReturn',
  ip: 'investorProfile',
};

// Função para comprimir dados em Base64
export const compressData = (data: SharedPlanData): string => {
  try {
    const json = JSON.stringify(data);
    return btoa(json);
  } catch {
    return '';
  }
};

// Função para descomprimir dados de Base64
export const decompressData = (compressed: string): SharedPlanData | null => {
  try {
    const json = atob(compressed);
    return JSON.parse(json) as SharedPlanData;
  } catch {
    return null;
  }
};

// Carrega dados de um plano compartilhado (se existir)
export const loadFromSharedPlan = (): SharedPlanData | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const planData = urlParams.get('plan');

  if (planData) {
    return decompressData(planData);
  }

  // Lógica para carregar de parâmetros individuais (novo sistema)
  const sharedData: Partial<SharedPlanData> = {};

  let hasIndividualParams = false;
  Object.entries(keyMapping).forEach(([shortKey, longKey]) => {
    const param = urlParams.get(shortKey);
    if (param) {
      hasIndividualParams = true;
      if (longKey === 'investorProfile') {
        sharedData[longKey] = param as InvestorProfile;
      } else {
        sharedData[longKey] = Number(param);
      }
    }
  });

  return hasIndividualParams ? (sharedData as SharedPlanData) : null;
};

// Async cleanup of expired data
export const cleanupExpiredData = async () => {
  await optimizedStorage.cleanup();
};
