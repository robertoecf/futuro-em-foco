
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlanningData } from '@/hooks/usePlanningData';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { validateAndSanitize, sanitizeCSVValue } from '@/lib/validation';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { savePlanningData, getPlanningUrl, sendPlanByEmail } = usePlanningData();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate name
    const sanitizedName = validateAndSanitize.sanitizeString(formData.name);
    if (!sanitizedName || sanitizedName.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validate email
    const emailValidation = validateAndSanitize.email(formData.email);
    if (!emailValidation.isValid) {
      errors.email = 'Email inválido';
    }

    // Validate phone (optional)
    if (formData.phone) {
      const phoneValidation = validateAndSanitize.phone(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = 'Telefone inválido';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateSecureExcelFile = (chartData: any[], userData: any) => {
    // Create CSV content with proper sanitization
    const headers = ['Idade', 'Patrimonio', 'Total_Poupado', 'Fase'];
    
    // Add Monte Carlo headers if available
    if (chartData[0]?.pessimistic !== undefined) {
      headers.push('Cenario_Pessimista', 'Cenario_Neutro', 'Cenario_Otimista');
    }
    
    const csvContent = [
      headers.map(h => sanitizeCSVValue(h)).join(','),
      ...chartData.map(row => {
        const basicData = [
          sanitizeCSVValue(row.age?.toString() || ''),
          sanitizeCSVValue(row.patrimonio?.toFixed(2) || ''),
          sanitizeCSVValue(row.poupanca?.toFixed(2) || ''),
          sanitizeCSVValue(row.fase || '')
        ];
        
        if (row.pessimistic !== undefined) {
          basicData.push(
            sanitizeCSVValue(row.pessimistic?.toFixed(2) || ''),
            sanitizeCSVValue(row.median?.toFixed(2) || ''),
            sanitizeCSVValue(row.optimistic?.toFixed(2) || '')
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
    
    const sanitizedName = validateAndSanitize.sanitizeString(userData.name);
    const fileName = `planejamento_aposentadoria_${sanitizedName.replace(/\s+/g, '_')}.csv`;
    link.setAttribute('download', fileName);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
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

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        wantsExpertEvaluation: false
      });
      setFormErrors({});
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
              maxLength={100}
              required
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
              maxLength={100}
              required
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              maxLength={15}
            />
            {formErrors.phone && (
              <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
            )}
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
