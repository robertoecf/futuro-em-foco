
import type { InvestorProfile } from '../types';

export const getAccumulationAnnualReturn = (investorProfile: InvestorProfile) => {
  switch (investorProfile) {
    case 'conservador': return 0.04; // 4% a.a.
    case 'moderado': return 0.055; // 5.5% a.a.
    case 'arrojado': return 0.065; // 6.5% a.a.
    default: return 0.055;
  }
};

export const calculateAccumulatedWealth = (
  initialAmount: number,
  monthlyAmount: number,
  accumulationYears: number,
  accumulationAnnualReturn: number
) => {
  const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
  const months = accumulationYears * 12;
  
  let balance = initialAmount;
  for (let i = 0; i < months; i++) {
    balance += monthlyAmount;
    balance *= (1 + monthlyReturn);
  }
  return balance;
};

export const calculateRequiredWealthSustainable = (
  retirementIncome: number,
  portfolioReturn: number
) => {
  if (retirementIncome <= 0) return 0;
  return (retirementIncome * 12) / (portfolioReturn / 100);
};

export const calculateRequiredWealthDepleting = (
  retirementIncome: number,
  retirementYears: number,
  retirementAnnualReturn: number
) => {
  if (retirementIncome <= 0) return 0;
  
  const monthlyReturn = Math.pow(1 + retirementAnnualReturn, 1/12) - 1;
  const months = retirementYears * 12;
  
  if (monthlyReturn === 0) {
    return retirementIncome * months;
  }
  
  const presentValue = retirementIncome * ((1 - Math.pow(1 + monthlyReturn, -months)) / monthlyReturn);
  return presentValue;
};

export const calculatePossibleRetirementAge = (
  currentAge: number,
  retirementIncome: number,
  retirementYears: number,
  retirementAnnualReturn: number,
  initialAmount: number,
  monthlyAmount: number,
  accumulationAnnualReturn: number
) => {
  if (retirementIncome <= 0) return currentAge + 30; // Default
  
  const requiredWealth = calculateRequiredWealthDepleting(retirementIncome, retirementYears, retirementAnnualReturn);
  const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
  
  let balance = initialAmount;
  let years = 0;
  const maxYears = 50;
  
  while (balance < requiredWealth && years < maxYears) {
    for (let month = 0; month < 12; month++) {
      balance += monthlyAmount;
      balance *= (1 + monthlyReturn);
    }
    years++;
  }
  
  return currentAge + years;
};

export const calculateSustainableIncome = (
  accumulatedWealth: number,
  portfolioReturn: number
) => {
  return accumulatedWealth * (portfolioReturn / 100) / 12;
};

export const calculateDepletingIncome = (
  accumulatedWealth: number,
  retirementYears: number,
  retirementAnnualReturn: number
) => {
  const monthlyReturn = Math.pow(1 + retirementAnnualReturn, 1/12) - 1;
  const months = retirementYears * 12;
  
  if (monthlyReturn === 0) {
    return accumulatedWealth / months;
  }
  
  const payment = accumulatedWealth * (monthlyReturn / (1 - Math.pow(1 + monthlyReturn, -months)));
  return payment;
};

export const calculateSuggestedMonthlyContribution = (
  retirementIncome: number,
  retirementYears: number,
  retirementAnnualReturn: number,
  initialAmount: number,
  accumulationYears: number,
  accumulationAnnualReturn: number
) => {
  if (retirementIncome <= 0) return 0;
  
  const requiredWealth = calculateRequiredWealthDepleting(retirementIncome, retirementYears, retirementAnnualReturn);
  const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
  const months = accumulationYears * 12;
  
  const futureValueInitial = initialAmount * Math.pow(1 + monthlyReturn, months);
  const remainingWealth = requiredWealth - futureValueInitial;
  
  if (remainingWealth <= 0) return 0;
  
  if (monthlyReturn === 0) {
    return remainingWealth / months;
  }
  
  const suggestedPMT = remainingWealth * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1);
  return Math.max(0, suggestedPMT);
};

export const calculateMinimumAccumulationReturn = (
  retirementIncome: number,
  retirementYears: number,
  retirementAnnualReturn: number,
  monthlyAmount: number,
  initialAmount: number,
  accumulationYears: number
) => {
  if (retirementIncome <= 0) return 5.5; // Default return
  
  const requiredWealth = calculateRequiredWealthDepleting(retirementIncome, retirementYears, retirementAnnualReturn);
  const months = accumulationYears * 12;
  
  let minRate = 0.001;
  let maxRate = 0.5;
  const tolerance = 1;
  
  for (let iteration = 0; iteration < 100; iteration++) {
    const testRate = (minRate + maxRate) / 2;
    const monthlyReturn = Math.pow(1 + testRate, 1/12) - 1;
    
    let balance = initialAmount;
    for (let i = 0; i < months; i++) {
      balance += monthlyAmount;
      balance *= (1 + monthlyReturn);
    }
    
    if (Math.abs(balance - requiredWealth) < tolerance) {
      return testRate * 100;
    }
    
    if (balance < requiredWealth) {
      minRate = testRate;
    } else {
      maxRate = testRate;
    }
  }
  
  return ((minRate + maxRate) / 2) * 100;
};
