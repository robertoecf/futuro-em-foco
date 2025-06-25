export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

export interface CalculationResult {
  finalAmount: number;
  yearlyValues: number[];
  monthlyIncome: number;
}

export interface SharedPlanData {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  lifeExpectancy: number;
}
