import type { InputHTMLAttributes } from 'react';
import { cn } from './utils';
import { Input } from './Input';

export function DatePicker({
  label,
  hint,
  error,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <Input
      {...props}
      type="date"
      label={label}
      hint={hint}
      error={error}
      className={cn('min-h-11', className)}
    />
  );
}
