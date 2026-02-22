'use client';

// =============================================================================
// THE A 5995 - Admin Settings Page
// =============================================================================

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  User,
  Globe,
  Layout,
  Shield,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'homepage' | 'general';

interface Tab {
  key: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsTabs: Tab[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'homepage', label: 'Homepage', icon: Layout },
  { key: 'general', label: 'General', icon: Globe },
];

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMessage(null);

    // Simulate save (placeholder for actual implementation)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSavedMessage('Settings saved successfully');
    setIsSaving(false);

    setTimeout(() => setSavedMessage(null), 3000);
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
          Settings
        </h1>
        <p className="text-luxury-500 mt-1">Manage your account and site settings</p>
      </div>

      {/* Success message */}
      {savedMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{savedMessage}</span>
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
                    Admin Profile
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
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ''}
                      className={inputClass}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email || ''}
                      className={cn(inputClass, 'bg-luxury-50')}
                      disabled
                    />
                    <p className="mt-1 text-xs text-luxury-400">
                      Email cannot be changed here
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-primary-700 mb-3 uppercase tracking-wider">
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input
                        type="password"
                        className={inputClass}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input
                        type="password"
                        className={inputClass}
                        placeholder="Enter new password"
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
                    Homepage Sections
                  </h2>
                </div>

                <p className="text-sm text-luxury-500">
                  Manage the sections displayed on the homepage. Drag to reorder, toggle visibility.
                </p>

                {/* Section list (placeholder) */}
                <div className="space-y-3">
                  {[
                    { name: 'Hero Banner', type: 'hero', active: true },
                    { name: 'Featured Properties', type: 'featured_properties', active: true },
                    { name: 'About Section', type: 'about', active: true },
                    { name: 'Services', type: 'services', active: false },
                    { name: 'Testimonials', type: 'testimonials', active: false },
                    { name: 'Call to Action', type: 'cta', active: true },
                    { name: 'Statistics', type: 'stats', active: false },
                    { name: 'Partners', type: 'partners', active: false },
                  ].map((section) => (
                    <div
                      key={section.type}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg border transition-colors',
                        section.active
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
                          <p className="text-sm font-medium text-primary-700">{section.name}</p>
                          <p className="text-xs text-luxury-400">{section.type}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={section.active}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-luxury-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                  Homepage section management is a placeholder. Full implementation will allow
                  editing content for each section and saving to the database.
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-luxury-200">
                  <Globe className="w-5 h-5 text-secondary-400" />
                  <h2 className="text-lg font-heading font-semibold text-primary-700">
                    General Settings
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Site Name</label>
                    <input
                      type="text"
                      defaultValue="THE A 5995"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Site Description</label>
                    <textarea
                      defaultValue="Discover exceptional luxury properties across Thailand."
                      rows={3}
                      className={cn(inputClass, 'resize-y')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Contact Email</label>
                      <input
                        type="email"
                        defaultValue="info@thea5995.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Phone</label>
                      <input
                        type="tel"
                        defaultValue="+66 2 XXX XXXX"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Default Currency</label>
                    <select className={inputClass} defaultValue="THB">
                      <option value="THB">Thai Baht (THB)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Default Language</label>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
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
