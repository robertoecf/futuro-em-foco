
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
}

export const LeadCaptureForm = ({
  isOpen,
  onClose,
  planningInputs,
  calculationResult
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
      // Salvar dados do planejamento
      const planId = savePlanningData(formData, planningInputs, calculationResult);
      const planUrl = getPlanningUrl(planId);

      // Simular envio do email
      await sendPlanByEmail(formData, planUrl);

      toast({
        title: "Plano enviado com sucesso!",
        description: `Enviamos seu planejamento para ${formData.email}. Verifique sua caixa de entrada.`,
      });

      // Resetar formulário e fechar modal
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
        title: "Erro ao enviar",
        description: "Houve um erro ao enviar seu plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receber plano por email</DialogTitle>
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
              {isSubmitting ? 'Enviando...' : 'Receber plano'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
