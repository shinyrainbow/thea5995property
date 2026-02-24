'use client';

// =============================================================================
// THE A 5995 - Property Form Component
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, type PropertySchemaType } from '@/lib/validations';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import MapPicker from '@/components/admin/MapPicker';
import { THAI_PROVINCES } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { PropertyType, PropertyWithDetails } from '@/types';

interface PropertyFormProps {
  property?: PropertyWithDetails;
  propertyTypes: PropertyType[];
  projects?: Array<{ id: string; name_en: string; property_type_id: string }>;
}

export default function PropertyForm({ property, propertyTypes, projects = [] }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>(
    property?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      alt_en: img.alt_en,
      alt_th: img.alt_th,
      alt_zh: img.alt_zh,
      sort_order: img.sort_order,
      is_primary: img.is_primary,
    })) ?? [],
  );

  const isEditing = !!property;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PropertySchemaType>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          title_en: property.title_en,
          title_th: property.title_th,
          title_zh: property.title_zh,
          description_en: property.description_en,
          description_th: property.description_th,
          description_zh: property.description_zh,
          price: property.price,
          transaction_type: property.transaction_type,
          property_type_id: String(property.property_type_id),
          project_id: property.project_id ?? null,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          land_size: property.land_size,
          building_size: property.building_size,
          room_size: property.room_size,
          floor: property.floor,
          address: property.address,
          district: property.district,
          province: property.province,
          latitude: property.latitude,
          longitude: property.longitude,
          status: property.status,
          featured: property.featured,
          seo_title_en: property.seo_title_en || '',
          seo_title_th: property.seo_title_th || '',
          seo_title_zh: property.seo_title_zh || '',
          seo_description_en: property.seo_description_en || '',
          seo_description_th: property.seo_description_th || '',
          seo_description_zh: property.seo_description_zh || '',
        }
      : {
          status: 'draft',
          featured: false,
          transaction_type: 'sale',
        },
  });

  const onSubmit = async (data: PropertySchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/properties/${property.id}` : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save property');
      }

      const result = await response.json();
      const propertyId = result.data?.id || property?.id;

      // Save images to property_images table
      if (propertyId) {
        const imgRes = await fetch(`/api/properties/${propertyId}/images`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images }),
        });
        if (!imgRes.ok) {
          const imgErr = await imgRes.json();
          console.error('Failed to save images:', imgErr);
          throw new Error(imgErr.error || 'Failed to save images');
        }
      }

      router.push('/admin/properties');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = watch('status');
  const featured = watch('featured');
  const watchedPropertyTypeId = watch('property_type_id');
  const watchedProjectId = watch('project_id');
  const hasProject = !!watchedProjectId;

  // Determine if the selected property type supports projects
  const selectedPropertyType = propertyTypes.find((t) => String(t.id) === String(watchedPropertyTypeId));
  const isUnitType = ['condo', 'apartment', 'office'].includes(selectedPropertyType?.slug_en || '');
  const filteredProjects = projects.filter((p) => String(p.property_type_id) === String(watchedPropertyTypeId));
  const showProjectDropdown = selectedPropertyType?.has_projects === true || filteredProjects.length > 0;

  // Clear project_id when switching to a property type without projects
  useEffect(() => {
    if (!showProjectDropdown) {
      setValue('project_id', null);
    }
  }, [showProjectDropdown, setValue]);

  // Map pin handler
  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue('latitude', lat);
      setValue('longitude', lng);
    },
    [setValue],
  );

  // Helper classes
  const inputClass =
    'w-full px-4 py-2.5 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-primary-600 mb-1.5';
  const errorClass = 'mt-1 text-xs text-red-500';
  const sectionClass = 'bg-white rounded-xl border border-luxury-200 p-5 space-y-5';
  const sectionTitle = 'text-sm font-semibold text-primary-700 uppercase tracking-wider pb-2 border-b border-luxury-100';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status & Featured */}
      <div className="bg-white rounded-xl border border-luxury-200 p-5 flex flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-primary-600">Status:</label>
          <select
            {...register('status')}
            className="px-3 py-2 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              status === 'active'
                ? 'bg-green-100 text-green-700'
                : status === 'draft'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-blue-100 text-blue-700',
            )}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-primary-600">Featured:</label>
          <button
            type="button"
            onClick={() => setValue('featured', !featured)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-200',
              featured ? 'bg-secondary-400' : 'bg-luxury-300',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm',
                featured && 'translate-x-5',
              )}
            />
          </button>
        </div>
      </div>

      {/* Property Type & Project */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Property Classification</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Property Type *</label>
            <select {...register('property_type_id')} className={inputClass}>
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
            <label className={labelClass}>Transaction Type *</label>
            <select {...register('transaction_type')} className={inputClass}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            {errors.transaction_type && (
              <p className={errorClass}>{errors.transaction_type.message}</p>
            )}
          </div>
        </div>

        {showProjectDropdown && (
          <div>
            <label className={labelClass}>Project (Optional)</label>
            <select
              value={watch('project_id') || ''}
              onChange={(e) => setValue('project_id', e.target.value || null)}
              className={inputClass}
            >
              <option value="">None (Standalone)</option>
              {filteredProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name_en}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Title & Description — hidden when property belongs to a project */}
      {!hasProject && (
        <>
          <div className={sectionClass}>
            <h3 className={sectionTitle}>English</h3>
            <div>
              <label className={labelClass}>Title (English) *</label>
              <input
                {...register('title_en')}
                className={inputClass}
                placeholder="Luxury beachfront villa in Phuket"
              />
              {errors.title_en && <p className={errorClass}>{errors.title_en.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Description (English) *</label>
              <textarea
                {...register('description_en')}
                rows={4}
                className={cn(inputClass, 'resize-y')}
                placeholder="Describe the property in detail..."
              />
              {errors.description_en && (
                <p className={errorClass}>{errors.description_en.message}</p>
              )}
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className={sectionTitle}>Thai</h3>
            <div>
              <label className={labelClass}>Title (Thai) *</label>
              <input
                {...register('title_th')}
                className={inputClass}
                placeholder="Enter Thai title"
              />
              {errors.title_th && <p className={errorClass}>{errors.title_th.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Description (Thai) *</label>
              <textarea
                {...register('description_th')}
                rows={4}
                className={cn(inputClass, 'resize-y')}
                placeholder="Enter Thai description"
              />
              {errors.description_th && (
                <p className={errorClass}>{errors.description_th.message}</p>
              )}
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className={sectionTitle}>Chinese</h3>
            <div>
              <label className={labelClass}>Title (Chinese) *</label>
              <input
                {...register('title_zh')}
                className={inputClass}
                placeholder="Enter Chinese title"
              />
              {errors.title_zh && <p className={errorClass}>{errors.title_zh.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Description (Chinese) *</label>
              <textarea
                {...register('description_zh')}
                rows={4}
                className={cn(inputClass, 'resize-y')}
                placeholder="Enter Chinese description"
              />
              {errors.description_zh && (
                <p className={errorClass}>{errors.description_zh.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Price & Specs */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Details</h3>

        <div>
          <label className={labelClass}>Price (THB) *</label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className={inputClass}
            placeholder="5000000"
          />
          {errors.price && <p className={errorClass}>{errors.price.message}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>Bedrooms</label>
            <input
              type="number"
              {...register('bedrooms', { valueAsNumber: true })}
              className={inputClass}
              placeholder="3"
            />
            {errors.bedrooms && <p className={errorClass}>{errors.bedrooms.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Bathrooms</label>
            <input
              type="number"
              {...register('bathrooms', { valueAsNumber: true })}
              className={inputClass}
              placeholder="2"
            />
            {errors.bathrooms && <p className={errorClass}>{errors.bathrooms.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Land Size (sqm)</label>
            <input
              type="number"
              {...register('land_size', { valueAsNumber: true })}
              className={inputClass}
              placeholder="400"
            />
            {errors.land_size && <p className={errorClass}>{errors.land_size.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Building Size (sqm)</label>
            <input
              type="number"
              {...register('building_size', { valueAsNumber: true })}
              className={inputClass}
              placeholder="200"
            />
            {errors.building_size && (
              <p className={errorClass}>{errors.building_size.message}</p>
            )}
          </div>
          {isUnitType && (
            <>
              <div>
                <label className={labelClass}>Room Size (sqm)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('room_size', { valueAsNumber: true })}
                  className={inputClass}
                  placeholder="35"
                />
                {errors.room_size && <p className={errorClass}>{errors.room_size.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Floor</label>
                <input
                  type="number"
                  {...register('floor', { valueAsNumber: true })}
                  className={inputClass}
                  placeholder="12"
                />
                {errors.floor && <p className={errorClass}>{errors.floor.message}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Location — hidden when property belongs to a project */}
      {!hasProject && (
        <div className={sectionClass}>
          <h3 className={sectionTitle}>Location</h3>

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

          <MapPicker
            latitude={watch('latitude')}
            longitude={watch('longitude')}
            onLocationChange={handleLocationChange}
          />
        </div>
      )}

      {/* Images */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Images</h3>
        <ImageUploader images={images} onChange={setImages} folder="properties" />
      </div>

      {/* SEO */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>SEO (Optional)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Meta Title (EN)</label>
            <input {...register('seo_title_en')} className={inputClass} placeholder="SEO title for English" />
          </div>
          <div>
            <label className={labelClass}>Meta Title (TH)</label>
            <input {...register('seo_title_th')} className={inputClass} placeholder="SEO title for Thai" />
          </div>
          <div>
            <label className={labelClass}>Meta Title (ZH)</label>
            <input {...register('seo_title_zh')} className={inputClass} placeholder="SEO title for Chinese" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Meta Description (EN)</label>
            <textarea
              {...register('seo_description_en')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description for English"
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description (TH)</label>
            <textarea
              {...register('seo_description_th')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description for Thai"
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description (ZH)</label>
            <textarea
              {...register('seo_description_zh')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description for Chinese"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/properties')}
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
              {isEditing ? 'Update Property' : 'Create Property'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
