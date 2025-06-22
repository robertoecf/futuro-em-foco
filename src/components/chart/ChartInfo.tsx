import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { MonteCarloResult } from '@/lib/utils';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';

interface ChartInfoProps {
  monteCarloData?: MonteCarloResult | null;
  perpetuityWealth: number;
  possibleRetirementAge: number;
}

export const ChartInfo = ({
  monteCarloData,
  perpetuityWealth,
  possibleRetirementAge
}: ChartInfoProps) => {
  return <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Legenda dos Cenários */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-white" />
          <h4 className="text-sm font-semibold text-white">Cenários</h4>
        </div>
        
        <div className="space-y-2">
          {monteCarloData ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-white">Otimista (75º percentil)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-white">Neutro (50º percentil)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-white">Pessimista (25º percentil)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-white">Total Poupado</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-white">Patrimônio Projetado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-white">Total Poupado</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Métricas Chave */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-semibold text-white">Métricas Chave</h4>
        </div>
        
        <div className="space-y-3">
          {monteCarloData?.statistics.successProbability &&             <div>
              <p className="text-xs text-white mb-1">Probabilidade de Sucesso</p>
              <p className="text-lg font-bold text-green-600">
                {(monteCarloData.statistics.successProbability * 100).toFixed(1)}%
              </p>
            </div>}
        </div>
      </Card>

      {/* Referências */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-white" />
          <h4 className="text-sm font-semibold text-white">Referências</h4>
        </div>
        
        <div className="space-y-2">
          <div className="border-l-2 border-gray-400 pl-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 bg-transparent"></div>
              <span className="text-xs text-white">Independência financeira</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {possibleRetirementAge} anos
            </p>
          </div>
          
          <div className="border-l-2 border-gray-400 pl-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 bg-transparent"></div>
              <span className="text-xs text-white">Patrimônio Perpetuidade</span>
            </div>
            <p className="text-xs text-white">
              {formatCurrency(perpetuityWealth)}
            </p>
          </div>
        </div>
      </Card>
    </div>;
};
