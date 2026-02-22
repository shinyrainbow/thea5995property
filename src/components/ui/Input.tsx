// =============================================================================
// THE A 5995 - Input Component
// =============================================================================

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text shown below the input when no error is present */
  helperText?: string;
  /** Optional icon or element inside the input on the left */
  startAdornment?: ReactNode;
  /** Optional icon or element inside the input on the right */
  endAdornment?: ReactNode;
  /** Wrap in full-width container */
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    startAdornment,
    endAdornment,
    fullWidth = true,
    className,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-primary-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startAdornment && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-luxury-500">
            {startAdornment}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-primary-700',
            'placeholder:text-luxury-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-luxury-200 focus:border-primary-400 focus:ring-primary-100',
            disabled && 'cursor-not-allowed bg-luxury-50 opacity-60',
            !!startAdornment && 'pl-10',
            !!endAdornment && 'pr-10',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-luxury-500">
            {endAdornment}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="text-sm text-luxury-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
