
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CalculationResult } from './useCalculator';

interface ResultsCardsProps {
  calculationResult: CalculationResult | null;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: number;
}

export const ResultsCards: React.FC<ResultsCardsProps> = ({
  calculationResult,
  retirementAge,
  lifeExpectancy,
  initialAmount
}) => {
  if (!calculationResult) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 bg-gray-50 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Investimento inicial</p>
        <p className="text-2xl font-bold">{formatCurrency(initialAmount)}</p>
      </Card>
      
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Patrimônio aos {retirementAge} anos</p>
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
  );
};
