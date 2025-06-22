import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MonteCarloResult } from '@/lib/utils';
import type { ChartDataPoint } from '@/utils/csvExport';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
  label?: string;
  monteCarloData?: MonteCarloResult | null;
  shouldShow?: boolean; // Nova prop para controle externo
}

export const CustomTooltip = ({ active, payload, label, monteCarloData, shouldShow = true }: CustomTooltipProps) => {
  // Primeira verificação: se shouldShow é false, não mostra
  if (!shouldShow) {
    return null;
  }
  
  // Only show tooltip if explicitly active AND has valid data
  if (!active || !payload || !payload.length || !label) {
    return null;
  }
  
  // Additional check to ensure we have valid data to display
  const data = payload[0]?.payload;
  if (!data || !data.age) {
    return null;
  }
  
  const phase = data.fase;
  
  return (
    <div style={{ zIndex: 10000 }}>
      <Card className="p-0 border-0 shadow-lg bg-black/90 backdrop-blur-sm border border-white/30 rounded-lg min-w-[250px] max-w-[300px]">
        <CardContent className="p-3">
          <p className="text-xs text-white/90 mb-2">
            Idade: {data.age} anos
          </p>
          
          {monteCarloData ? (
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm text-green-400 font-medium">
                  Cenário Otimista: <span className="text-white">{formatCurrency(data.optimistic || 0)}</span>
                </p>
                <p className="text-sm font-semibold text-blue-400">
                  Cenário Neutro: <span className="text-white">{formatCurrency(data.median || 0)}</span>
                </p>
                <p className="text-sm text-red-400 font-medium">
                  Cenário Pessimista: <span className="text-white">{formatCurrency(data.pessimistic || 0)}</span>
                </p>
              </div>
              <div className="border-t border-white/20 pt-2">
                <p className="text-sm text-white">
                  {`Total Poupado: ${formatCurrency(data.poupanca || 0)}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white font-semibold">
                {`Patrimônio: ${formatCurrency(data.patrimonio || 0)}`}
              </p>
              <p className="text-sm text-gray-300">
                {`Total Poupado: ${formatCurrency(data.poupanca || 0)}`}
              </p>
            </div>
          )}
          
          <p className="text-xs text-white/60 mt-2 pt-2 border-t border-white/20">
            {phase === "Acumulação" ? "Fase de Acumulação" : "Fase de Aposentadoria"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
