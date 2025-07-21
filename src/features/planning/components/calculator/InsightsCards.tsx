import React from 'react';
import { InsightCard } from './insights/InsightCard';
import { useInsightsData } from './insights/useInsightsData';
import type { InvestorProfile } from './types';

interface InsightsCardsProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  possibleRetirementAge: number;
}

export const InsightsCards: React.FC<InsightsCardsProps> = (props) => {
  const insights = useInsightsData(props);

  return (
    <div className="w-[90%] mx-auto mb-8 sm:mb-16">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            title={insight.title}
            value={insight.value}
            description={insight.description}
            isCurrency={insight.isCurrency}
            suffix={insight.suffix}
            showValueAsDescription={insight.showValueAsDescription}
          />
        ))}
      </div>
    </div>
  );
};
