import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface InsightCardProps {
  title: string;
  value: number;
  description: string;
  isCurrency?: boolean;
  suffix?: string;
  showValueAsDescription?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  description,
  isCurrency = false,
  suffix = '',
  showValueAsDescription = false,
}) => {
  const renderDescription = () => {
    if (!showValueAsDescription) {
      return description;
    }

    // Sempre quebra em linhas separadas
    const lines = description.split('\n');
    return lines.map((line, idx) => {
      // Extrai o valor monetário e a descrição
      const match = line.match(/^(R\$\s*[\d.,]+)\s*(.+)$/);
      
      if (match) {
        const [, value, description] = match;
        return (
          <div key={idx} className="mb-2 text-center flex flex-col items-center">
            <div className="text-base sm:text-lg font-semibold text-orange-600 tech-number">
              {value}
            </div>
            <div className="text-sm text-white">
              {description}
            </div>
          </div>
        );
      }
      
      // Fallback se não conseguir extrair
      return (
        <div key={idx} className="mb-2 text-center flex flex-col items-center">
          <div className="text-base sm:text-lg font-semibold text-orange-600 tech-number">
            {line}
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="p-4 sm:p-6 insight-card">
      <div className="text-center flex flex-col items-center justify-center h-full">
        <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{title}</h3>
        {!showValueAsDescription && (
          <p className="text-xl sm:text-2xl font-bold text-orange-600 mb-2 tech-number">
            {isCurrency ? formatCurrency(value) : Math.round(value) + suffix}
          </p>
        )}
        <div className="text-center flex flex-col items-center">
          {renderDescription()}
        </div>
      </div>
    </Card>
  );
};
