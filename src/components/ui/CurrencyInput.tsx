import { useEffect, useState, type FocusEvent, type InputHTMLAttributes } from 'react';
import { formatRupiah, parseRupiah } from '../../utils/format';
import { Input } from './Input';

export function CurrencyInput({
  value,
  onValueChange,
  label,
  hint,
  error,
  id,
  name,
  disabled,
  required,
  placeholder = 'Rp 0',
  className,
  onFocus,
  onBlur,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  label?: string;
  hint?: string;
  error?: string;
}) {
  const [displayValue, setDisplayValue] = useState(formatRupiah(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDisplayValue(formatRupiah(value));
  }, [isEditing, value]);

  return (
    <Input
      id={id}
      name={name}
      label={label}
      hint={hint}
      error={error}
      value={displayValue}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={className}
      onChange={(event) => {
        const inputValue = event.currentTarget.value.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
        setDisplayValue(inputValue);
        onValueChange(parseRupiah(inputValue));
      }}
      onFocus={(event: FocusEvent<HTMLInputElement>) => {
        setIsEditing(true);
        setDisplayValue(value ? String(Math.round(value)) : '');
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        setIsEditing(false);
        setDisplayValue(formatRupiah(parseRupiah(event.currentTarget.value)));
        onBlur?.(event);
      }}
      {...props}
    />
  );
}
