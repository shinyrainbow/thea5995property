'use client';

// =============================================================================
// THE A 5995 - Inquiry Form Component
// =============================================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface InquiryFormProps {
  propertyId?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InquiryForm({ propertyId, className }: InquiryFormProps) {
  const t = useTranslations('inquiry');
  const locale = useLocale() as Locale;
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: propertyId ? t('propertyInquiry') : '',
    },
  });

  async function onSubmit(data: InquiryFormData) {
    setSubmitStatus('loading');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          property_id: propertyId || undefined,
          locale,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        // Reset to idle after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  }

  // Success state
  if (submitStatus === 'success') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 p-8 text-center',
          className,
        )}
      >
        <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-2 font-heading text-xl font-semibold text-green-800">
          {t('thankYou')}
        </h3>
        <p className="text-green-600">{t('weWillRespond')}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-luxury-200 bg-white p-6 shadow-sm', className)}>
      <h3 className="mb-6 font-heading text-xl font-semibold text-primary-700">
        {t('title')}
      </h3>

      {/* Error toast */}
      {submitStatus === 'error' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('errorSending')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="inquiry-name"
            className="mb-1.5 block text-sm font-medium text-primary-700"
          >
            {t('name')} <span className="text-red-500">*</span>
          </label>
          <input
            id="inquiry-name"
            type="text"
            placeholder={t('namePlaceholder')}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
            className={cn(
              'w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700',
              'placeholder:text-luxury-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              'transition-colors',
              errors.name && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="inquiry-email"
            className="mb-1.5 block text-sm font-medium text-primary-700"
          >
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <input
            id="inquiry-email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email',
              },
            })}
            className={cn(
              'w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700',
              'placeholder:text-luxury-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              'transition-colors',
              errors.email && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="inquiry-phone"
            className="mb-1.5 block text-sm font-medium text-primary-700"
          >
            {t('phone')}
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            {...register('phone', {
              pattern: {
                value: /^[+]?[\d\s()-]{7,20}$/,
                message: 'Please enter a valid phone number',
              },
            })}
            className={cn(
              'w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700',
              'placeholder:text-luxury-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              'transition-colors',
              errors.phone && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="inquiry-message"
            className="mb-1.5 block text-sm font-medium text-primary-700"
          >
            {t('message')} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="inquiry-message"
            rows={4}
            placeholder={t('messagePlaceholder')}
            {...register('message', {
              required: 'Message is required',
              minLength: { value: 10, message: 'Message must be at least 10 characters' },
            })}
            className={cn(
              'w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700',
              'placeholder:text-luxury-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              'transition-colors resize-none',
              errors.message && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
            )}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitStatus === 'loading'}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-400 px-6 py-3',
            'text-sm font-semibold text-white transition-colors',
            'hover:bg-secondary-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {submitStatus === 'loading' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t('sendInquiry')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
