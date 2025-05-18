
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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
