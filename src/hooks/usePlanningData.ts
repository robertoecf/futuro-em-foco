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

  const sendPlanByEmail = async (userData: PlanningData['userData'], _planUrl: string): Promise<void> => {
    const _validatedUserData = validateUserData(userData);
    
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



  return {
    savePlanningData,
    loadPlanningData,
    getPlanningUrl,
    sendPlanByEmail,
    clearUserData
  };
};
