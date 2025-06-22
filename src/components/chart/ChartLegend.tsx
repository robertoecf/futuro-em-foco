
import { formatCurrency } from '@/lib/utils';
import { MonteCarloResult } from '@/lib/utils';

interface ChartLegendProps {
  monteCarloData?: MonteCarloResult | null;
  perpetuityWealth: number;
}

export const ChartLegend = ({ monteCarloData, perpetuityWealth }: ChartLegendProps) => {
  return (
    <div className="mt-4 flex flex-col gap-2 text-xs text-gray-800">
      {/* Monte Carlo Legend */}
      {monteCarloData && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-green-500 border-dashed border-2"></div>
            <span>Cenário Otimista (75º percentil)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500"></div>
            <span>Cenário Neutro (50º percentil)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-600 border-dashed border-2"></div>
            <span>Cenário Pessimista (25º percentil)</span>
          </div>
          {monteCarloData.statistics.successProbability && (
            <div className="text-sm font-medium text-green-600 mt-2">
              Probabilidade de Sucesso: {(monteCarloData.statistics.successProbability * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
      
      {/* Patrimônio Legend Item (only for deterministic) */}
      {!monteCarloData && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-orange-500"></div>
          <span>Patrimônio</span>
        </div>
      )}
      
      {/* Total Poupado Legend Item */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-0.5 bg-gray-500"></div>
        <span>Total Poupado</span>
      </div>
      
      {/* Perpetuity Legend Item */}
      {perpetuityWealth > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-gray-500"></div>
          <span>Patrimônio para Perpetuidade: {formatCurrency(perpetuityWealth)} (renda indefinida sem esgotar o capital)</span>
        </div>
      )}
    </div>
  );
};
