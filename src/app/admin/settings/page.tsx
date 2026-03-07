'use client';

// =============================================================================
// THE A 5995 - Admin Settings Page
// =============================================================================

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Settings,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('admin');

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    setErrorMessage(null);
    setSavedMessage(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage(t('allFieldsRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage(t('passwordsDoNotMatch'));
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage(t('passwordMustBeDifferent'));
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || t('passwordChangeFailed'));
        return;
      }

      setSavedMessage(t('passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch {
      setErrorMessage(t('passwordChangeFailed'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-primary-600 mb-1.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-primary-700 flex items-center gap-2">
          <Settings className="w-7 h-7 text-secondary-400" />
          {t('settings')}
        </h1>
        <p className="text-luxury-500 mt-1">{t('settingsDescription')}</p>
      </div>

      {/* Success message */}
      {savedMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-luxury-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-luxury-200">
            <Shield className="w-5 h-5 text-secondary-400" />
            <h2 className="text-lg font-heading font-semibold text-primary-700">
              {t('adminProfile')}
            </h2>
          </div>

          <div className="flex items-center gap-4 p-4 bg-luxury-50 rounded-xl">
            <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-primary-700 text-lg">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-luxury-500 text-sm">
                {session?.user?.email || 'admin@thea5995.com'}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-700 text-white text-xs font-medium rounded-full">
                {session?.user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>{t('fullName')}</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                className={cn(inputClass, 'bg-luxury-50')}
                disabled
              />
            </div>
            <div>
              <label className={labelClass}>{t('emailAddress')}</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                className={cn(inputClass, 'bg-luxury-50')}
                disabled
              />
              <p className="mt-1 text-xs text-luxury-400">
                {t('emailCannotChange')}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary-700 mb-3 uppercase tracking-wider">
              {t('changePassword')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder={t('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 hover:text-primary-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder={t('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-400 hover:text-primary-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-luxury-400">{t('passwordMinLengthHint')}</p>
                </div>
                <div>
                  <label className={labelClass}>{t('confirmNewPassword')}</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder={t('confirmNewPassword')}
                  />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                  className="px-5 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 disabled:bg-luxury-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('changingPassword')}
                    </>
                  ) : (
                    t('changePassword')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
