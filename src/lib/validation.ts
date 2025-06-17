
// Input validation and sanitization utilities

export const validateAndSanitize = {
  // Sanitize string input - remove potentially harmful characters
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>'"&]/g, '') // Remove basic XSS characters
      .trim()
      .substring(0, 200); // Limit length
  },

  // Validate and sanitize email
  email: (email: string): { isValid: boolean; sanitized: string } => {
    const sanitized = email.trim().toLowerCase().substring(0, 100);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(sanitized),
      sanitized
    };
  },

  // Validate and sanitize phone number
  phone: (phone: string): { isValid: boolean; sanitized: string } => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    const sanitized = digitsOnly.substring(0, 15); // Max international phone length
    
    // Brazilian phone validation (8-11 digits)
    const isValid = sanitized.length >= 8 && sanitized.length <= 11;
    
    return {
      isValid,
      sanitized: sanitized
    };
  },

  // Validate financial amounts
  financialAmount: (amount: string | number): { isValid: boolean; value: number } => {
    const numericValue = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^\d.-]/g, ''))
      : amount;
    
    const isValid = !isNaN(numericValue) && 
                   numericValue >= 0 && 
                   numericValue <= 999999999; // Reasonable upper limit
    
    return {
      isValid,
      value: isValid ? numericValue : 0
    };
  },

  // Validate age
  age: (age: string | number): { isValid: boolean; value: number } => {
    const numericValue = typeof age === 'string' ? parseInt(age) : age;
    const isValid = !isNaN(numericValue) && numericValue >= 1 && numericValue <= 120;
    
    return {
      isValid,
      value: isValid ? numericValue : 0
    };
  },

  // Validate percentage
  percentage: (percentage: string | number): { isValid: boolean; value: number } => {
    const numericValue = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    const isValid = !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100;
    
    return {
      isValid,
      value: isValid ? numericValue : 0
    };
  }
};

// CSV sanitization - prevent formula injection
export const sanitizeCSVValue = (value: string): string => {
  if (typeof value !== 'string') return String(value);
  
  // Remove or escape potentially dangerous characters that could be interpreted as formulas
  const dangerous = /^[=+\-@]/;
  if (dangerous.test(value)) {
    return "'" + value; // Prefix with single quote to treat as text
  }
  
  // Escape double quotes and wrap in quotes if contains comma/newline
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  
  return value;
};
