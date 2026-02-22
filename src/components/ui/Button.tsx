'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-600 active:bg-primary-800 focus-visible:ring-primary-400 shadow-sm',
  secondary:
    'bg-secondary-400 text-primary-700 hover:bg-secondary-300 active:bg-secondary-500 focus-visible:ring-secondary-300 shadow-sm',
  outline:
    'border-2 border-primary-700 text-primary-700 bg-transparent hover:bg-primary-700 hover:text-white active:bg-primary-800 focus-visible:ring-primary-400',
  ghost:
    'text-primary-700 bg-transparent hover:bg-luxury-100 active:bg-luxury-200 focus-visible:ring-luxury-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-7 py-3.5 text-lg gap-2.5',
};

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg ' +
  'transition-all duration-200 ease-in-out cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  href,
  ...rest
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    loading && 'pointer-events-none',
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}
