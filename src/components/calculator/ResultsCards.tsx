
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CalculationResult } from './useCalculator';

interface ResultsCardsProps {
  calculationResult: CalculationResult | null;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: number;
  calculationState: 'idle' | 'calculated' | 'stale'; // Added
  isCalculating: boolean; // Added
}

export const ResultsCards: React.FC<ResultsCardsProps> = ({
  calculationResult,
  retirementAge,
  lifeExpectancy,
  initialAmount,
  calculationState, // Added
  isCalculating // Added
}) => {
  if (isCalculating) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg">Calculating results...</p>
        {/* Optional: Add a spinner or more elaborate loading animation here */}
      </div>
    );
  }

  if (calculationState === 'idle') {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg">Enter your financial details and click 'Calculate' to see your projection.</p>
      </div>
    );
  }

  if (calculationState === 'stale') {
    // Option 1: Show stale message and no data (or placeholders)
    return (
      <div className="text-center py-10 text-red-500">
        <p className="text-lg">The input values have changed. Please click 'Recalculate' to see updated results.</p>
        {/* Placeholder cards if desired */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-4 opacity-50">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 bg-gray-200">
              <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-gray-400 rounded w-1/2"></div>
            </Card>
          ))}
        </div> */}
      </div>
    );
  }

  // Only render results if calculationState is 'calculated' and calculationResult exists
  if (calculationState === 'calculated' && calculationResult) {
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
  }

  // Fallback for any other unexpected state, or if calculated but no result (should not happen with current logic)
  return (
    <div className="text-center py-10 text-gray-500">
      <p className="text-lg">Please calculate to see your results.</p>
    </div>
  );
};
