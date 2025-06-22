import React, { useState, useRef } from 'react';
import { Input } from './input';

interface NumberInputWithArrowsProps {
  id?: string;
  value: number;
  onBlur?: (value: string) => void;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

export const NumberInputWithArrows: React.FC<NumberInputWithArrowsProps> = ({
  id,
  value,
  onBlur,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className = "glass-input"
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [hasBeenInteracted, setHasBeenInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sempre mostrar o valor se ele for diferente de 0, ou se houver interação
  React.useEffect(() => {
    if (value !== 0) {
      setDisplayValue(String(value));
    } else if (hasBeenInteracted) {
      setDisplayValue('');
    } else {
      // Se valor é 0 e não houve interação, deixar vazio
      setDisplayValue('');
    }
  }, [value, hasBeenInteracted]);

  const handleIncrement = () => {
    // Se não há valor, usar o valor do placeholder ou o mínimo
    let baseValue;
    if (displayValue === '') {
      // Tentar extrair valor do placeholder se possível
      const placeholderValue = placeholder ? parseInt(placeholder.split(' ')[0]) : null;
      baseValue = placeholderValue || min || 0;
    } else {
      baseValue = parseFloat(displayValue) || 0;
    }
    
    const newValue = baseValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    
    setHasBeenInteracted(true);
    setDisplayValue(finalValue.toString());
    onChange?.(finalValue);
    inputRef.current?.focus();
  };

  const handleDecrement = () => {
    // Se não há valor, usar o valor do placeholder ou o mínimo
    let baseValue;
    if (displayValue === '') {
      // Tentar extrair valor do placeholder se possível
      const placeholderValue = placeholder ? parseInt(placeholder.split(' ')[0]) : null;
      baseValue = placeholderValue || min || 0;
    } else {
      baseValue = parseFloat(displayValue) || 0;
    }
    
    const newValue = baseValue - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    
    setHasBeenInteracted(true);
    setDisplayValue(finalValue.toString());
    onChange?.(finalValue);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasBeenInteracted(true);
    const value = e.target.value;
    
    // Permitir apenas números, pontos e valores vazios
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDisplayValue(value);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(e.target.value);
    if (!isNaN(numericValue)) {
      let finalValue = numericValue;
      if (min !== undefined) finalValue = Math.max(finalValue, min);
      if (max !== undefined) finalValue = Math.min(finalValue, max);
      setDisplayValue(finalValue.toString());
      onChange?.(finalValue);
    } else if (e.target.value === '') {
      // Se o campo estiver vazio ao perder o foco, manter vazio
      setDisplayValue('');
    }
    onBlur?.(e.target.value);
  };

  const handleInputFocus = () => {
    setHasBeenInteracted(true);
    // Quando clicar no campo, se estiver vazio, manter vazio
    if (displayValue === '') {
      inputRef.current?.select(); // Seleciona tudo (que é nada neste caso)
    }
  };

  return (
    <div className="input-with-arrows">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={className}
        style={{ paddingRight: '40px' }}
      />
      <div className="input-arrows">
        <div className="input-arrow" onClick={handleIncrement}>
          ∧
        </div>
        <div className="input-arrow" onClick={handleDecrement}>
          ∨
        </div>
      </div>
    </div>
  );
}; 