
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { MonteCarloResult } from '@/lib/utils';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';

interface ChartInfoProps {
  monteCarloData?: MonteCarloResult | null;
  perpetuityWealth: number;
  possibleRetirementAge: number;
}

export const ChartInfo = ({ monteCarloData, perpetuityWealth, possibleRetirementAge }: ChartInfoProps) => {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Legenda dos Cenários */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Cenários</h4>
        </div>
        
        {monteCarloData ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-500" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-xs text-gray-600">Otimista (75º percentil)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500"></div>
              <span className="text-xs text-gray-600">Neutro (50º percentil)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-red-600" style={{ borderTop: '2px dashed' }}></div>
              <span className="text-xs text-gray-600">Pessimista (25º percentil)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-orange-500"></div>
            <span className="text-xs text-gray-600">Patrimônio Projetado</span>
          </div>
        )}
      </Card>

      {/* Métricas Chave */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-semibold text-gray-900">Métricas Chave</h4>
        </div>
        
        <div className="space-y-3">
          {monteCarloData?.statistics.successProbability && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Probabilidade de Sucesso</p>
              <p className="text-lg font-bold text-green-600">
                {(monteCarloData.statistics.successProbability * 100).toFixed(1)}%
              </p>
            </div>
          )}
          
          {perpetuityWealth > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Patrimônio para Perpetuidade</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatCurrency(perpetuityWealth)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Linhas de Referência */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Referências</h4>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-500"></div>
              <span className="text-xs text-gray-600">Aposentadoria Possível</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {possibleRetirementAge} anos
            </p>
          </div>
          
          {perpetuityWealth > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-500"></div>
                <span className="text-xs text-gray-600">Linha Perpetuidade</span>
              </div>
              <p className="text-xs text-gray-500">
                Renda indefinida sem esgotar capital
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
