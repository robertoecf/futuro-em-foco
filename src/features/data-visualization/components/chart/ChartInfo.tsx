import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { MonteCarloResult } from '@/lib/utils';
import { TrendingUp, Target, BarChart3, Eye, EyeOff } from 'lucide-react';

interface ChartInfoProps {
  monteCarloData?: MonteCarloResult | null;
  perpetuityWealth: number;
  possibleRetirementAge: number;
  onVisibilityChange?: (visibility: ChartVisibilityState) => void;
}

export interface ChartVisibilityState {
  scenarios: {
    optimistic: boolean;
    neutral: boolean;
    pessimistic: boolean;
    totalSaved: boolean;
    patrimony: boolean; // Para o gráfico determinístico
  };
  references: {
    financialIndependence: boolean;
    perpetuityWealth: boolean;
  };
}

export const ChartInfo = ({
  monteCarloData,
  perpetuityWealth,
  possibleRetirementAge,
  onVisibilityChange,
}: ChartInfoProps) => {
  const [visibility, setVisibility] = useState<ChartVisibilityState>({
    scenarios: {
      optimistic: true,
      neutral: true,
      pessimistic: true,
      totalSaved: true,
      patrimony: true,
    },
    references: {
      financialIndependence: false,
      perpetuityWealth: false,
    },
  });

  const toggleScenarioVisibility = (scenario: keyof ChartVisibilityState['scenarios']) => {
    const newVisibility = {
      ...visibility,
      scenarios: {
        ...visibility.scenarios,
        [scenario]: !visibility.scenarios[scenario],
      },
    };
    setVisibility(newVisibility);
    onVisibilityChange?.(newVisibility);
  };

  const toggleReferenceVisibility = (reference: keyof ChartVisibilityState['references']) => {
    const newVisibility = {
      ...visibility,
      references: {
        ...visibility.references,
        [reference]: !visibility.references[reference],
      },
    };
    setVisibility(newVisibility);
    onVisibilityChange?.(newVisibility);
  };

  const ScenarioItem = ({
    color,
    label,
    scenario,
    isDashed = false,
  }: {
    color: string;
    label: string;
    scenario: keyof ChartVisibilityState['scenarios'];
    isDashed?: boolean;
  }) => {
    const isVisible = visibility.scenarios[scenario];

    return (
      <div
        className={`flex items-center gap-2 cursor-pointer hover:bg-foreground/10 p-1 rounded transition-colors ${
          !isVisible ? 'opacity-50' : ''
        }`}
        onClick={() => toggleScenarioVisibility(scenario)}
      >
        <div className={`w-6 h-0.5 ${color} ${isDashed ? 'border-t-2 border-dashed' : ''}`}></div>
        <span className="text-xs dark:text-white text-gray-900 flex-1">{label}</span>
        {isVisible ? (
          <Eye className="w-3 h-3 dark:text-white/70 text-gray-500" />
        ) : (
          <EyeOff className="w-3 h-3 dark:text-white/50 text-gray-400" />
        )}
      </div>
    );
  };

  const ReferenceItem = ({
    label,
    value,
    reference,
  }: {
    label: string;
    value: string | number;
    reference: keyof ChartVisibilityState['references'];
  }) => {
    const isVisible = visibility.references[reference];

    return (
      <div
        className={`cursor-pointer hover:bg-foreground/10 p-1 rounded transition-colors ${
          !isVisible ? 'opacity-50' : ''
        }`}
        onClick={() => toggleReferenceVisibility(reference)}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-500"></div>
          <span className="text-xs dark:text-white text-gray-900 flex-1">{label}</span>
          {isVisible ? (
            <Eye className="w-3 h-3 dark:text-white/70 text-gray-500" />
          ) : (
            <EyeOff className="w-3 h-3 dark:text-white/50 text-gray-400" />
          )}
        </div>
        <p
          className={`text-sm font-semibold dark:text-white text-gray-900 ml-6 ${
            typeof value === 'string' && value.includes('R$') ? 'text-xs' : ''
          }`}
        >
          {value}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Legenda dos Cenários */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3 ml-2.5">
          <BarChart3 className="h-4 w-4 dark:text-white text-gray-900" />
          <h4 className="text-sm font-semibold dark:text-white text-gray-900">Cenários</h4>
        </div>

        {monteCarloData ? (
          <div className="space-y-2 ml-2.5">
            <ScenarioItem
              color="bg-green-500"
              label="Otimista (95º percentil)"
              scenario="optimistic"
              isDashed={true}
            />
            <ScenarioItem color="bg-blue-500" label="Neutro (50º percentil)" scenario="neutral" />
            <ScenarioItem
              color="bg-red-600"
              label="Pessimista (5º percentil)"
              scenario="pessimistic"
              isDashed={true}
            />
            <ScenarioItem
              color="bg-gray-500"
              label="Total Poupado"
              scenario="totalSaved"
              isDashed={true}
            />
          </div>
        ) : (
          <div className="space-y-2 ml-2.5">
            <ScenarioItem color="bg-orange-500" label="Patrimônio Projetado" scenario="patrimony" />
            <ScenarioItem
              color="bg-gray-500"
              label="Total Poupado"
              scenario="totalSaved"
              isDashed={true}
            />
          </div>
        )}
      </Card>

      {/* Métricas Chave */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3 ml-2.5">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-semibold dark:text-white text-gray-900">Métricas Chave</h4>
        </div>

        <div className="space-y-3 ml-2.5">
          {monteCarloData?.statistics.successProbability && (
            <div>
              <p className="text-xs dark:text-white/80 text-gray-600">Probabilidade de sucesso</p>
              <p className="text-sm font-semibold dark:text-white text-gray-900">
                {(monteCarloData.statistics.successProbability * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <div>
            <p className="text-xs dark:text-white/80 text-gray-600">Patrimônio perpétuo</p>
            <p className="text-sm font-semibold dark:text-white text-gray-900">
              {formatCurrency(perpetuityWealth)}
            </p>
          </div>
        </div>
      </Card>

      {/* Referências */}
      <Card className="p-4 chart-info-card">
        <div className="flex items-center gap-2 mb-3 ml-2.5">
          <Target className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-semibold dark:text-white text-gray-900">Referências</h4>
        </div>

        <div className="space-y-3 ml-2.5">
          <ReferenceItem
            label="Idade da independência"
            value={`${possibleRetirementAge} anos`}
            reference="financialIndependence"
          />
          <ReferenceItem
            label="Patrimônio perpétuo"
            value={formatCurrency(perpetuityWealth)}
            reference="perpetuityWealth"
          />
        </div>
      </Card>
    </div>
  );
};
