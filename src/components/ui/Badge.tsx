import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-500',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-neutral-bg text-neutral',
  outline: 'border border-border-strong bg-transparent text-text',
};

export function Badge({ variant = 'default', className, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex min-h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold', variants[variant], className)} {...props} />;
}
