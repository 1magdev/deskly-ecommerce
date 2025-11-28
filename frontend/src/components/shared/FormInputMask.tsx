import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface FormInputMaskProps {
  label: string;
  error?: string;
  mask: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

const applyMask = (value: string, mask: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  let result = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      result += cleanValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
};

export function FormInputMask({
  label,
  error,
  className,
  id,
  mask,
  value = '',
  onChange,
  onBlur,
  disabled,
  required,
  placeholder,
}: FormInputMaskProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && value) {
      const maskedValue = applyMask(value, mask);
      if (inputRef.current.value !== maskedValue) {
        inputRef.current.value = maskedValue;
      }
    }
  }, [value, mask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
    const oldValue = input.value;
    const newValue = applyMask(input.value, mask);

    input.value = newValue;

    let newCursorPosition = cursorPosition;
    if (newValue.length > oldValue.length) {
      newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
    } else if (newValue.length < oldValue.length && cursorPosition > 0) {
      newCursorPosition = cursorPosition - 1;
    }

    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });

    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && 'border-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
