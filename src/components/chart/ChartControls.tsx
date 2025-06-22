import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { NumberInputWithArrows } from '@/components/ui/NumberInputWithArrows';
import { Settings, Download } from 'lucide-react';
import { useState } from 'react';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { InvestorProfile, CalculationResult } from '@/components/calculator/hooks/useCalculator';
import type { ChartDataPoint } from '@/utils/csvExport';

interface ChartControlsProps {
  lifeExpectancy: number;
  possibleRetirementAge: number;
  isMonteCarloEnabled: boolean;
  onLifeExpectancyChange: (value: number) => void;
  onMonteCarloToggle: (enabled: boolean) => void;
  showGrid?: boolean;
  onGridToggle?: (enabled: boolean) => void;
  chartData?: ChartDataPoint[];
  planningInputs?: {
    initialAmount: number;
    monthlyAmount: number;
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    retirementIncome: number;
    portfolioReturn: number;
    investorProfile: InvestorProfile;
  };
  calculationResult?: CalculationResult | null;
}

export const ChartControls = ({
  lifeExpectancy,
  possibleRetirementAge,
  isMonteCarloEnabled,
  onLifeExpectancyChange,
  onMonteCarloToggle,
  showGrid = true,
  onGridToggle,
  chartData = [],
  planningInputs,
  calculationResult
}: ChartControlsProps) => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [_localLifeExpectancy, setLocalLifeExpectancy] = useState<number | null>(null);

  const handleExportClick = () => {
    setIsLeadFormOpen(true);
  };

  const handleLifeExpectancyChange = (value: number) => {
    setLocalLifeExpectancy(value);
    onLifeExpectancyChange(value);
  };

  const handleSettingsOpen = (open: boolean) => {
    setIsSettingsOpen(open);
    if (!open) {
      // Quando fechar, reset o valor local
      setLocalLifeExpectancy(null);
    }
  };

  return (
    <>
      <div className="bg-transparent p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Monte Carlo Toggle */}
          <div className="flex items-center space-x-3">
            <div>
                    <h3 className="text-sm font-medium text-white">Simulação Probabilística | Método de Monte Carlo</h3>
        <p className="text-xs text-gray-300">
                {isMonteCarloEnabled 
                  ? "Mil cenários aleatórios sendo exibidos" 
                  : "Mil cenários aleatórios baseados em risco e volatilidade"
                }
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => onMonteCarloToggle(!isMonteCarloEnabled)}
              className="glass-panel tech-button-monte-carlo text-white font-medium hover:scale-105 transition-transform"
            >
              {isMonteCarloEnabled ? "Voltar" : "Calcular"}
            </Button>
          </div>

          {/* Download and Settings Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportClick}
              className="bg-black border-white/20 text-white font-medium w-10 h-10 p-0 hover:scale-105 hover:border-white/40 hover:bg-black transition-all"
            >
              <Download className="w-4 h-4 text-white" />
            </Button>

            {/* Settings Popover */}
            <Popover open={isSettingsOpen} onOpenChange={handleSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black border-white/20 text-white font-medium w-10 h-10 p-0 hover:scale-105 hover:border-white/40 hover:bg-black transition-all"
                >
                  <Settings className="w-4 h-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-black/95 backdrop-filter backdrop-blur-sm border border-white/20">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white">Configurações</h4>
                  
                  {/* Life Expectancy Control */}
                  <div className="space-y-2">
                    <label htmlFor="life-expectancy-setting" className="text-sm font-medium text-white">
                      Expectativa de vida
                    </label>
                    <div className="flex items-center space-x-3">
                      <NumberInputWithArrows
                        id="life-expectancy-setting"
                        value={0}
                        placeholder={`${lifeExpectancy} anos`}
                        onChange={handleLifeExpectancyChange}
                        min={possibleRetirementAge + 1}
                        max={120}
                      />
                      <span className="text-sm text-white tech-label">anos</span>
                    </div>
                  </div>

                  {/* Grid Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label htmlFor="grid-setting" className="text-sm font-medium text-white">
                        Grade pontilhada
                      </label>
                      <p className="text-xs text-gray-300">
                        Mostrar linhas de grade no fundo do gráfico
                      </p>
                    </div>
                    <Switch
                      id="grid-setting"
                      checked={showGrid}
                      onCheckedChange={onGridToggle || (() => {})}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Lead Capture Form Modal */}
      {planningInputs && (
        <LeadCaptureForm
          isOpen={isLeadFormOpen}
          onClose={() => setIsLeadFormOpen(false)}
          planningInputs={planningInputs}
          calculationResult={calculationResult || null}
          exportData={{
            chartData,
            type: 'excel'
          }}
        />
      )}
    </>
  );
};
