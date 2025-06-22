interface ProjectingMessageProps {
  phase: 'projecting' | 'optimizing';
  lifeExpectancy: number;
  possibleRetirementAge: number;
  onLifeExpectancyChange: (value: number) => void;
  showLifeExpectancyControl: boolean;
}

export const ProjectingMessage = ({
  phase,
  lifeExpectancy: _lifeExpectancy,
  possibleRetirementAge: _possibleRetirementAge,
  onLifeExpectancyChange: _onLifeExpectancyChange,
  showLifeExpectancyControl: _showLifeExpectancyControl
}: ProjectingMessageProps) => {
  const messages = {
    projecting: {
      title: "Calculando possíveis resultados...",
      subtitle: "Analisando mil cenários diferentes baseados em risco e volatilidade"
    },
    optimizing: {
      title: "Otimizando exibição...",
      subtitle: "Preparando visualização dos caminhos mais prováveis"
    }
  };

  const currentMessage = messages[phase];

  return (
    <div className="w-full">
      {/* Container com exatamente o mesmo padrão do gráfico */}
      <div className="chart-container">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Focos de luz coloridos - Efeito onda sequencial */}
            <div className="relative mb-8">
              <div className="aurora-loader">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="aurora-dot"
                  />
                ))}
              </div>
            </div>
            
            <div className="animate-pulse">
              <p className="text-lg font-medium text-white">{currentMessage.title}</p>
              <p className="text-sm text-white mt-2">{currentMessage.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
