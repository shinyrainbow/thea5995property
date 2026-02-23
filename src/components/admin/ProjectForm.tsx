'use client';

// =============================================================================
// THE A 5995 - Project Form Component
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectSchemaType } from '@/lib/validations';
import type { ProjectWithDetails, PropertyType } from '@/types';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import { THAI_PROVINCES } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Save,
  Loader2,
  Globe,
  MapPin,
  Home,
  Image as ImageIcon,
  Search,
  AlertCircle,
  X,
  Plus,
} from 'lucide-react';

type TabKey = 'general' | 'thai' | 'chinese' | 'details' | 'location' | 'images' | 'seo';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { key: 'general', label: 'General (EN)', icon: Globe },
  { key: 'thai', label: 'Thai', icon: Globe },
  { key: 'chinese', label: 'Chinese', icon: Globe },
  { key: 'details', label: 'Details', icon: Home },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'images', label: 'Images', icon: ImageIcon },
  { key: 'seo', label: 'SEO', icon: Search },
];

const PRESET_FACILITIES = ['Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Playground', 'Sauna'];

interface ProjectFormProps {
  project?: ProjectWithDetails;
  propertyTypes: PropertyType[];
}

export default function ProjectForm({ project, propertyTypes }: ProjectFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityInput, setFacilityInput] = useState('');
  const [images, setImages] = useState<UploadedImage[]>(
    project?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt_en: img.alt_en,
      alt_th: img.alt_th,
      alt_zh: img.alt_zh,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    })) ?? [],
  );

  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProjectSchemaType>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name_en: project.name_en,
          name_th: project.name_th,
          name_zh: project.name_zh,
          description_en: project.description_en,
          description_th: project.description_th,
          description_zh: project.description_zh,
          property_type_id: project.property_type_id,
          developer_name: project.developer_name || '',
          facilities: project.facilities || [],
          year_built: project.year_built,
          total_units: project.total_units,
          address: project.address,
          district: project.district,
          province: project.province,
          latitude: project.latitude,
          longitude: project.longitude,
          status: project.status,
          seo_title_en: project.seo_title_en || '',
          seo_title_th: project.seo_title_th || '',
          seo_title_zh: project.seo_title_zh || '',
          seo_description_en: project.seo_description_en || '',
          seo_description_th: project.seo_description_th || '',
          seo_description_zh: project.seo_description_zh || '',
        }
      : {
          status: 'draft',
          facilities: [],
        },
  });

  // Map form fields to their tab for error highlighting
  const fieldToTab: Record<string, TabKey> = {
    name_en: 'general',
    description_en: 'general',
    name_th: 'thai',
    description_th: 'thai',
    name_zh: 'chinese',
    description_zh: 'chinese',
    property_type_id: 'details',
    developer_name: 'details',
    facilities: 'details',
    year_built: 'details',
    total_units: 'details',
    address: 'location',
    district: 'location',
    province: 'location',
    latitude: 'location',
    longitude: 'location',
    seo_title_en: 'seo',
    seo_title_th: 'seo',
    seo_title_zh: 'seo',
    seo_description_en: 'seo',
    seo_description_th: 'seo',
    seo_description_zh: 'seo',
  };

  // Get which tabs have errors
  const tabsWithErrors = new Set<TabKey>();
  for (const field of Object.keys(errors)) {
    const tab = fieldToTab[field];
    if (tab) tabsWithErrors.add(tab);
  }

  const onSubmit = async (data: ProjectSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      router.push('/admin/projects');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // On validation error, jump to the first tab with errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onValidationError = (formErrors: any) => {
    const errorFields = Object.keys(formErrors);
    for (const tab of tabs) {
      if (errorFields.some((field: string) => fieldToTab[field] === tab.key)) {
        setActiveTab(tab.key);
        break;
      }
    }
  };

  const status = watch('status');
  const facilities = watch('facilities') || [];

  const addFacility = (facility: string) => {
    const trimmed = facility.trim();
    if (trimmed && !facilities.includes(trimmed)) {
      setValue('facilities', [...facilities, trimmed]);
    }
    setFacilityInput('');
  };

  const removeFacility = (index: number) => {
    setValue(
      'facilities',
      facilities.filter((_, i) => i !== index),
    );
  };

  // Helper for input classes
  const inputClass =
    'w-full px-4 py-2.5 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-primary-600 mb-1.5';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-white rounded-xl border border-luxury-200 p-5 flex flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-primary-600">Status:</label>
          <select
            {...register('status')}
            className="px-3 py-2 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="under_construction">Under Construction</option>
            <option value="completed">Completed</option>
          </select>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              status === 'active'
                ? 'bg-green-100 text-green-700'
                : status === 'draft'
                  ? 'bg-gray-100 text-gray-700'
                  : status === 'under_construction'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700',
            )}
          >
            {status === 'under_construction' ? 'Under Construction' : status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-luxury-200 overflow-hidden">
        <div className="border-b border-luxury-200 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
                    activeTab === tab.key
                      ? 'border-secondary-400 text-secondary-500 bg-secondary-50/50'
                      : 'border-transparent text-luxury-500 hover:text-primary-700 hover:bg-luxury-50',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tabsWithErrors.has(tab.key) && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General (EN) Tab */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Name (English) *</label>
                <input
                  {...register('name_en')}
                  className={inputClass}
                  placeholder="Luxury condominium project in Phuket"
                />
                {errors.name_en && <p className={errorClass}>{errors.name_en.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Description (English) *</label>
                <textarea
                  {...register('description_en')}
                  rows={6}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Describe the project in detail..."
                />
                {errors.description_en && (
                  <p className={errorClass}>{errors.description_en.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Thai Tab */}
          {activeTab === 'thai' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Name (Thai) *</label>
                <input
                  {...register('name_th')}
                  className={inputClass}
                  placeholder="Enter Thai name"
                />
                {errors.name_th && <p className={errorClass}>{errors.name_th.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Description (Thai) *</label>
                <textarea
                  {...register('description_th')}
                  rows={6}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Enter Thai description"
                />
                {errors.description_th && (
                  <p className={errorClass}>{errors.description_th.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Chinese Tab */}
          {activeTab === 'chinese' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Name (Chinese) *</label>
                <input
                  {...register('name_zh')}
                  className={inputClass}
                  placeholder="Enter Chinese name"
                />
                {errors.name_zh && <p className={errorClass}>{errors.name_zh.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Description (Chinese) *</label>
                <textarea
                  {...register('description_zh')}
                  rows={6}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Enter Chinese description"
                />
                {errors.description_zh && (
                  <p className={errorClass}>{errors.description_zh.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Property Type *</label>
                <select
                  {...register('property_type_id')}
                  className={inputClass}
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name_en}
                    </option>
                  ))}
                </select>
                {errors.property_type_id && (
                  <p className={errorClass}>{errors.property_type_id.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Developer Name</label>
                <input
                  {...register('developer_name')}
                  className={inputClass}
                  placeholder="e.g. Sansiri, Land & Houses"
                />
                {errors.developer_name && (
                  <p className={errorClass}>{errors.developer_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Year Built</label>
                  <input
                    type="number"
                    {...register('year_built', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="2024"
                  />
                  {errors.year_built && <p className={errorClass}>{errors.year_built.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Total Units</label>
                  <input
                    type="number"
                    {...register('total_units', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="500"
                  />
                  {errors.total_units && (
                    <p className={errorClass}>{errors.total_units.message}</p>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <label className={labelClass}>Facilities</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFacility(facilityInput);
                      }
                    }}
                    className={inputClass}
                    placeholder="Add a facility..."
                  />
                  <button
                    type="button"
                    onClick={() => addFacility(facilityInput)}
                    className="px-4 py-2.5 bg-secondary-400 text-white rounded-lg text-sm font-medium hover:bg-secondary-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Preset facility buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_FACILITIES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addFacility(preset)}
                      disabled={facilities.includes(preset)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        facilities.includes(preset)
                          ? 'bg-luxury-100 text-luxury-400 cursor-not-allowed'
                          : 'bg-luxury-100 text-primary-600 hover:bg-luxury-200',
                      )}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Facility chips */}
                {facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility, index) => (
                      <span
                        key={`${facility}-${index}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-full text-sm font-medium"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => removeFacility(index)}
                          className="text-secondary-400 hover:text-secondary-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.facilities && <p className={errorClass}>{errors.facilities.message}</p>}
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Address *</label>
                <input
                  {...register('address')}
                  className={inputClass}
                  placeholder="123 Beach Road, Soi 5"
                />
                {errors.address && <p className={errorClass}>{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>District *</label>
                  <input
                    {...register('district')}
                    className={inputClass}
                    placeholder="Mueang Phuket"
                  />
                  {errors.district && <p className={errorClass}>{errors.district.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Province *</label>
                  <select {...register('province')} className={inputClass}>
                    <option value="">Select province</option>
                    {THAI_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                  {errors.province && <p className={errorClass}>{errors.province.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="7.8804"
                  />
                  {errors.latitude && <p className={errorClass}>{errors.latitude.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="98.3923"
                  />
                  {errors.longitude && <p className={errorClass}>{errors.longitude.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <ImageUploader
              images={images}
              onChange={setImages}
              folder="projects"
            />
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  English SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (EN)</label>
                  <input
                    {...register('seo_title_en')}
                    className={inputClass}
                    placeholder="SEO title for English"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (EN)</label>
                  <textarea
                    {...register('seo_description_en')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for English"
                  />
                </div>
              </div>

              <hr className="border-luxury-200" />

              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  Thai SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (TH)</label>
                  <input
                    {...register('seo_title_th')}
                    className={inputClass}
                    placeholder="SEO title for Thai"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (TH)</label>
                  <textarea
                    {...register('seo_description_th')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for Thai"
                  />
                </div>
              </div>

              <hr className="border-luxury-200" />

              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  Chinese SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (ZH)</label>
                  <input
                    {...register('seo_title_zh')}
                    className={inputClass}
                    placeholder="SEO title for Chinese"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (ZH)</label>
                  <textarea
                    {...register('seo_description_zh')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for Chinese"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="px-6 py-2.5 border border-luxury-200 rounded-lg text-sm font-medium text-luxury-600 hover:bg-luxury-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setValue('status', 'draft');
            handleSubmit(onSubmit)();
          }}
          className="px-6 py-2.5 bg-luxury-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-luxury-300 transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:bg-primary-400 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Project' : 'Save Project'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
