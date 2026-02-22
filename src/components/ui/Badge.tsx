// =============================================================================
// THE A 5995 - Badge Component
// =============================================================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Render a small dot before text */
  dot?: boolean;
}

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-luxury-100 text-luxury-700 border-luxury-200',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200',
  danger:
    'bg-red-50 text-red-700 border-red-200',
  info:
    'bg-blue-50 text-blue-700 border-blue-200',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-luxury-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Badge({
  children,
  variant = 'default',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-xs font-semibold leading-5 whitespace-nowrap',
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
