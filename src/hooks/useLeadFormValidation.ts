
import { useState } from 'react';
import { validateAndSanitize } from '@/lib/validation';

interface FormData {
  name: string;
  email: string;
  phone: string;
  wantsExpertEvaluation: boolean;
}

export const useLeadFormValidation = () => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData) => {
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

  const clearErrors = () => setFormErrors({});

  return {
    formErrors,
    validateForm,
    clearErrors
  };
};
