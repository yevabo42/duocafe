import { type InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-coffee-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            'h-11 w-full rounded-xl border px-4 text-base text-coffee-900 placeholder:text-coffee-300 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
            error
              ? 'border-error bg-red-50 focus:ring-error'
              : 'border-coffee-200 bg-white hover:border-coffee-400',
            'disabled:cursor-not-allowed disabled:bg-coffee-50 disabled:text-coffee-400',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {hint && !error && <p className="text-sm text-coffee-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
