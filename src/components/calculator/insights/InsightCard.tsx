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
  showValueAsDescription = false
}) => {
  return (
    <Card className="p-4 insight-card">
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <div className="space-y-2">
        {!showValueAsDescription && (
          <p className="text-2xl font-bold text-orange-600 mb-2 tech-number">
            {isCurrency 
              ? formatCurrency(value) 
              : Math.round(value) + suffix
            }
          </p>
        )}
        <p className={`text-sm text-white whitespace-pre-line ${showValueAsDescription ? 'text-lg font-semibold text-orange-600 tech-number' : ''}`}>
          {description}
        </p>
      </div>
    </Card>
  );
};
