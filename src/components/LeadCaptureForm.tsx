
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlanningData } from '@/hooks/usePlanningData';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';

interface LeadCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
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
  exportData?: {
    chartData: any[];
    type: 'excel';
  };
}

export const LeadCaptureForm = ({
  isOpen,
  onClose,
  planningInputs,
  calculationResult,
  exportData
}: LeadCaptureFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wantsExpertEvaluation: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { savePlanningData, getPlanningUrl, sendPlanByEmail } = usePlanningData();

  const generateExcelFile = (chartData: any[], userData: any) => {
    // Create CSV content (Excel-compatible)
    const headers = ['Idade', 'Patrimonio', 'Total_Poupado', 'Fase'];
    
    // Add Monte Carlo headers if available
    if (chartData[0]?.pessimistic !== undefined) {
      headers.push('Cenario_Pessimista', 'Cenario_Neutro', 'Cenario_Otimista');
    }
    
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => {
        const basicData = [
          row.age,
          row.patrimonio.toFixed(2),
          row.poupanca.toFixed(2),
          `"${row.fase}"`
        ];
        
        if (row.pessimistic !== undefined) {
          basicData.push(
            row.pessimistic.toFixed(2),
            row.median.toFixed(2),
            row.optimistic.toFixed(2)
          );
        }
        
        return basicData.join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planejamento_aposentadoria_${userData.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate Excel file if export data is provided
      if (exportData) {
        generateExcelFile(exportData.chartData, formData);
        
        toast({
          title: "Arquivo baixado com sucesso!",
          description: "O arquivo Excel com os dados foi baixado para seu computador.",
        });
      } else {
        // Regular email flow
        const planId = savePlanningData(formData, planningInputs, calculationResult);
        const planUrl = getPlanningUrl(planId);
        await sendPlanByEmail(formData, planUrl);

        toast({
          title: "Plano enviado com sucesso!",
          description: `Enviamos seu planejamento para ${formData.email}. Verifique sua caixa de entrada.`,
        });
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        wantsExpertEvaluation: false
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro ao processar",
        description: exportData ? "Houve um erro ao gerar o arquivo." : "Houve um erro ao enviar seu plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExportMode = !!exportData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isExportMode ? 'Download dos dados' : 'Receber plano por email'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="expert"
              checked={formData.wantsExpertEvaluation}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, wantsExpertEvaluation: checked as boolean }))
              }
            />
            <Label htmlFor="expert" className="text-sm">
              Quero avaliação de um especialista
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Processando...' : (isExportMode ? 'Baixar Excel' : 'Receber plano')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
