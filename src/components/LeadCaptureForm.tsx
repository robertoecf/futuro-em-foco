import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlanningData } from '@/hooks/usePlanningData';
import { useLeadFormValidation } from '@/hooks/useLeadFormValidation';
import { LeadFormFields } from '@/components/forms/LeadFormFields';
import { generateSecureExcelFile, type ChartDataPoint } from '@/utils/csvExport';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { saveLeadToSupabase } from '@/integrations/supabase/client';

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
    chartData: ChartDataPoint[];
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
    wantsExpertEvaluation: true,
    patrimonioRange: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { savePlanningData, getPlanningUrl, sendPlanByEmail } = usePlanningData();
  const { formErrors, validateForm, clearErrors } = useLeadFormValidation();

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      wantsExpertEvaluation: true,
      patrimonioRange: ''
    });
    clearErrors();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Salvar lead no Supabase
      const { success, error } = await saveLeadToSupabase({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        wants_expert_evaluation: formData.wantsExpertEvaluation,
        patrimonio_range: formData.patrimonioRange,
      });
      if (!success) {
        toast({
          title: "Erro ao salvar lead",
          description: error || 'Erro desconhecido ao salvar no Supabase.',
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (exportData) {
        generateSecureExcelFile(exportData.chartData, formData);
        
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

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : (exportData ? "Houve um erro ao gerar o arquivo." : "Houve um erro ao enviar seu plano. Tente novamente."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExportMode = !!exportData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border border-white/8">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isExportMode ? 'Download dos dados' : 'Dados para contato'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <LeadFormFields
            formData={formData}
            formErrors={formErrors}
            onFormDataChange={handleFormDataChange}
          />

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 bg-transparent border border-white/8 text-white hover:bg-white/5 hover:scale-105 transition-all"
            >
              Desistir
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Processando...' : (isExportMode ? 'Baixar Excel' : 'Confirmar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
