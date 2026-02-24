// =============================================================================
// THE A 5995 - Zod Validation Schemas
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

const requiredString = z.string().min(1, 'This field is required');

const optionalString = z.string().optional().or(z.literal(''));

const positiveNumber = z.number().positive('Must be a positive number');

const optionalPositiveNumber = z
  .number()
  .positive('Must be a positive number')
  .nullable()
  .optional();

const emailField = z.string().email('Please enter a valid email address');

const phoneField = z
  .string()
  .regex(/^[+]?[\d\s()-]{7,20}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

// ---------------------------------------------------------------------------
// Property Schema
// ---------------------------------------------------------------------------

export const propertySchema = z.object({
  // Multilingual titles & descriptions (optional when property belongs to a project)
  title_en: z.string().max(200, 'Title must be under 200 characters').optional().or(z.literal('')),
  title_th: z.string().max(200, 'Title must be under 200 characters').optional().or(z.literal('')),
  title_zh: z.string().max(200, 'Title must be under 200 characters').optional().or(z.literal('')),
  description_en: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),
  description_th: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),
  description_zh: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),

  // Core fields
  price: positiveNumber,
  transaction_type: z.enum(['sale', 'rent'], {
    message: 'Please select sale or rent',
  }),
  property_type_id: requiredString,

  // Dimensions (nullable for property types like land)
  bedrooms: optionalPositiveNumber,
  bathrooms: optionalPositiveNumber,
  land_size: optionalPositiveNumber,
  building_size: optionalPositiveNumber,
  room_size: optionalPositiveNumber,
  floor: z.number().int().min(0).nullable().optional(),

  // Location (optional when property belongs to a project — inherited from project)
  address: z.string().max(500, 'Address is too long').optional().or(z.literal('')),
  district: z.string().max(100, 'District name is too long').optional().or(z.literal('')),
  province: z.string().max(100, 'Province name is too long').optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  // Project (optional — only for types with has_projects)
  project_id: z.string().uuid().nullable().optional(),

  // Status & visibility
  status: z.enum(['active', 'sold', 'rented', 'draft']),
  featured: z.boolean(),

  // SEO (optional)
  seo_title_en: optionalString,
  seo_title_th: optionalString,
  seo_title_zh: optionalString,
  seo_description_en: optionalString,
  seo_description_th: optionalString,
  seo_description_zh: optionalString,
}).refine(
  (data) => {
    // Title, description, and location are required only for standalone properties (no project)
    if (!data.project_id) {
      return !!data.title_en && !!data.title_th && !!data.title_zh
        && !!data.description_en && !!data.description_th && !!data.description_zh
        && !!data.address && !!data.district && !!data.province;
    }
    return true;
  },
  {
    message: 'Title, description, and location are required for standalone properties',
    path: ['title_en'],
  },
);

export type PropertySchemaType = z.infer<typeof propertySchema>;

// ---------------------------------------------------------------------------
// Inquiry Schema
// ---------------------------------------------------------------------------

export const inquirySchema = z.object({
  property_id: z.string().uuid().optional().or(z.literal('')),
  name: requiredString
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: emailField.optional().or(z.literal('')),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[\d\s()-]{7,20}$/, 'Please enter a valid phone number'),
  message: requiredString
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
  locale: z.enum(['en', 'th', 'zh']).default('en'),
});

export type InquirySchemaType = z.infer<typeof inquirySchema>;

// ---------------------------------------------------------------------------
// Admin Login Schema
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Blog Post Schema
// ---------------------------------------------------------------------------

export const blogPostSchema = z.object({
  title_en: requiredString.max(200, 'Title must be under 200 characters'),
  title_th: requiredString.max(200, 'Title must be under 200 characters'),
  title_zh: requiredString.max(200, 'Title must be under 200 characters'),

  excerpt_en: optionalString,
  excerpt_th: optionalString,
  excerpt_zh: optionalString,

  status: z.enum(['draft', 'published']),
  featured_image: optionalString,

  // SEO (optional)
  seo_title_en: optionalString,
  seo_title_th: optionalString,
  seo_title_zh: optionalString,
  seo_description_en: optionalString,
  seo_description_th: optionalString,
  seo_description_zh: optionalString,
});

export type BlogPostSchemaType = z.infer<typeof blogPostSchema>;

// ---------------------------------------------------------------------------
// Blog Content Block Schema
// ---------------------------------------------------------------------------

export const blogContentSchema = z.object({
  blog_post_id: z.string().uuid('Invalid blog post ID'),
  content_type: z.enum(['text', 'image', 'gallery', 'quote', 'heading'], {
    message: 'Please select a content type',
  }),

  content_en: optionalString,
  content_th: optionalString,
  content_zh: optionalString,

  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  image_alt_en: optionalString,
  image_alt_th: optionalString,
  image_alt_zh: optionalString,

  sort_order: z.number().int().min(0).default(0),
});

export type BlogContentSchemaType = z.infer<typeof blogContentSchema>;

// ---------------------------------------------------------------------------
// Property Image Schema (for validation when adding images)
// ---------------------------------------------------------------------------

export const propertyImageSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  url: z.string().url('Please enter a valid image URL'),
  alt_en: optionalString,
  alt_th: optionalString,
  alt_zh: optionalString,
  sort_order: z.number().int().min(0).default(0),
  is_primary: z.boolean().default(false),
});

export type PropertyImageSchemaType = z.infer<typeof propertyImageSchema>;

// ---------------------------------------------------------------------------
// Property Filters Schema (for search/filter query validation)
// ---------------------------------------------------------------------------

export const propertyFiltersSchema = z.object({
  transaction_type: z.enum(['sale', 'rent']).optional(),
  property_type_id: z.string().optional(),
  property_type_slug: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  min_land_size: z.coerce.number().positive().optional(),
  max_land_size: z.coerce.number().positive().optional(),
  min_building_size: z.coerce.number().positive().optional(),
  max_building_size: z.coerce.number().positive().optional(),
  status: z.enum(['active', 'sold', 'rented', 'draft']).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(12),
});

export type PropertyFiltersSchemaType = z.infer<typeof propertyFiltersSchema>;

// ---------------------------------------------------------------------------
// Project Schema
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  // Multilingual names
  name_en: requiredString.max(200, 'Name must be under 200 characters'),
  name_th: requiredString.max(200, 'Name must be under 200 characters'),
  name_zh: requiredString.max(200, 'Name must be under 200 characters'),

  // Multilingual descriptions
  description_en: requiredString.max(5000, 'Description is too long'),
  description_th: requiredString.max(5000, 'Description is too long'),
  description_zh: requiredString.max(5000, 'Description is too long'),

  // Property type (must be one with has_projects = true)
  property_type_id: requiredString,

  // Project-specific fields
  developer_name: optionalString,
  facilities: z.array(z.string()),
  year_built: z.number().int().min(1900).max(2100).nullable().optional(),
  total_units: z.number().int().positive().nullable().optional(),

  // Location
  address: requiredString.max(500, 'Address is too long'),
  district: requiredString.max(100, 'District name is too long'),
  province: requiredString.max(100, 'Province name is too long'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  // Status
  status: z.enum(['active', 'completed', 'under_construction', 'draft']),

  // SEO (optional)
  seo_title_en: optionalString,
  seo_title_th: optionalString,
  seo_title_zh: optionalString,
  seo_description_en: optionalString,
  seo_description_th: optionalString,
  seo_description_zh: optionalString,
});

export type ProjectSchemaType = z.infer<typeof projectSchema>;
