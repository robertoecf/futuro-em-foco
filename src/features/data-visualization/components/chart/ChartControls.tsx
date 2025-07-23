import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface ChartControlsProps {
  lifeExpectancy: number;
  possibleRetirementAge: number;
  isMonteCarloEnabled: boolean;
  onLifeExpectancyChange: (value: number) => void;
  onMonteCarloToggle: (enabled: boolean) => void;
  showGrid?: boolean;
  onGridToggle?: (enabled: boolean) => void;
  crisisFrequency?: number;
  onCrisisFrequencyChange?: (value: number) => void;
  crisisMeanImpact?: number;
  onCrisisMeanImpactChange?: (value: number) => void;
}

export const ChartControls = ({
  lifeExpectancy,
  possibleRetirementAge,
  isMonteCarloEnabled,
  onLifeExpectancyChange,
  onMonteCarloToggle,
  showGrid = true,
  onGridToggle,
  crisisFrequency = 0.1,
  onCrisisFrequencyChange,
  crisisMeanImpact = -0.15,
  onCrisisMeanImpactChange,
}: ChartControlsProps) => {
  return (
    <div className="glass-panel p-2 sm:p-4 rounded-lg mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        {/* Texto com melhor quebra de linha - ocupando todo espaço disponível */}
        <div className="flex-1 min-w-0 chart-controls-text overflow-hidden pl-2.5">
          <h3 className="text-xs sm:text-sm font-medium dark:text-white text-gray-900 leading-tight hyphens-auto break-words overflow-hidden">
            Simulação Probabilística | Método de Monte Carlo
          </h3>
          <p className="text-[10px] sm:text-xs dark:text-white text-gray-900 leading-tight hyphens-auto break-words mt-0.5 overflow-hidden">
            {isMonteCarloEnabled
              ? 'Mil cenários aleatórios sendo exibidos'
              : 'Mil cenários aleatórios baseados em risco e volatilidade'}
          </p>
        </div>
        {/* Botões com tamanho fixo e responsividade melhorada */}
        <div className="flex flex-row gap-1.5 sm:gap-2 w-auto justify-end flex-shrink-0 -mr-[-10px]">
          <Button
            variant="default"
            size="sm"
            onClick={() => onMonteCarloToggle(!isMonteCarloEnabled)}
            className="tech-button-monte-carlo text-white font-medium w-auto max-w-none h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 chart-controls-button-primary"
          >
            {isMonteCarloEnabled ? 'Voltar' : 'Calcular'}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="tech-button-secondary font-medium w-8 sm:w-9 h-8 sm:h-9 p-0 flex-shrink-0 chart-controls-button-secondary"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 dark:text-white text-gray-900" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-card !bg-transparent border-foreground/20">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Configurações</h4>

                {/* Life Expectancy Control */}
                <div className="space-y-2">
                  <label
                    htmlFor="life-expectancy-setting"
                    className="text-sm font-medium text-foreground"
                  >
                    Expectativa de vida
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="life-expectancy-setting"
                      type="number"
                      value={lifeExpectancy}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          onLifeExpectancyChange(value);
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium glass-input"
                      min={possibleRetirementAge + 1}
                    />
                    <span className="text-sm text-muted-foreground tech-label">anos</span>
                  </div>
                </div>

                {/* Grid Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label htmlFor="grid-setting" className="text-sm font-medium text-foreground">
                      Grade pontilhada
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Mostrar linhas de grade no fundo do gráfico
                    </p>
                  </div>
                  <Switch
                    id="grid-setting"
                    checked={showGrid}
                    onCheckedChange={onGridToggle || (() => {})}
                  />
                </div>

                {/* Crisis Frequency Control */}
                {isMonteCarloEnabled && (
                  <div className="space-y-2 pt-2 border-t border-foreground/10">
                    <label
                      htmlFor="crisis-frequency-setting"
                      className="text-sm font-medium text-foreground"
                    >
                      Frequência de Crises
                    </label>
                    <Slider
                      id="crisis-frequency-setting"
                      min={0.05}
                      max={0.5}
                      step={0.05}
                      value={[crisisFrequency]}
                      onValueChange={(value) => onCrisisFrequencyChange?.(value[0])}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {crisisFrequency > 0
                        ? `1 crise a cada ${Math.round(1 / crisisFrequency)} anos`
                        : 'Nenhuma'}
                    </p>
                  </div>
                )}

                {/* Crisis Impact Control */}
                {isMonteCarloEnabled && (
                  <div className="space-y-2">
                    <label
                      htmlFor="crisis-impact-setting"
                      className="text-sm font-medium text-foreground"
                    >
                      Impacto Médio da Crise
                    </label>
                    <Slider
                      id="crisis-impact-setting"
                      min={-0.3}
                      max={-0.05}
                      step={0.05}
                      value={[crisisMeanImpact]}
                      onValueChange={(value) => onCrisisMeanImpactChange?.(value[0])}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      Queda de {Math.round(Math.abs(crisisMeanImpact) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
