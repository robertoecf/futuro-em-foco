
import { useEffect } from 'react';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';

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
  const generatePlanId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const savePlanningData = (
    userData: PlanningData['userData'],
    planningInputs: PlanningData['planningInputs'],
    calculationResult: CalculationResult | null
  ): string => {
    const planId = generatePlanId();
    const planningData: PlanningData = {
      id: planId,
      timestamp: new Date().toISOString(),
      userData,
      planningInputs,
      calculationResult
    };

    try {
      localStorage.setItem(`planning_${planId}`, JSON.stringify(planningData));
      console.log('Planning data saved:', planningData);
      return planId;
    } catch (error) {
      console.error('Error saving planning data:', error);
      throw new Error('Erro ao salvar dados do planejamento');
    }
  };

  const loadPlanningData = (planId: string): PlanningData | null => {
    try {
      const data = localStorage.getItem(`planning_${planId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading planning data:', error);
      return null;
    }
  };

  const getPlanningUrl = (planId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?plan=${planId}`;
  };

  const sendPlanByEmail = async (userData: PlanningData['userData'], planUrl: string): Promise<void> => {
    // Simulação do envio de email
    console.log('Sending email to:', userData.email);
    console.log('Plan URL:', planUrl);
    console.log('User data:', userData);
    
    // Aqui seria integrado com um serviço real de email
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Email sent successfully (simulated)');
        resolve();
      }, 1000);
    });
  };

  return {
    savePlanningData,
    loadPlanningData,
    getPlanningUrl,
    sendPlanByEmail
  };
};
