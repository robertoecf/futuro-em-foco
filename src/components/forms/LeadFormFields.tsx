
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface FormData {
  name: string;
  email: string;
  phone: string;
  wantsExpertEvaluation: boolean;
}

interface LeadFormFieldsProps {
  formData: FormData;
  formErrors: Record<string, string>;
  onFormDataChange: (data: Partial<FormData>) => void;
}

export const LeadFormFields = ({ formData, formErrors, onFormDataChange }: LeadFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => onFormDataChange({ name: e.target.value })}
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
          onChange={(e) => onFormDataChange({ email: e.target.value })}
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
          onChange={(e) => onFormDataChange({ phone: e.target.value })}
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
            onFormDataChange({ wantsExpertEvaluation: checked as boolean })
          }
        />
        <Label htmlFor="expert" className="text-sm">
          Quero avaliação de um especialista
        </Label>
      </div>
    </>
  );
};
