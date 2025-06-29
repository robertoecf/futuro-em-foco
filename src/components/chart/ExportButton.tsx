import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import type { ChartDataPoint } from '@/utils/csvExport';

interface ExportButtonProps {
  chartData: ChartDataPoint[];
  planningInputs: {
    initialAmount: number;
    monthlyAmount: number;
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    retirementIncome: number;
    portfolioReturn: number;
    investorProfile: InvestorProfile;
  };
  calculationResult: CalculationResult | null;
}

export const ExportButton = ({
  chartData,
  planningInputs,
  calculationResult,
}: ExportButtonProps) => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  const handleExportClick = () => {
    setIsLeadFormOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleExportClick}
        variant="outline"
        size="sm"
        className="glass-card hover:opacity-80 border-foreground/20 text-foreground p-2"
      >
        <Download className="w-4 h-4" />
      </Button>

      <LeadCaptureForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        planningInputs={planningInputs}
        calculationResult={calculationResult}
        exportData={{
          chartData,
          type: 'excel',
        }}
      />
    </>
  );
};
