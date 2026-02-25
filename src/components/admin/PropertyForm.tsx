'use client';

// =============================================================================
// THE A 5995 - Property Form Component
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema, type PropertySchemaType } from '@/lib/validations';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import MapPicker from '@/components/admin/MapPicker';
import NumberInput from '@/components/ui/NumberInput';
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
  const t = useTranslations('admin');
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

  const COMMON_AMENITIES = [
    'Swimming Pool', 'Gym / Fitness', 'Parking', 'Security 24/7',
    'CCTV', 'Elevator', 'Garden', 'Balcony',
    'Air Conditioning', 'Furnished', 'Pet Friendly', 'Wi-Fi',
    'Sauna', 'Playground', 'Rooftop', 'Co-working Space',
    'Laundry', 'Storage', 'Concierge', 'Shuttle Service',
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property?.amenities || [],
  );
  const [customAmenity, setCustomAmenity] = useState('');

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      const next = prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity];
      setValue('amenities', next);
      return next;
    });
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      const next = [...selectedAmenities, trimmed];
      setSelectedAmenities(next);
      setValue('amenities', next);
      setCustomAmenity('');
    }
  };

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
          amenities: property.amenities || [],
          seo_description_zh: property.seo_description_zh || '',
        }
      : {
          status: 'draft',
          featured: false,
          transaction_type: 'sale',
          amenities: [],
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
          <label className="text-sm font-medium text-primary-600">{t('status')}:</label>
          <select
            {...register('status')}
            className="px-3 py-2 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            <option value="draft">{t('draft')}</option>
            <option value="active">{t('active')}</option>
            <option value="sold">{t('sold')}</option>
            <option value="rented">{t('rented')}</option>
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
          <label className="text-sm font-medium text-primary-600">{t('featured')}:</label>
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
        <h3 className={sectionTitle}>{t('propertyClassification')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>{t('propertyType')} *</label>
            <select {...register('property_type_id')} className={inputClass}>
              <option value="">{t('selectPropertyType')}</option>
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
            <label className={labelClass}>{t('transactionType')} *</label>
            <select {...register('transaction_type')} className={inputClass}>
              <option value="sale">{t('forSale')}</option>
              <option value="rent">{t('forRent')}</option>
            </select>
            {errors.transaction_type && (
              <p className={errorClass}>{errors.transaction_type.message}</p>
            )}
          </div>
        </div>

        {showProjectDropdown && (
          <div>
            <label className={labelClass}>{t('projectOptional')}</label>
            <select
              value={watch('project_id') || ''}
              onChange={(e) => setValue('project_id', e.target.value || null)}
              className={inputClass}
            >
              <option value="">{t('noneStandalone')}</option>
              {filteredProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name_en}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Title — hidden when property belongs to a project */}
      {!hasProject && (
        <>
          <div className={sectionClass}>
            <h3 className={sectionTitle}>{t('english')}</h3>
            <div>
              <label className={labelClass}>{t('titleEn')} *</label>
              <input
                {...register('title_en')}
                className={inputClass}
                placeholder="Luxury beachfront villa in Phuket"
              />
              {errors.title_en && <p className={errorClass}>{errors.title_en.message}</p>}
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className={sectionTitle}>{t('thai')}</h3>
            <div>
              <label className={labelClass}>{t('titleTh')} *</label>
              <input
                {...register('title_th')}
                className={inputClass}
                placeholder="Enter Thai title"
              />
              {errors.title_th && <p className={errorClass}>{errors.title_th.message}</p>}
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className={sectionTitle}>{t('chinese')}</h3>
            <div>
              <label className={labelClass}>{t('titleZh')} *</label>
              <input
                {...register('title_zh')}
                className={inputClass}
                placeholder="Enter Chinese title"
              />
              {errors.title_zh && <p className={errorClass}>{errors.title_zh.message}</p>}
            </div>
          </div>
        </>
      )}

      {/* Description / Detail Box — ALWAYS visible */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>{t('propertyDetails')}</h3>
        <div>
          <label className={labelClass}>{t('descriptionEn')}{!hasProject && ' *'}</label>
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
        <div>
          <label className={labelClass}>{t('descriptionTh')}{!hasProject && ' *'}</label>
          <textarea
            {...register('description_th')}
            rows={4}
            className={cn(inputClass, 'resize-y')}
            placeholder="รายละเอียดทรัพย์สิน..."
          />
          {errors.description_th && (
            <p className={errorClass}>{errors.description_th.message}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>{t('descriptionZh')}{!hasProject && ' *'}</label>
          <textarea
            {...register('description_zh')}
            rows={4}
            className={cn(inputClass, 'resize-y')}
            placeholder="房产描述..."
          />
          {errors.description_zh && (
            <p className={errorClass}>{errors.description_zh.message}</p>
          )}
        </div>
      </div>

      {/* Price & Specs */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>{t('details')}</h3>

        <div>
          <label className={labelClass}>{t('price')} *</label>
          <NumberInput
            value={watch('price')}
            onChange={(val) => setValue('price', val as number, { shouldValidate: true })}
            className={inputClass}
            placeholder="5,000,000"
          />
          {errors.price && <p className={errorClass}>{errors.price.message}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <label className={labelClass}>{t('bedrooms')}</label>
            <NumberInput
              value={watch('bedrooms')}
              onChange={(val) => setValue('bedrooms', val, { shouldValidate: true })}
              className={inputClass}
              placeholder="3"
            />
            {errors.bedrooms && <p className={errorClass}>{errors.bedrooms.message}</p>}
          </div>
          <div>
            <label className={labelClass}>{t('bathrooms')}</label>
            <NumberInput
              value={watch('bathrooms')}
              onChange={(val) => setValue('bathrooms', val, { shouldValidate: true })}
              className={inputClass}
              placeholder="2"
            />
            {errors.bathrooms && <p className={errorClass}>{errors.bathrooms.message}</p>}
          </div>
          <div>
            <label className={labelClass}>{t('landSize')}</label>
            <NumberInput
              value={watch('land_size')}
              onChange={(val) => setValue('land_size', val, { shouldValidate: true })}
              className={inputClass}
              placeholder="400"
            />
            {errors.land_size && <p className={errorClass}>{errors.land_size.message}</p>}
          </div>
          <div>
            <label className={labelClass}>{t('buildingSize')}</label>
            <NumberInput
              value={watch('building_size')}
              onChange={(val) => setValue('building_size', val, { shouldValidate: true })}
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
                <label className={labelClass}>{t('roomSize')}</label>
                <NumberInput
                  value={watch('room_size')}
                  onChange={(val) => setValue('room_size', val, { shouldValidate: true })}
                  allowDecimal
                  className={inputClass}
                  placeholder="35.5"
                />
                {errors.room_size && <p className={errorClass}>{errors.room_size.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{t('floor')}</label>
                <NumberInput
                  value={watch('floor')}
                  onChange={(val) => setValue('floor', val, { shouldValidate: true })}
                  className={inputClass}
                  placeholder="12"
                />
                {errors.floor && <p className={errorClass}>{errors.floor.message}</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>{t('amenities')}</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_AMENITIES.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                selectedAmenities.includes(amenity)
                  ? 'bg-secondary-400 border-secondary-400 text-primary-900'
                  : 'bg-white border-luxury-200 text-luxury-600 hover:border-secondary-300',
              )}
            >
              {amenity}
            </button>
          ))}
        </div>
        {/* Custom amenity input */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
            className={cn(inputClass, 'flex-1')}
            placeholder={t('addCustomAmenity')}
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
          >
            {t('add')}
          </button>
        </div>
        {/* Show selected custom amenities (those not in COMMON_AMENITIES) */}
        {selectedAmenities.filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedAmenities
              .filter((a) => !COMMON_AMENITIES.includes(a))
              .map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary-400 border border-secondary-400 text-primary-900"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="ml-1 hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Location — hidden when property belongs to a project */}
      {!hasProject && (
        <div className={sectionClass}>
          <h3 className={sectionTitle}>{t('location')}</h3>

          <div>
            <label className={labelClass}>{t('address')} *</label>
            <input
              {...register('address')}
              className={inputClass}
              placeholder="123 Beach Road, Soi 5"
            />
            {errors.address && <p className={errorClass}>{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>{t('district')} *</label>
              <input
                {...register('district')}
                className={inputClass}
                placeholder="Mueang Phuket"
              />
              {errors.district && <p className={errorClass}>{errors.district.message}</p>}
            </div>
            <div>
              <label className={labelClass}>{t('province')} *</label>
              <select {...register('province')} className={inputClass}>
                <option value="">{t('selectProvince')}</option>
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
        <h3 className={sectionTitle}>{t('images')}</h3>
        <ImageUploader images={images} onChange={setImages} folder="properties" />
      </div>

      {/* SEO */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>{t('seo')}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>{t('metaTitleEn')}</label>
            <input {...register('seo_title_en')} className={inputClass} placeholder="SEO title for English" />
          </div>
          <div>
            <label className={labelClass}>{t('metaTitleTh')}</label>
            <input {...register('seo_title_th')} className={inputClass} placeholder="SEO title for Thai" />
          </div>
          <div>
            <label className={labelClass}>{t('metaTitleZh')}</label>
            <input {...register('seo_title_zh')} className={inputClass} placeholder="SEO title for Chinese" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>{t('metaDescEn')}</label>
            <textarea
              {...register('seo_description_en')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description for English"
            />
          </div>
          <div>
            <label className={labelClass}>{t('metaDescTh')}</label>
            <textarea
              {...register('seo_description_th')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description for Thai"
            />
          </div>
          <div>
            <label className={labelClass}>{t('metaDescZh')}</label>
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
          {t('cancel')}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue('status', 'draft');
            handleSubmit(onSubmit)();
          }}
          className="px-6 py-2.5 bg-luxury-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-luxury-300 transition-colors"
        >
          {t('saveAsDraft')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:bg-primary-400 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? t('updateProperty') : t('createProperty')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
