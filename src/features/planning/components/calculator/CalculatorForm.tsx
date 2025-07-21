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
  // Helper to format a number to a BRL currency string.
  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Helper to parse a BRL currency string back to a number.
  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    if (!onlyNumbers) return 0;
    return parseFloat(onlyNumbers) / 100;
  };

  // Format age/percentage inputs
  const formatNumericInput = (value: number) => {
    return value === 0 ? '' : value.toString();
  };

  // Local state for formatted input values
  const [initialAmountInput, setInitialAmountInput] = useState(() => formatCurrency(initialAmount));
  const [monthlyAmountInput, setMonthlyAmountInput] = useState(() => formatCurrency(monthlyAmount));
  const [retirementIncomeInput, setRetirementIncomeInput] = useState(() =>
    formatCurrency(retirementIncome)
  );

  // Local state for non-currency fields to allow real-time editing
  const [currentAgeInput, setCurrentAgeInput] = useState(() => formatNumericInput(currentAge));
  const [retirementAgeInput, setRetirementAgeInput] = useState(() =>
    formatNumericInput(retirementAge)
  );
  const [portfolioReturnInput, setPortfolioReturnInput] = useState(() =>
    formatNumericInput(portfolioReturn)
  );

  // Sync props with local state
  useEffect(() => {
    setInitialAmountInput(formatCurrency(initialAmount));
  }, [initialAmount]);

  useEffect(() => {
    setMonthlyAmountInput(formatCurrency(monthlyAmount));
  }, [monthlyAmount]);

  useEffect(() => {
    setRetirementIncomeInput(formatCurrency(retirementIncome));
  }, [retirementIncome]);

  useEffect(() => {
    setCurrentAgeInput(formatNumericInput(currentAge));
  }, [currentAge]);

  useEffect(() => {
    setRetirementAgeInput(formatNumericInput(retirementAge));
  }, [retirementAge]);

  useEffect(() => {
    setPortfolioReturnInput(formatNumericInput(portfolioReturn));
  }, [portfolioReturn]);

  // Handles real-time currency input formatting.
  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let value = e.target.value;
    // Keep only digits
    value = value.replace(/\D/g, '');

    if (value === '') {
      setter('');
      return;
    }

    // Remove leading zeros
    value = value.replace(/^0+/, '');

    // Pad with zeros to ensure there are at least 3 digits for cents
    if (value.length <= 2) {
      value = value.padStart(3, '0');
    }

    // Insert decimal separator
    let formattedValue = value.slice(0, -2) + ',' + value.slice(-2);

    // Insert thousand separators
    const integerPart = formattedValue.split(',')[0];
    const decimalPart = formattedValue.split(',')[1];
    const withThousandSeparators = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

    setter(withThousandSeparators + ',' + decimalPart);
  };

  // Blur handlers that propagate the numeric value.
  const handleInitialAmountBlurWithFormat = () => {
    const numericValue = parseCurrency(initialAmountInput);
    handleInitialAmountBlur(numericValue.toString());
  };

  const handleMonthlyAmountBlurWithFormat = () => {
    const numericValue = parseCurrency(monthlyAmountInput);
    handleMonthlyAmountBlur(numericValue.toString());
  };

  const handleRetirementIncomeBlurWithFormat = () => {
    const numericValue = parseCurrency(retirementIncomeInput);
    handleRetirementIncomeBlur(numericValue.toString());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
      {/* Left Panel - Dados Atuais */}
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white">Dados Atuais</h3>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-age" className="text-sm sm:text-base">Idade Atual</Label>
            <Input
              id="current-age"
              name="currentAge"
              type="number"
              value={currentAgeInput}
              onChange={(e) => {
                setCurrentAgeInput(e.target.value);
              }}
              onBlur={(e) => handleCurrentAgeBlur(e.target.value)}
              min={1}
              className="glass-input h-11 sm:h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-amount" className="text-sm sm:text-base">Investimento Inicial (R$)</Label>
            <Input
              id="initial-amount"
              name="initialAmount"
              autoComplete="off"
              type="text"
              value={initialAmountInput}
              onChange={(e) => handleCurrencyChange(e, setInitialAmountInput)}
              onBlur={handleInitialAmountBlurWithFormat}
              className="glass-input h-11 sm:h-10"
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-amount" className="text-sm sm:text-base">Aporte Mensal (R$)</Label>
            <Input
              id="monthly-amount"
              name="monthlyAmount"
              autoComplete="off"
              type="text"
              value={monthlyAmountInput}
              onChange={(e) => handleCurrencyChange(e, setMonthlyAmountInput)}
              onBlur={handleMonthlyAmountBlurWithFormat}
              className="glass-input h-11 sm:h-10"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Configurações de Aposentadoria */}
      <div className="glass-card p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white">Configurações de Aposentadoria</h3>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="retirement-age" className="text-sm sm:text-base">Idade de Aposentadoria</Label>
            <Input
              id="retirement-age"
              name="retirementAge"
              autoComplete="off"
              type="number"
              value={retirementAgeInput}
              onChange={(e) => {
                setRetirementAgeInput(e.target.value);
              }}
              onBlur={(e) => handleRetirementAgeBlur(e.target.value)}
              min={currentAge + 1}
              className="glass-input h-11 sm:h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirement-income" className="text-sm sm:text-base">Renda Mensal Desejada na Aposentadoria (R$)</Label>
            <Input
              id="retirement-income"
              name="retirementIncome"
              autoComplete="off"
              type="text"
              value={retirementIncomeInput}
              onChange={(e) => handleCurrencyChange(e, setRetirementIncomeInput)}
              onBlur={handleRetirementIncomeBlurWithFormat}
              placeholder="Deixe 0 para cálculo automático"
              className="glass-input h-11 sm:h-10"
            />
            {retirementIncome === 0 && (
              <p className="text-xs text-gray-300 mt-1">
                O valor será calculado automaticamente com base no patrimônio acumulado
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio-return" className="text-sm sm:text-base">Retorno do Portfólio na Aposentadoria (%)</Label>
            <Input
              id="portfolio-return"
              name="portfolioReturn"
              autoComplete="off"
              type="number"
              step="0.1"
              value={portfolioReturnInput}
              onChange={(e) => {
                setPortfolioReturnInput(e.target.value);
              }}
              onBlur={(e) => handlePortfolioReturnBlur(e.target.value)}
              placeholder="Ex: 4.0"
              className="glass-input h-11 sm:h-10"
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
