import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  name: string;
  email: string;
  phone: string;
  wantsExpertEvaluation: boolean;
  patrimonioRange: string;
}

interface LeadFormFieldsProps {
  formData: FormData;
  formErrors: Record<string, string>;
  onFormDataChange: (data: Partial<FormData>) => void;
}

export const LeadFormFields = ({ formData, formErrors, onFormDataChange }: LeadFormFieldsProps) => {
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : '';
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onFormDataChange({ phone: formatted });
  };

  return (
    <>
      <div>
        <Label htmlFor="name" className="form-text-white dark:text-white">
          Nome *
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) => onFormDataChange({ name: e.target.value })}
          placeholder="Seu nome completo"
          maxLength={100}
          required
          className="form-placeholder-dark form-input-text themed-input"
          autoComplete="name"
        />
        {formErrors.name && <p className="text-sm text-red-400 mt-1">{formErrors.name}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="form-text-white dark:text-white">
          Email *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          placeholder="seu@email.com"
          maxLength={100}
          required
          className="form-placeholder-dark form-input-text themed-input"
          autoComplete="email"
        />
        {formErrors.email && <p className="text-sm text-red-400 mt-1">{formErrors.email}</p>}
      </div>

      <div>
        <Label htmlFor="phone" className="form-text-white dark:text-white">
          Telefone
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="(11) 99999-9999"
          maxLength={15}
          className="form-placeholder-dark form-input-text themed-input"
          autoComplete="tel"
        />
        {formErrors.phone && <p className="text-sm text-red-400 mt-1">{formErrors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="patrimonio-range" className="form-text-white dark:text-white">
          Faixa de patrimônio
        </Label>
        <Select
          name="patrimonioRange"
          value={formData.patrimonioRange}
          onValueChange={(value) => onFormDataChange({ patrimonioRange: value })}
          autoComplete="off"
        >
          <SelectTrigger className="form-placeholder-dark form-input-text themed-input">
            <SelectValue placeholder="Selecione sua faixa de patrimônio" />
          </SelectTrigger>
          <SelectContent className="themed-select-content">
            <SelectItem value="ate-100k" className="themed-select-item">
              Até 100 mil
            </SelectItem>
            <SelectItem value="100k-300k" className="themed-select-item">
              Entre 100 mil e 300 mil
            </SelectItem>
            <SelectItem value="300k-1m" className="themed-select-item">
              Entre 300 mil e 1 milhão
            </SelectItem>
            <SelectItem value="acima-1m" className="themed-select-item">
              Acima de 1 milhão
            </SelectItem>
          </SelectContent>
        </Select>
        {formErrors.patrimonioRange && (
          <p className="text-sm text-red-400 mt-1">{formErrors.patrimonioRange}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="expert"
          name="wantsExpertEvaluation"
          checked={formData.wantsExpertEvaluation}
          onCheckedChange={(checked) =>
            onFormDataChange({ wantsExpertEvaluation: checked as boolean })
          }
          className="border-white/10 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
        />
        <Label htmlFor="expert" className="text-sm form-text-white dark:text-white">
          Quero ajuda de um especialista
        </Label>
      </div>
    </>
  );
};
