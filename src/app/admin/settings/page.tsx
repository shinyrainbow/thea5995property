'use client';

// =============================================================================
// THE A 5995 - Admin Settings Page
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Settings,
  User,
  Globe,
  Layout,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'homepage' | 'general';

interface HomepageSection {
  id: number;
  section_type: string;
  title_en: string;
  title_th: string;
  title_zh: string;
  is_active: boolean;
  sort_order: number;
}

// Fallback labels for section types (in case DB has no title)
const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  featured_properties: 'Featured Properties',
  about: 'About Section',
  services: 'Services',
  testimonials: 'Testimonials',
  cta: 'Call to Action',
  stats: 'Statistics',
  partners: 'Partners',
};

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations('admin');

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Homepage sections state
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Fetch homepage sections from DB
  const fetchSections = useCallback(async () => {
    setSectionsLoading(true);
    try {
      const res = await fetch('/api/homepage-sections');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setSections(json.data);
        } else {
          // If no sections in DB yet, seed with defaults
          await seedDefaultSections();
        }
      }
    } catch (err) {
      console.error('Failed to fetch homepage sections:', err);
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // Seed default sections if none exist
  const seedDefaultSections = async () => {
    try {
      const res = await fetch('/api/homepage-sections/seed', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setSections(json.data || []);
      }
    } catch (err) {
      console.error('Failed to seed homepage sections:', err);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Toggle a section's visibility
  const toggleSection = (sectionId: number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, is_active: !s.is_active } : s)),
    );
  };

  // Save homepage section changes
  const handleSaveHomepage = async () => {
    setIsSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    try {
      const payload = sections.map((s, index) => ({
        id: s.id,
        is_active: s.is_active,
        sort_order: index,
      }));

      const res = await fetch('/api/homepage-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setSavedMessage(t('settingsSaved'));
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save settings');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // General save handler (placeholder for profile/general tabs)
  const handleSave = async () => {
    if (activeTab === 'homepage') {
      await handleSaveHomepage();
      return;
    }

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
    { key: 'homepage' as const, label: t('homepage'), icon: Layout },
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

            {/* Homepage Tab */}
            {activeTab === 'homepage' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-luxury-200">
                  <Layout className="w-5 h-5 text-secondary-400" />
                  <h2 className="text-lg font-heading font-semibold text-primary-700">
                    {t('homepageSections')}
                  </h2>
                </div>

                <p className="text-sm text-luxury-500">
                  {t('homepageSectionsDescription')}
                </p>

                {sectionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-secondary-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border transition-colors',
                          section.is_active
                            ? 'border-luxury-200 bg-white'
                            : 'border-luxury-100 bg-luxury-50 opacity-60',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab text-luxury-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8h16M4 16h16"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary-700">
                              {section.title_en || SECTION_LABELS[section.section_type] || section.section_type}
                            </p>
                            <p className="text-xs text-luxury-400">{section.section_type}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className={cn(
                            'relative w-9 h-5 rounded-full transition-colors duration-200',
                            section.is_active ? 'bg-secondary-400' : 'bg-luxury-300',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm',
                              section.is_active && 'translate-x-4',
                            )}
                          />
                        </button>
                      </div>
                    ))}

                    {sections.length === 0 && !sectionsLoading && (
                      <p className="text-sm text-luxury-400 text-center py-8">
                        {t('noSectionsFound')}
                      </p>
                    )}
                  </div>
                )}
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
