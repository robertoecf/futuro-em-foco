
import { optimizedStorage } from '@/lib/optimizedStorage';

// Function to load data from optimized storage
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const value = optimizedStorage.get<T>(key, defaultValue);
  return value ?? defaultValue;
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
  
  console.log('🔍 Verificando URL para dados compartilhados:', window.location.search);
  
  // Primeiro, tenta carregar pelo plan ID (sistema antigo)
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
  
  // Novo sistema: carrega diretamente dos parâmetros de URL
  const directParams = {
    ia: urlParams.get('ia'), // initialAmount
    ma: urlParams.get('ma'), // monthlyAmount
    ca: urlParams.get('ca'), // currentAge
    ra: urlParams.get('ra'), // retirementAge
    le: urlParams.get('le'), // lifeExpectancy
    ri: urlParams.get('ri'), // retirementIncome
    pr: urlParams.get('pr'), // portfolioReturn
    ip: urlParams.get('ip'), // investorProfile
  };
  
  // Se algum parâmetro direto existe, usa o sistema novo
  if (Object.values(directParams).some(param => param !== null)) {
    console.log('📂 Parâmetros diretos encontrados:', directParams);
    try {
      const planningInputs = {
        initialAmount: directParams.ia ? parseFloat(directParams.ia) : 0,
        monthlyAmount: directParams.ma ? parseFloat(directParams.ma) : 0,
        currentAge: directParams.ca ? parseInt(directParams.ca) : 30,
        retirementAge: directParams.ra ? parseInt(directParams.ra) : 65,
        lifeExpectancy: directParams.le ? parseInt(directParams.le) : 85,
        retirementIncome: directParams.ri ? parseFloat(directParams.ri) : 0,
        portfolioReturn: directParams.pr ? parseFloat(directParams.pr) : 4,
        investorProfile: (directParams.ip as 'conservador' | 'moderado' | 'arrojado') || 'moderado'
      };
      
      console.log('📋 Dados carregados diretamente da URL:', planningInputs);
      return planningInputs;
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }
  
  return null;
};

// Async cleanup of expired data
export const cleanupExpiredData = async () => {
  await optimizedStorage.cleanup();
};
