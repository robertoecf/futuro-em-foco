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

// Function to load data from a shared plan - SISTEMA DINÂMICO
import type { PlanningData } from '@/hooks/usePlanningData';

export const loadFromSharedPlan = (): PlanningData['planningInputs'] | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  

  
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
  
  // Sistema novo: mapeamento dinâmico de parâmetros de URL
  const keyMapping: Record<string, keyof PlanningData['planningInputs']> = {
    'ia': 'initialAmount',
    'ma': 'monthlyAmount',
    'ca': 'currentAge',
    'ra': 'retirementAge',
    'le': 'lifeExpectancy',
    'ri': 'retirementIncome',
    'pr': 'portfolioReturn',
    'ip': 'investorProfile'
  };
  
  // Valores padrão para cada propriedade (fallback caso não esteja na URL)
  const defaultValues: PlanningData['planningInputs'] = {
    initialAmount: 0,
    monthlyAmount: 0,
    currentAge: 30,
    retirementAge: 65,
    lifeExpectancy: 85,
    retirementIncome: 0,
    portfolioReturn: 4,
    investorProfile: 'moderado'
  };
  
  // Detecta quais parâmetros existem na URL
  const foundParams: string[] = [];
  const planningInputs = { ...defaultValues };
  
  // Processa cada parâmetro mapeado
  Object.entries(keyMapping).forEach(([urlKey, propertyKey]) => {
    const urlValue = urlParams.get(urlKey);
    if (urlValue !== null) {
      foundParams.push(urlKey);
      
      // Conversão automática baseada no tipo da propriedade
      if (propertyKey === 'investorProfile') {
        planningInputs[propertyKey] = urlValue as 'conservador' | 'moderado' | 'arrojado';
      } else if (['currentAge', 'retirementAge', 'lifeExpectancy'].includes(propertyKey)) {
        planningInputs[propertyKey] = parseInt(urlValue) as any;
      } else {
        planningInputs[propertyKey] = parseFloat(urlValue) as any;
      }
    }
  });
  
     // Também processa parâmetros não mapeados (para futuras propriedades)
   Array.from(urlParams.keys()).forEach(urlKey => {
     if (!keyMapping[urlKey] && urlKey !== 'plan') {
       foundParams.push(urlKey);
       // Para futuras propriedades, tentará definir diretamente se a propriedade existir
       if (urlKey in planningInputs) {
         const value = urlParams.get(urlKey)!;
         (planningInputs as any)[urlKey] = isNaN(Number(value)) ? value : Number(value);
       }
     }
   });
  
     // Se encontrou parâmetros, usa o sistema novo
   if (foundParams.length > 0) {
     return planningInputs;
   }
  
  return null;
};

// Async cleanup of expired data
export const cleanupExpiredData = async () => {
  await optimizedStorage.cleanup();
};
