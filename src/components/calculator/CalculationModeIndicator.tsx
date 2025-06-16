
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';

interface CalculationModeIndicatorProps {
  isMonteCarloEnabled: boolean;
}

export const CalculationModeIndicator = ({ 
  isMonteCarloEnabled
}: CalculationModeIndicatorProps) => {
  return (
    <div className="flex justify-center mb-4">
      {isMonteCarloEnabled ? (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
          <BarChart3 className="h-4 w-4 mr-2" />
          Modo Probabilístico (Monte Carlo)
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
          <TrendingUp className="h-4 w-4 mr-2" />
          Modo Padrão
        </Badge>
      )}
    </div>
  );
};
