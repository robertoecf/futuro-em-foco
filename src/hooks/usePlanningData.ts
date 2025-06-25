import { useEffect } from 'react';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { secureStorage } from '@/lib/secureStorage';
import { validateAndSanitize } from '@/lib/validation';

export interface PlanningData {
  id: string;
  timestamp: string;
  userData: {
    name: string;
    email: string;
    phone: string;
    wantsExpertEvaluation: boolean;
  };
  planningInputs: {
    initialAmount: number;
    monthlyAmount: number;
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    retirementIncome: number;
    portfolioReturn: number;
    investorProfile: InvestorProfile;
  };
  calculationResult: CalculationResult | null;
}

export const usePlanningData = () => {
  // Cleanup expired data on hook initialization
  useEffect(() => {
    secureStorage.cleanup();
  }, []);

  const generatePlanId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const validateUserData = (userData: PlanningData['userData']) => {
    const nameValidation = validateAndSanitize.sanitizeString(userData.name);
    const emailValidation = validateAndSanitize.email(userData.email);
    const phoneValidation = validateAndSanitize.phone(userData.phone);

    if (!nameValidation || nameValidation.length < 2) {
      throw new Error('Nome inválido');
    }

    if (!emailValidation.isValid) {
      throw new Error('Email inválido');
    }

    if (userData.phone && !phoneValidation.isValid) {
      throw new Error('Telefone inválido');
    }

    return {
      name: nameValidation,
      email: emailValidation.sanitized,
      phone: phoneValidation.sanitized,
      wantsExpertEvaluation: Boolean(userData.wantsExpertEvaluation)
    };
  };

  const savePlanningData = (
    userData: PlanningData['userData'],
    planningInputs: PlanningData['planningInputs'],
    calculationResult: CalculationResult | null
  ): string => {
    try {
      const validatedUserData = validateUserData(userData);
      const planId = generatePlanId();
      
      const planningData: PlanningData = {
        id: planId,
        timestamp: new Date().toISOString(),
        userData: validatedUserData,
        planningInputs,
        calculationResult
      };

      secureStorage.set(`planning_${planId}`, planningData, 7 * 24 * 60 * 60 * 1000); // 7 days expiry
      return planId;
    } catch (error) {
      console.error('Error saving planning data:', error);
      throw new Error('Erro ao salvar dados do planejamento: ' + (error as Error).message);
    }
  };

  const loadPlanningData = (planId: string): PlanningData | null => {
    try {
      return secureStorage.get(`planning_${planId}`);
    } catch (error) {
      console.error('Error loading planning data:', error);
      return null;
    }
  };

  const getPlanningUrl = (planId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?plan=${planId}`;
  };

  // Nova função para gerar URL com parâmetros diretos - SISTEMA DINÂMICO
  const generateDirectUrl = (planningInputs: PlanningData['planningInputs']): string => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    // Sistema automático: converte todas as propriedades de planningInputs para parâmetros de URL
    // Quando novas propriedades forem adicionadas ao tipo, elas serão automaticamente incluídas
    Object.entries(planningInputs).forEach(([key, value]) => {
      // Mapear nomes longos para abreviações para URLs mais limpos
      const keyMapping: Record<string, string> = {
        'initialAmount': 'ia',
        'monthlyAmount': 'ma', 
        'currentAge': 'ca',
        'retirementAge': 'ra',
        'lifeExpectancy': 'le',
        'retirementIncome': 'ri',
        'portfolioReturn': 'pr',
        'investorProfile': 'ip'
      };
      
      const urlKey = keyMapping[key] || key; // Se não tiver mapeamento, usa o nome original
      params.set(urlKey, value.toString());
    });
    
    const fullUrl = `${baseUrl}/?${params.toString()}`;
    return fullUrl;
  };

  const sendPlanByEmail = async (userData: PlanningData['userData'], _planUrl: string): Promise<void> => {
    validateUserData(userData);
    
    // Simulação do envio de email
    
    // Aqui seria integrado com um serviço real de email
    return new Promise((resolve) => {
      setTimeout(() => {
        // Email enviado com sucesso (simulado)
        resolve();
      }, 1000);
    });
  };

  const clearUserData = () => {
    secureStorage.clear();
  };

  // Função para copiar link direto
  const copyDirectLink = async (planningInputs: PlanningData['planningInputs']): Promise<boolean> => {
    try {
      const directUrl = generateDirectUrl(planningInputs);
      await navigator.clipboard.writeText(directUrl);
      return true;
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      return false;
    }
  };



  return {
    savePlanningData,
    loadPlanningData,
    getPlanningUrl,
    generateDirectUrl,
    copyDirectLink,
    sendPlanByEmail,
    clearUserData
  };
};

