import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function calculateFutureValue(
  initialAmount: number, 
  monthlyContribution: number,
  years: number,
  annualReturn: number
): number {
  const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
  const months = years * 12;
  
  let futureValue = initialAmount;
  
  for (let i = 0; i < months; i++) {
    futureValue = (futureValue + monthlyContribution) * (1 + monthlyReturn);
  }
  
  return futureValue;
}

export function calculateFullProjection(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  annualReturn: number,
  monthlyIncomeRate: number = 0.004, // Default monthly income rate (0.4%)
  retirementMonthlyIncome: number = 0 // New parameter for fixed monthly retirement income
): {
  yearlyValues: number[],
  retirementAmount: number,
  monthlyIncome: number
} {
  // Monthly return rate for accumulation phase based on selected profile
  const accumulationMonthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
  
  // Monthly return rate for retirement phase - always using conservative profile (4%)
  const conservativeAnnualReturn = 0.04; // 4% a.a.
  const retirementMonthlyReturn = Math.pow(1 + conservativeAnnualReturn, 1/12) - 1;
  
  let balance = initialAmount;
  const yearlyValues: number[] = [initialAmount];
  
  // Accumulation phase - using selected investor profile return
  for (let year = 1; year <= accumulationYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution and apply return
      balance += monthlyContribution;
      balance *= (1 + accumulationMonthlyReturn);
    }
    yearlyValues.push(Math.round(balance));
  }
  
  const retirementAmount = balance;
  // If no fixed retirement income is specified, calculate it based on balance
  const monthlyIncome = retirementMonthlyIncome > 0 ? 
    retirementMonthlyIncome : 
    balance * monthlyIncomeRate;
  
  // Retirement phase - drawing income using CONSERVATIVE profile return
  for (let year = accumulationYears + 1; year <= totalYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Withdraw monthly income
      balance -= monthlyIncome;
      // Apply CONSERVATIVE return to remaining balance
      balance *= (1 + retirementMonthlyReturn);
    }
    
    // Ensure we don't show negative values
    yearlyValues.push(Math.max(0, Math.round(balance)));
  }
  
  return {
    yearlyValues,
    retirementAmount,
    monthlyIncome
  };
}
