import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface ChartControlsProps {
  lifeExpectancy: number;
  possibleRetirementAge: number;
  isMonteCarloEnabled: boolean;
  onLifeExpectancyChange: (value: number) => void;
  onMonteCarloToggle: (enabled: boolean) => void;
  showGrid?: boolean;
  onGridToggle?: (enabled: boolean) => void;
}

export const ChartControls = ({
  lifeExpectancy,
  possibleRetirementAge,
  isMonteCarloEnabled,
  onLifeExpectancyChange,
  onMonteCarloToggle,
  showGrid = true,
  onGridToggle,
}: ChartControlsProps) => {
  return (
    <div className="glass-panel p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Monte Carlo Toggle */}
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-white">
              Simulação Probabilística | Método de Monte Carlo
            </h3>
            <p className="text-xs text-gray-300">
              {isMonteCarloEnabled
                ? 'Mil cenários aleatórios sendo exibidos'
                : 'Mil cenários aleatórios baseados em risco e volatilidade'}
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => onMonteCarloToggle(!isMonteCarloEnabled)}
            className="tech-button-monte-carlo text-white font-medium"
          >
            {isMonteCarloEnabled ? 'Voltar' : 'Calcular'}
          </Button>
        </div>

        {/* Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="tech-button-secondary font-medium w-10 h-10 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass-card !bg-transparent border-white/20">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Configurações</h4>

              {/* Life Expectancy Control */}
              <div className="space-y-2">
                <label htmlFor="life-expectancy-setting" className="text-sm font-medium text-white">
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
                  <span className="text-sm text-gray-500 tech-label">anos</span>
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
  );
};
