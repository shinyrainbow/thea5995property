// =============================================================================
// THE A 5995 - TypeScript Type Definitions
// =============================================================================

// ---------------------------------------------------------------------------
// Helper / Enum Types
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'th' | 'zh';

export type TransactionType = 'sale' | 'rent';

export type PropertyStatus = 'active' | 'sold' | 'rented' | 'draft';

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export type AdminRole = 'super_admin' | 'admin';

export type ProjectStatus = 'active' | 'completed' | 'under_construction' | 'draft';

export type BlogPostStatus = 'draft' | 'published';

export type BlogContentType = 'text' | 'image' | 'gallery' | 'quote' | 'heading';

export type HomepageSectionType =
  | 'hero'
  | 'featured_properties'
  | 'about'
  | 'services'
  | 'testimonials'
  | 'cta'
  | 'stats'
  | 'partners';

// ---------------------------------------------------------------------------
// Database Row Types
// ---------------------------------------------------------------------------

export interface Property {
  id: string;
  title_en: string;
  title_th: string;
  title_zh: string;
  slug_en: string;
  slug_th: string;
  slug_zh: string;
  description_en: string;
  description_th: string;
  description_zh: string;
  price: number;
  transaction_type: TransactionType;
  property_type_id: string;
  bedrooms: number | null;
  bathrooms: number | null;
  land_size: number | null;
  building_size: number | null;
  room_size: number | null;
  floor: number | null;
  address: string;
  district: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  project_id: string | null;
  status: PropertyStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
  seo_title_en: string | null;
  seo_title_th: string | null;
  seo_title_zh: string | null;
  seo_description_en: string | null;
  seo_description_th: string | null;
  seo_description_zh: string | null;
}

export interface PropertyType {
  id: string;
  slug_en: string;
  slug_th: string;
  slug_zh: string;
  name_en: string;
  name_th: string;
  name_zh: string;
  icon: string;
  has_projects: boolean;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  alt_en: string;
  alt_th: string;
  alt_zh: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Inquiry {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: InquiryStatus;
  locale: Locale;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface HomepageSection {
  id: string;
  section_type: HomepageSectionType;
  title_en: string;
  title_th: string;
  title_zh: string;
  content_en: string | null;
  content_th: string | null;
  content_zh: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  title_en: string;
  title_th: string;
  title_zh: string;
  slug_en: string;
  slug_th: string;
  slug_zh: string;
  excerpt_en: string | null;
  excerpt_th: string | null;
  excerpt_zh: string | null;
  status: BlogPostStatus;
  featured_image: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  seo_title_en: string | null;
  seo_title_th: string | null;
  seo_title_zh: string | null;
  seo_description_en: string | null;
  seo_description_th: string | null;
  seo_description_zh: string | null;
}

export interface BlogContent {
  id: string;
  blog_post_id: string;
  content_type: BlogContentType;
  content_en: string | null;
  content_th: string | null;
  content_zh: string | null;
  image_url: string | null;
  image_alt_en: string | null;
  image_alt_th: string | null;
  image_alt_zh: string | null;
  sort_order: number;
}

export interface Project {
  id: string;
  name_en: string;
  name_th: string;
  name_zh: string;
  slug_en: string;
  slug_th: string;
  slug_zh: string;
  description_en: string;
  description_th: string;
  description_zh: string;
  property_type_id: string;
  developer_name: string | null;
  facilities: string[];
  year_built: number | null;
  total_units: number | null;
  address: string;
  district: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  status: ProjectStatus;
  seo_title_en: string | null;
  seo_title_th: string | null;
  seo_title_zh: string | null;
  seo_description_en: string | null;
  seo_description_th: string | null;
  seo_description_zh: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt_en: string;
  alt_th: string;
  alt_zh: string;
  sort_order: number;
  is_primary: boolean;
}

// ---------------------------------------------------------------------------
// Joined / Extended Types
// ---------------------------------------------------------------------------

/** Property with its images and property type joined in. */
export interface PropertyWithDetails extends Property {
  property_type: PropertyType;
  images: PropertyImage[];
  project?: Project | null;
}

/** Project with its images and property type joined in. */
export interface ProjectWithDetails extends Project {
  property_type: PropertyType;
  images: ProjectImage[];
}

/** Blog post with all its content blocks and author joined in. */
export interface BlogPostWithContent extends BlogPost {
  content_blocks: BlogContent[];
  author: Pick<AdminUser, 'id' | 'name'>;
}

// ---------------------------------------------------------------------------
// Filter / Search Types
// ---------------------------------------------------------------------------

export interface PropertyFilters {
  transaction_type?: TransactionType;
  property_type_id?: string;
  property_type_slug?: string;
  province?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_land_size?: number;
  max_land_size?: number;
  min_building_size?: number;
  max_building_size?: number;
  status?: PropertyStatus;
  featured?: boolean;
  search?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  per_page?: number;
}

// ---------------------------------------------------------------------------
// Form Input Types (for creating / updating records)
// ---------------------------------------------------------------------------

export interface PropertyFormInput {
  title_en: string;
  title_th: string;
  title_zh: string;
  description_en: string;
  description_th: string;
  description_zh: string;
  price: number;
  transaction_type: TransactionType;
  property_type_id: string;
  project_id?: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  land_size: number | null;
  building_size: number | null;
  room_size: number | null;
  floor: number | null;
  address: string;
  district: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  status: PropertyStatus;
  featured: boolean;
  seo_title_en?: string;
  seo_title_th?: string;
  seo_title_zh?: string;
  seo_description_en?: string;
  seo_description_th?: string;
  seo_description_zh?: string;
}

export interface ProjectFormInput {
  name_en: string;
  name_th: string;
  name_zh: string;
  description_en: string;
  description_th: string;
  description_zh: string;
  property_type_id: string;
  developer_name?: string;
  facilities: string[];
  year_built?: number | null;
  total_units?: number | null;
  address: string;
  district: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
  status: ProjectStatus;
  seo_title_en?: string;
  seo_title_th?: string;
  seo_title_zh?: string;
  seo_description_en?: string;
  seo_description_th?: string;
  seo_description_zh?: string;
}

export interface InquiryFormInput {
  property_id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale: Locale;
}

export interface BlogPostFormInput {
  title_en: string;
  title_th: string;
  title_zh: string;
  excerpt_en?: string;
  excerpt_th?: string;
  excerpt_zh?: string;
  status: BlogPostStatus;
  featured_image?: string;
  seo_title_en?: string;
  seo_title_th?: string;
  seo_title_zh?: string;
  seo_description_en?: string;
  seo_description_th?: string;
  seo_description_zh?: string;
}

export interface BlogContentFormInput {
  blog_post_id: string;
  content_type: BlogContentType;
  content_en?: string;
  content_th?: string;
  content_zh?: string;
  image_url?: string;
  image_alt_en?: string;
  image_alt_th?: string;
  image_alt_zh?: string;
  sort_order: number;
}

// ---------------------------------------------------------------------------
// API / Pagination Types
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
