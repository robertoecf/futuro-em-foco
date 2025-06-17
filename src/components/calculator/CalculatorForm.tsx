
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Added
import { InvestorProfile } from './useCalculator';

interface CalculatorFormProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  handleInitialAmountBlur: (value: string) => void;
  handleMonthlyAmountBlur: (value: string) => void;
  handleCurrentAgeBlur: (value: string) => void;
  handleRetirementAgeBlur: (value: string) => void;
  handleRetirementIncomeBlur: (value: string) => void;
  handlePortfolioReturnBlur: (value: string) => void;
  setInvestorProfile: (value: InvestorProfile) => void;
  handleCalculate: () => Promise<void>; // Added
  calculationState: 'idle' | 'calculated' | 'stale'; // Added
  isCalculating: boolean; // Added
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  retirementIncome,
  portfolioReturn,
  handleInitialAmountBlur,
  handleMonthlyAmountBlur,
  handleCurrentAgeBlur,
  handleRetirementAgeBlur,
  handleRetirementIncomeBlur,
  handlePortfolioReturnBlur,
  handleCalculate, // Added
  calculationState, // Added
  isCalculating // Added
}) => {
  // Format numbers for display in inputs
  const formatInputCurrency = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Left Panel - Dados Atuais */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Dados Atuais</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-age">Idade Atual</Label>
            <Input
              id="current-age"
              type="number"
              defaultValue={currentAge}
              onBlur={(e) => handleCurrentAgeBlur(e.target.value)}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initial-amount">Investimento Inicial (R$)</Label>
            <Input
              id="initial-amount"
              type="text"
              defaultValue={formatInputCurrency(initialAmount)}
              onBlur={(e) => handleInitialAmountBlur(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly-amount">Aporte Mensal (R$)</Label>
            <Input
              id="monthly-amount"
              type="text"
              defaultValue={formatInputCurrency(monthlyAmount)}
              onBlur={(e) => handleMonthlyAmountBlur(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Configurações de Aposentadoria */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Configurações de Aposentadoria</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="retirement-age">Idade de Aposentadoria</Label>
            <Input
              id="retirement-age"
              type="number"
              defaultValue={retirementAge}
              onBlur={(e) => handleRetirementAgeBlur(e.target.value)}
              min={currentAge + 1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirement-income">Renda Mensal Desejada na Aposentadoria (R$)</Label>
            <Input
              id="retirement-income"
              type="text"
              defaultValue={formatInputCurrency(retirementIncome)}
              onBlur={(e) => handleRetirementIncomeBlur(e.target.value)}
              placeholder="Deixe 0 para cálculo automático"
            />
            {retirementIncome === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                O valor será calculado automaticamente com base no patrimônio acumulado
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio-return">Retorno do Portfólio na Aposentadoria (%)</Label>
            <Input
              id="portfolio-return"
              type="number"
              step="0.1"
              defaultValue={portfolioReturn}
              onBlur={(e) => handlePortfolioReturnBlur(e.target.value)}
              placeholder="Ex: 4.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Taxa de retorno anual esperada durante a aposentadoria
            </p>
          </div>
        </div>
      </div>

      {/* Calculate Button Section */}
      <div className="col-span-1 md:col-span-2 mt-8 flex flex-col items-center">
        {calculationState === 'stale' && (
          <p className="text-red-500 mb-2 text-center">
            Input values have changed. Please recalculate for updated results.
          </p>
        )}
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full md:w-auto px-8 py-3 text-lg" // Example styling
        >
          {isCalculating
            ? 'Calculating...'
            : calculationState === 'stale' || calculationState === 'calculated'
            ? 'Recalculate'
            : 'Calculate'}
        </Button>
      </div>
    </div>
  );
};
