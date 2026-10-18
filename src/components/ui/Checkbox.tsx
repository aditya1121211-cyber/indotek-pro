import type { InputHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from './utils';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  indeterminate?: boolean;
};

export function Checkbox({ label, id, className, indeterminate = false, ...props }: CheckboxProps) {
  const inputId = id ?? props.name;
  const StateIcon = indeterminate ? Minus : Check;
  return (
    <label htmlFor={inputId} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text">
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <input
          id={inputId}
          type="checkbox"
          ref={(element) => {
            if (element) element.indeterminate = indeterminate;
          }}
          className={cn('peer h-5 w-5 appearance-none rounded-[6px] border border-border-strong bg-surface checked:border-primary-700 checked:bg-primary-700 indeterminate:border-primary-700 indeterminate:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50', className)}
          {...props}
        />
        <StateIcon className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100" aria-hidden="true" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
