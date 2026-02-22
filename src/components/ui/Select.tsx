// =============================================================================
// THE A 5995 - Select Component
// =============================================================================

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Visible label above the select */
  label?: string;
  /** Error message to display below the select */
  error?: string;
  /** Helper text shown below the select when no error is present */
  helperText?: string;
  /** Options to render */
  options: SelectOption[];
  /** Placeholder option text (empty value) */
  placeholder?: string;
  /** Wrap in full-width container */
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    helperText,
    options,
    placeholder,
    fullWidth = true,
    className,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-primary-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10 text-primary-700',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-luxury-200 focus:border-primary-400 focus:ring-primary-100',
            disabled && 'cursor-not-allowed bg-luxury-50 opacity-60',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${selectId}-error`
              : helperText
                ? `${selectId}-helper`
                : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-luxury-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          className="flex items-center gap-1 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${selectId}-helper`}
          className="text-sm text-luxury-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
