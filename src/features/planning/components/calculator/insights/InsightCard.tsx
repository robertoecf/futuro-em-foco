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
  return (
    <Card className="p-6 insight-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        {!showValueAsDescription && (
          <p className="text-2xl font-bold text-orange-600 mb-2 tech-number">
            {isCurrency ? formatCurrency(value) : Math.round(value) + suffix}
          </p>
        )}
        <p
          className={`text-sm text-white ${showValueAsDescription ? 'text-lg font-semibold text-orange-600 tech-number' : ''}`}
        >
          {showValueAsDescription
            ? description.split('\n').map((line, idx) => (
                <span key={idx} className="block" style={{ color: '#E48200' }}>
                  {line}
                </span>
              ))
            : description}
        </p>
      </div>
    </Card>
  );
};
