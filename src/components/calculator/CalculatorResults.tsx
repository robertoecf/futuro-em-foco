
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartComponent } from '@/components/ChartComponent';
import { formatCurrency } from '@/lib/utils';
import type { CalculationResult } from './useCalculator';

interface CalculatorResultsProps {
  calculationResult: CalculationResult | null;
  accumulationYears: number;
  lifeExpectancy: number;
  currentAge: number;
  retirementAge: number;
  initialAmount: number;
  handleLifeExpectancyChange: (value: number) => void;
}

export const CalculatorResults: React.FC<CalculatorResultsProps> = ({
  calculationResult,
  accumulationYears,
  lifeExpectancy,
  currentAge,
  retirementAge,
  initialAmount,
  handleLifeExpectancyChange
}) => {
  if (!calculationResult) {
    return <div>Calculando resultados...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Resultados da Projeção</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Investimento inicial</p>
            <p className="text-2xl font-bold">{formatCurrency(initialAmount)}</p>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Patrimônio na aposentadoria</p>
            <p className="text-2xl font-bold">{formatCurrency(calculationResult.finalAmount)}</p>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Renda mensal na aposentadoria</p>
            <p className="text-2xl font-bold">{formatCurrency(calculationResult.monthlyIncome)}</p>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Duração da renda</p>
            <p className="text-2xl font-bold">{lifeExpectancy - retirementAge} anos</p>
          </Card>
        </div>
        
        <div className="chart-container h-[400px]">
          <ChartComponent 
            data={calculationResult.yearlyValues} 
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            onLifeExpectancyChange={handleLifeExpectancyChange} 
          />
        </div>
      </div>
    </div>
  );
};
