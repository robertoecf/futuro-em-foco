import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvestorProfile } from './useCalculator';

export interface CalculatorFormProps {
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
  handleInvestorProfileChange: (value: InvestorProfile) => void;
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
}) => {
  // Format numbers for display in inputs
  const formatInputCurrency = (value: number) => {
    if (value === 0) return ''; // Return empty string for zero values
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format age/percentage inputs
  const formatNumericInput = (value: number) => {
    return value === 0 ? '' : value.toString();
  };

  // Estados para controlar os valores formatados dos inputs - inicializados com valores corretos
  const [initialAmountInput, setInitialAmountInput] = useState(() =>
    formatInputCurrency(initialAmount)
  );
  const [monthlyAmountInput, setMonthlyAmountInput] = useState(() =>
    formatInputCurrency(monthlyAmount)
  );
  const [retirementIncomeInput, setRetirementIncomeInput] = useState(() =>
    formatInputCurrency(retirementIncome)
  );

  // Estados locais para campos de idade e retorno para permitir edição em tempo real
  const [currentAgeInput, setCurrentAgeInput] = useState(() => formatNumericInput(currentAge));
  const [retirementAgeInput, setRetirementAgeInput] = useState(() =>
    formatNumericInput(retirementAge)
  );
  const [portfolioReturnInput, setPortfolioReturnInput] = useState(() =>
    formatNumericInput(portfolioReturn)
  );

  // Função para formatar valor monetário em tempo real
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) return '';

    // Converte para número e formata
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);
  };

  // Função para extrair valor numérico de string formatada
  const extractNumericValue = (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/\D/g, '');
    return numericValue ? parseInt(numericValue) / 100 : 0;
  };

  // Inicializar valores formatados quando os props mudarem
  useEffect(() => {
    setInitialAmountInput(formatInputCurrency(initialAmount));
  }, [initialAmount]);

  useEffect(() => {
    setMonthlyAmountInput(formatInputCurrency(monthlyAmount));
  }, [monthlyAmount]);

  useEffect(() => {
    setRetirementIncomeInput(formatInputCurrency(retirementIncome));
  }, [retirementIncome]);

  // Inicializar campos de idade e retorno
  useEffect(() => {
    setCurrentAgeInput(formatNumericInput(currentAge));
  }, [currentAge]);

  useEffect(() => {
    setRetirementAgeInput(formatNumericInput(retirementAge));
  }, [retirementAge]);

  useEffect(() => {
    setPortfolioReturnInput(formatNumericInput(portfolioReturn));
  }, [portfolioReturn]);

  // Handlers para mudanças em tempo real
  const handleInitialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setInitialAmountInput(formatted);
  };

  const handleMonthlyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setMonthlyAmountInput(formatted);
  };

  const handleRetirementIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setRetirementIncomeInput(formatted);
  };

  // Handlers para blur que enviam o valor numérico
  const handleInitialAmountBlurWithFormat = () => {
    const numericValue = extractNumericValue(initialAmountInput);
    handleInitialAmountBlur(numericValue.toString());
  };

  const handleMonthlyAmountBlurWithFormat = () => {
    const numericValue = extractNumericValue(monthlyAmountInput);
    handleMonthlyAmountBlur(numericValue.toString());
  };

  const handleRetirementIncomeBlurWithFormat = () => {
    const numericValue = extractNumericValue(retirementIncomeInput);
    handleRetirementIncomeBlur(numericValue.toString());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Left Panel - Dados Atuais */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-white">Dados Atuais</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-age">Idade Atual</Label>
            <Input
              id="current-age"
              type="number"
              value={currentAgeInput}
              onChange={(e) => {
                setCurrentAgeInput(e.target.value);
              }}
              onBlur={(e) => handleCurrentAgeBlur(e.target.value)}
              min={1}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-amount">Investimento Inicial (R$)</Label>
            <Input
              id="initial-amount"
              type="text"
              value={initialAmountInput}
              onChange={handleInitialAmountChange}
              onBlur={handleInitialAmountBlurWithFormat}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-amount">Aporte Mensal (R$)</Label>
            <Input
              id="monthly-amount"
              type="text"
              value={monthlyAmountInput}
              onChange={handleMonthlyAmountChange}
              onBlur={handleMonthlyAmountBlurWithFormat}
              className="glass-input"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Configurações de Aposentadoria */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-white">Configurações de Aposentadoria</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="retirement-age">Idade de Aposentadoria</Label>
            <Input
              id="retirement-age"
              type="number"
              value={retirementAgeInput}
              onChange={(e) => {
                setRetirementAgeInput(e.target.value);
              }}
              onBlur={(e) => handleRetirementAgeBlur(e.target.value)}
              min={currentAge + 1}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirement-income">Renda Mensal Desejada na Aposentadoria (R$)</Label>
            <Input
              id="retirement-income"
              type="text"
              value={retirementIncomeInput}
              onChange={handleRetirementIncomeChange}
              onBlur={handleRetirementIncomeBlurWithFormat}
              placeholder="Deixe 0 para cálculo automático"
              className="glass-input"
            />
            {retirementIncome === 0 && (
              <p className="text-xs text-gray-300 mt-1">
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
              value={portfolioReturnInput}
              onChange={(e) => {
                setPortfolioReturnInput(e.target.value);
              }}
              onBlur={(e) => handlePortfolioReturnBlur(e.target.value)}
              placeholder="Ex: 4.0"
              className="glass-input"
            />
            <p className="text-xs text-gray-300 mt-1">
              Taxa de retorno anual esperada durante a aposentadoria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
