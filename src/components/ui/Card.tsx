// =============================================================================
// THE A 5995 - Card Component
// =============================================================================

import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Optional hover effect: shadow lift */
  hover?: boolean;
  /** Remove padding from the card body */
  noPadding?: boolean;
}

export interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Aspect ratio class, e.g. 'aspect-video', 'aspect-[4/3]' */
  aspect?: string;
  /** Overlay content rendered on top of the image */
  overlay?: ReactNode;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function CardImage({
  src,
  alt,
  className,
  aspect = 'aspect-video',
  overlay,
}: CardImageProps) {
  return (
    <div className={cn('relative overflow-hidden', aspect, className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {overlay && (
        <div className="absolute inset-0">{overlay}</div>
      )}
    </div>
  );
}

function CardHeader({ children, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn('px-5 pt-5 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn('px-5 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ children, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        'px-5 pb-5 pt-0 border-t border-luxury-100 mt-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Card
// ---------------------------------------------------------------------------

function Card({
  children,
  hover = false,
  noPadding = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white',
        'transition-all duration-300',
        hover &&
          'hover:shadow-lg hover:shadow-luxury-200/50 hover:-translate-y-1',
        !noPadding && 'p-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

Card.Image = CardImage;
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
