
import { Button } from '@/components/ui/button';
import { Calculator, Zap } from 'lucide-react';

interface CalculationButtonProps {
  isMonteCarloEnabled: boolean;
  isCalculating: boolean;
  onCalculate: () => void;
}

export const CalculationButton = ({ 
  isMonteCarloEnabled, 
  isCalculating, 
  onCalculate 
}: CalculationButtonProps) => {
  if (!isMonteCarloEnabled) {
    return null; // Don't show button when Monte Carlo is disabled
  }

  return (
    <div className="flex justify-center mb-6">
      <Button
        onClick={onCalculate}
        disabled={isCalculating}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
        size="lg"
      >
        {isCalculating ? (
          <>
            <Zap className="h-5 w-5 mr-2 animate-pulse" />
            Calculando Projeção...
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5 mr-2" />
            Calcular Projeção Probabilística
          </>
        )}
      </Button>
    </div>
  );
};
