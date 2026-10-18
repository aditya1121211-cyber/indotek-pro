import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none', className)} {...props} />;
}
