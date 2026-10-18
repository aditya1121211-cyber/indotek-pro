import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' | 'bottom' }
>(({ className, children, side = 'bottom', ...props }, ref) => {
  const sideClass = side === 'left'
    ? 'left-0 top-0 h-full w-[min(20rem,85vw)]'
    : side === 'right'
      ? 'right-0 top-0 h-full w-[min(20rem,85vw)]'
      : 'bottom-0 left-0 max-h-[90dvh] w-full rounded-t-xl sm:left-1/2 sm:w-[min(100%-2rem,36rem)] sm:-translate-x-1/2';

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn('fixed z-50 overflow-y-auto border border-border bg-surface p-5 text-text shadow-lg outline-none dark:shadow-none', sideClass, className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
SheetContent.displayName = 'SheetContent';
