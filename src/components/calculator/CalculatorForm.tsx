
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvestorProfile } from './useCalculator';

interface CalculatorFormProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  retirementIncome: number;
  objective: string;
  investorProfile: InvestorProfile;
  handleInitialAmountChange: (value: string) => void;
  handleMonthlyAmountChange: (value: string) => void;
  handleCurrentAgeChange: (value: string) => void;
  handleRetirementAgeChange: (value: string) => void;
  handleRetirementIncomeChange: (value: string) => void;
  setObjective: (value: string) => void;
  setInvestorProfile: (value: InvestorProfile) => void;
  calculateProjection: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  retirementIncome,
  objective,
  investorProfile,
  handleInitialAmountChange,
  handleMonthlyAmountChange,
  handleCurrentAgeChange,
  handleRetirementAgeChange,
  handleRetirementIncomeChange,
  setObjective,
  setInvestorProfile,
  calculateProjection
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
    <div>
      <h3 className="text-xl font-semibold mb-6">Defina seus parâmetros</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <Select value={objective} onValueChange={setObjective}>
            <SelectTrigger id="objective">
              <SelectValue placeholder="Selecione um objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
              <SelectItem value="preservar">Preservar Patrimônio</SelectItem>
              <SelectItem value="usufruir">Usufruir do Patrimônio</SelectItem>
              <SelectItem value="outro">Outro objetivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="current-age">Idade Atual</Label>
          <Input
            id="current-age"
            type="number"
            value={currentAge}
            onChange={(e) => handleCurrentAgeChange(e.target.value)}
            min={1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="retirement-age">Idade de Aposentadoria</Label>
          <Input
            id="retirement-age"
            type="number"
            value={retirementAge}
            onChange={(e) => handleRetirementAgeChange(e.target.value)}
            min={currentAge + 1}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="initial-amount">Investimento Inicial (R$)</Label>
          <Input
            id="initial-amount"
            type="text"
            value={formatInputCurrency(initialAmount)}
            onChange={(e) => handleInitialAmountChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="monthly-amount">Aporte Mensal (R$)</Label>
          <Input
            id="monthly-amount"
            type="text"
            value={formatInputCurrency(monthlyAmount)}
            onChange={(e) => handleMonthlyAmountChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retirement-income">Renda Mensal na Aposentadoria (R$)</Label>
          <Input
            id="retirement-income"
            type="text"
            value={formatInputCurrency(retirementIncome)}
            onChange={(e) => handleRetirementIncomeChange(e.target.value)}
            placeholder="Deixe 0 para cálculo automático"
          />
          {retirementIncome === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              O valor será calculado automaticamente com base no patrimônio acumulado
            </p>
          )}
        </div>
        
        <Button className="w-full bg-black hover:bg-gray-800" onClick={calculateProjection}>
          Calcular Projeção
        </Button>
      </div>
    </div>
  );
};
