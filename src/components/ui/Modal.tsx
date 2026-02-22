// =============================================================================
// THE A 5995 - Modal Component
// =============================================================================

'use client';

import {
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal requests to close */
  onClose: () => void;
  /** Modal title rendered in the header */
  title?: string;
  /** Main content */
  children: ReactNode;
  /** Optional footer (buttons, etc.) */
  footer?: ReactNode;
  /** Max width class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Whether clicking the overlay closes the modal (default: true) */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEscape?: boolean;
  /** Additional class for the modal panel */
  className?: string;
}

// ---------------------------------------------------------------------------
// Width map
// ---------------------------------------------------------------------------

const maxWidthStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ---- Escape key handler ----
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the panel for accessibility
      panelRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // ---- Overlay click handler ----
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden',
          'rounded-xl bg-white shadow-2xl',
          'animate-slide-up',
          maxWidthStyles[maxWidth],
          className,
        )}
      >
        {/* Header */}
        {(title || true) && (
          <div className="flex items-center justify-between border-b border-luxury-100 px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="font-heading text-lg font-semibold text-primary-700"
              >
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'ml-auto rounded-lg p-1.5 text-luxury-500 transition-colors',
                'hover:bg-luxury-100 hover:text-primary-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
              )}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-luxury-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
