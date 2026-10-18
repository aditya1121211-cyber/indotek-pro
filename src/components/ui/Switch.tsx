import type { ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
};

export function Switch({ checked, onCheckedChange, label, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex min-h-11 items-center gap-3 text-left text-sm text-text disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-primary-700' : 'bg-border-strong')}>
        <span className={cn('absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform', checked && 'translate-x-5')} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
