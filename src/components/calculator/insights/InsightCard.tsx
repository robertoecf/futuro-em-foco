
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
    <Card className="p-6 insight-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        {!showValueAsDescription && (
          <p className="text-2xl font-bold text-orange-600 mb-2">
            {isCurrency 
              ? formatCurrency(value) 
              : Math.round(value) + suffix
            }
          </p>
        )}
        <p className={`text-sm text-gray-600 ${showValueAsDescription ? 'text-lg font-semibold text-orange-600' : ''}`}>
          {description}
        </p>
      </div>
    </Card>
  );
};
