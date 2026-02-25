'use client';

// =============================================================================
// THE A 5995 - Admin Settings Page
// =============================================================================

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Settings,
  User,
  Globe,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'general';

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('admin');

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMessage(null);

    // Placeholder for profile and general settings
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSavedMessage(t('settingsSaved'));
    setIsSaving(false);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const settingsTabs = [
    { key: 'profile' as const, label: t('profile'), icon: User },
    { key: 'general' as const, label: t('generalSettings'), icon: Globe },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl border border-luxury-200 overflow-hidden">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors border-l-2',
                    activeTab === tab.key
                      ? 'border-l-secondary-400 bg-secondary-50/50 text-secondary-600'
                      : 'border-l-transparent text-luxury-500 hover:bg-luxury-50 hover:text-primary-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-luxury-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
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
                      className={inputClass}
                      placeholder={t('fullName')}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>{t('currentPassword')}</label>
                      <input
                        type="password"
                        className={inputClass}
                        placeholder={t('currentPassword')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('newPassword')}</label>
                      <input
                        type="password"
                        className={inputClass}
                        placeholder={t('newPassword')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-luxury-200">
                  <Globe className="w-5 h-5 text-secondary-400" />
                  <h2 className="text-lg font-heading font-semibold text-primary-700">
                    {t('generalSettings')}
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>{t('siteName')}</label>
                    <input
                      type="text"
                      defaultValue="THE A 5995"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{t('siteDescription')}</label>
                    <textarea
                      defaultValue="Discover exceptional luxury properties across Thailand."
                      rows={3}
                      className={cn(inputClass, 'resize-y')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>{t('contactEmail')}</label>
                      <input
                        type="email"
                        defaultValue="thea5995property@gmail.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t('contactPhone')}</label>
                      <input
                        type="tel"
                        defaultValue="083-017-5957"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t('defaultCurrency')}</label>
                    <select className={inputClass} defaultValue="THB">
                      <option value="THB">Thai Baht (THB)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t('defaultLanguage')}</label>
                    <select className={inputClass} defaultValue="en">
                      <option value="en">English</option>
                      <option value="th">Thai</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-luxury-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:bg-primary-400 transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('saveSettings')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
