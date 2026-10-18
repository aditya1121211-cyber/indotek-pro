import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
  secondary: 'bg-surface-2 text-text hover:bg-border focus-visible:ring-primary-500',
  outline: 'border border-border-strong bg-surface text-text hover:bg-surface-2 focus-visible:ring-primary-500',
  ghost: 'text-text hover:bg-surface-2 focus-visible:ring-primary-500',
  destructive: 'bg-danger text-white hover:opacity-90 focus-visible:ring-danger',
  accent: 'bg-accent-500 text-slate-950 hover:bg-accent-600 focus-visible:ring-accent-500',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
