'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterSchemaType } from '@/lib/validations';
import { Eye, EyeOff, Lock, Mail, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to create account');
        return;
      }

      router.push('/admin/login?registered=true');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo-image.png"
            alt="The A 5995 Property"
            width={160}
            height={160}
            className="mx-auto h-28 w-auto brightness-0 invert mb-4"
            priority
          />
          <p className="text-primary-200 mt-2 text-sm tracking-luxury uppercase">
            Admin Portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-heading font-semibold text-primary-700 mb-6 text-center">
            Create Account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  className={inputClass}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className={inputClass}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  className="w-full pl-11 pr-12 py-3 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-600 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="w-full pl-11 pr-12 py-3 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 hover:text-primary-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-700 hover:bg-primary-800 disabled:bg-primary-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-700/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-luxury-500">
            Already have an account?{' '}
            <Link href="/admin/login" className="text-secondary-500 hover:text-secondary-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          &copy; {new Date().getFullYear()} THE A 5995 Real Estate. All rights reserved.
        </p>
      </div>
    </div>
  );
}
