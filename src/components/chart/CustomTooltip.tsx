import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MonteCarloResult } from '@/lib/utils';
import type { ChartDataPoint } from '@/utils/csvExport';

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
  label?: string;
  monteCarloData?: MonteCarloResult | null;
}

export const CustomTooltip = ({ active, payload, label, monteCarloData }: CustomTooltipProps) => {
  // Only show tooltip if explicitly active AND has valid data
  if (!active || !payload || !payload.length || !label) {
    return null;
  }

  const data = payload[0].payload;
  const phase = data.fase;

  return (
    <Card className="p-0 bg-black/50 backdrop-filter backdrop-blur-3xl border border-white/20 rounded-lg shadow-lg">
      <CardContent className="p-3">
        <p className="text-sm font-bold text-foreground">{`Idade: ${label} anos`}</p>

        {monteCarloData ? (
          <div className="space-y-1">
            <p className="text-sm dark:text-green-400 text-green-600">
              {`Cenário Otimista: ${formatCurrency(data.optimistic || 0)}`}
            </p>
            <p className="text-sm font-medium dark:text-blue-400 text-blue-600">
              {`Cenário Neutro: ${formatCurrency(data.median || 0)}`}
            </p>
            <p className="text-sm dark:text-red-400 text-red-600">
              {`Cenário Pessimista: ${formatCurrency(data.pessimistic || 0)}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {`Patrimônio: ${formatCurrency(data.patrimonio)}`}
          </p>
        )}

        <p className="text-xs text-white mt-1">
          {phase === 'Acumulação' ? 'Fase de Acumulação' : 'Fase de Aposentadoria'}
        </p>

        {/* Show savings line value as last item */}
        <p className="text-sm text-white mt-1">
          {`Total Poupado: ${formatCurrency(data.poupanca || 0)}`}
        </p>
      </CardContent>
    </Card>
  );
};
