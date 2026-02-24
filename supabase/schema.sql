-- =============================================================================
-- THE A 5995 - Real Estate Platform
-- Complete Supabase SQL Schema
-- =============================================================================
-- This schema defines all tables, indexes, triggers, RLS policies, and seed
-- data for the THE A 5995 multilingual real estate platform (EN/TH/ZH).
-- =============================================================================


-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================
-- Ensure pgcrypto is available for gen_random_uuid() and crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- 1. UTILITY: updated_at TRIGGER FUNCTION
-- =============================================================================
-- Automatically sets the updated_at column to NOW() on every row update.
-- Attach this trigger to any table that has an updated_at column.
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 2. TABLE: admin_users
-- =============================================================================
-- Stores admin and super-admin accounts that manage the platform.
-- Passwords are stored as bcrypt hashes.
-- =============================================================================

CREATE TABLE admin_users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'admin'
                            CHECK (role IN ('super_admin', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE admin_users IS 'Platform administrator accounts';


-- =============================================================================
-- 3. TABLE: property_types
-- =============================================================================
-- Lookup table for property categories. Each type has a trilingual slug and
-- display name. The icon field can hold an icon class name or SVG reference.
-- =============================================================================

CREATE TABLE property_types (
  id           SERIAL      PRIMARY KEY,
  slug_en      TEXT        UNIQUE NOT NULL,
  slug_th      TEXT        UNIQUE NOT NULL,
  slug_zh      TEXT        UNIQUE NOT NULL,
  name_en      TEXT        NOT NULL,
  name_th      TEXT        NOT NULL,
  name_zh      TEXT        NOT NULL,
  icon         TEXT,
  has_projects BOOLEAN     DEFAULT FALSE,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE property_types IS 'Property category lookup (trilingual)';


-- =============================================================================
-- 4. TABLE: properties
-- =============================================================================
-- Core table for all property listings. Supports trilingual content, GPS
-- coordinates, SEO metadata, and status tracking.
-- =============================================================================

CREATE TABLE properties (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en          TEXT          NOT NULL,
  title_th          TEXT,
  title_zh          TEXT,
  slug_en           TEXT          UNIQUE NOT NULL,
  slug_th           TEXT          UNIQUE,
  slug_zh           TEXT          UNIQUE,
  description_en    TEXT,
  description_th    TEXT,
  description_zh    TEXT,
  price             DECIMAL(15,2) NOT NULL,
  transaction_type  TEXT          NOT NULL
                                  CHECK (transaction_type IN ('sale', 'rent')),
  property_type_id  INTEGER       REFERENCES property_types(id),
  bedrooms          INTEGER       DEFAULT 0,
  bathrooms         INTEGER       DEFAULT 0,
  land_size         DECIMAL(10,2),
  building_size     DECIMAL(10,2),
  room_size         DECIMAL(10,2),
  floor             INTEGER,
  amenities         TEXT[]        DEFAULT '{}',
  address           TEXT,
  district          TEXT,
  province          TEXT,
  latitude          DECIMAL(10,8),
  longitude         DECIMAL(11,8),
  status            TEXT          NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('active', 'sold', 'rented', 'draft')),
  featured          BOOLEAN       DEFAULT FALSE,
  seo_title_en      TEXT,
  seo_title_th      TEXT,
  seo_title_zh      TEXT,
  seo_description_en TEXT,
  seo_description_th TEXT,
  seo_description_zh TEXT,
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE properties IS 'Core property listings (trilingual with SEO)';


-- =============================================================================
-- 5. TABLE: property_images
-- =============================================================================
-- Stores image references for properties. Each property can have multiple
-- images with one marked as primary. Sort order controls display sequence.
-- =============================================================================

CREATE TABLE property_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        REFERENCES properties(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  alt_en      TEXT,
  alt_th      TEXT,
  alt_zh      TEXT,
  sort_order  INTEGER     DEFAULT 0,
  is_primary  BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE property_images IS 'Property listing images with trilingual alt text';


-- =============================================================================
-- 5b. TABLE: projects
-- =============================================================================
-- Development projects for property types that support them (condo, townhouse,
-- apartment). A project groups multiple property units under a single
-- development with shared info (developer, facilities, location).
-- =============================================================================

CREATE TABLE projects (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Trilingual name
  name_en            TEXT          NOT NULL,
  name_th            TEXT,
  name_zh            TEXT,

  -- Trilingual slugs (locale-specific SEO URLs)
  slug_en            TEXT          UNIQUE NOT NULL,
  slug_th            TEXT          UNIQUE,
  slug_zh            TEXT          UNIQUE,

  -- Trilingual description
  description_en     TEXT,
  description_th     TEXT,
  description_zh     TEXT,

  -- Must be a project-supporting type (condo, townhouse, apartment)
  property_type_id   INTEGER       REFERENCES property_types(id),

  -- Project-specific fields
  developer_name     TEXT,
  facilities         TEXT[],
  year_built         INTEGER,
  total_units        INTEGER,

  -- Location
  address            TEXT,
  district           TEXT,
  province           TEXT,
  latitude           DECIMAL(10,8),
  longitude          DECIMAL(11,8),

  -- Status
  status             TEXT          NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('active', 'completed', 'under_construction', 'draft')),

  -- SEO fields (trilingual)
  seo_title_en       TEXT,
  seo_title_th       TEXT,
  seo_title_zh       TEXT,
  seo_description_en TEXT,
  seo_description_th TEXT,
  seo_description_zh TEXT,

  created_at         TIMESTAMPTZ   DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   DEFAULT NOW()
);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE projects IS 'Real estate development projects (trilingual with SEO)';


-- =============================================================================
-- 5c. TABLE: project_images
-- =============================================================================
-- Stores image references for projects. Same pattern as property_images.
-- =============================================================================

CREATE TABLE project_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        REFERENCES projects(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  alt_en      TEXT,
  alt_th      TEXT,
  alt_zh      TEXT,
  sort_order  INTEGER     DEFAULT 0,
  is_primary  BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE project_images IS 'Project images with trilingual alt text';


-- =============================================================================
-- 5d. Link properties to projects (optional relationship)
-- =============================================================================
-- A property can optionally belong to a project. When a project is deleted,
-- the property remains but its project_id is set to NULL.
-- =============================================================================

ALTER TABLE properties ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;


-- =============================================================================
-- 6. TABLE: inquiries
-- =============================================================================
-- Contact form submissions from potential buyers/renters. Each inquiry can
-- optionally reference a specific property. Status tracks the response flow.
-- =============================================================================

CREATE TABLE inquiries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID        REFERENCES properties(id) ON DELETE SET NULL,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  message     TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new', 'read', 'replied', 'archived')),
  locale      TEXT        DEFAULT 'en',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE inquiries IS 'Contact form submissions from site visitors';


-- =============================================================================
-- 7. TABLE: homepage_sections
-- =============================================================================
-- CMS-managed content blocks for the homepage. Admins can reorder, toggle
-- visibility, and edit trilingual content for each section.
-- =============================================================================

CREATE TABLE homepage_sections (
  id           SERIAL      PRIMARY KEY,
  section_type TEXT        NOT NULL,
  title_en     TEXT,
  title_th     TEXT,
  title_zh     TEXT,
  content_en   TEXT,
  content_th   TEXT,
  content_zh   TEXT,
  image_url    TEXT,
  sort_order   INTEGER     DEFAULT 0,
  is_active    BOOLEAN     DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE homepage_sections IS 'CMS-managed homepage content blocks';


-- =============================================================================
-- 8. TABLE: blog_posts
-- =============================================================================
-- Blog/article metadata with trilingual titles, slugs, excerpts, and SEO
-- fields. The actual body content is stored in blog_contents (block-based).
-- =============================================================================

CREATE TABLE blog_posts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en           TEXT        NOT NULL,
  title_th           TEXT,
  title_zh           TEXT,
  slug_en            TEXT        UNIQUE NOT NULL,
  slug_th            TEXT        UNIQUE,
  slug_zh            TEXT        UNIQUE,
  excerpt_en         TEXT,
  excerpt_th         TEXT,
  excerpt_zh         TEXT,
  featured_image     TEXT,
  status             TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft', 'published')),
  author_id          UUID        REFERENCES admin_users(id),
  seo_title_en       TEXT,
  seo_title_th       TEXT,
  seo_title_zh       TEXT,
  seo_description_en TEXT,
  seo_description_th TEXT,
  seo_description_zh TEXT,
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE blog_posts IS 'Blog/article metadata (trilingual with SEO)';


-- =============================================================================
-- 9. TABLE: blog_contents
-- =============================================================================
-- Block-based content for blog posts. Each row is one content block (text,
-- image, gallery, quote, or heading) that can be reordered via sort_order.
-- =============================================================================

CREATE TABLE blog_contents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id  UUID        REFERENCES blog_posts(id) ON DELETE CASCADE,
  content_type  TEXT        NOT NULL
                            CHECK (content_type IN ('text', 'image', 'gallery', 'quote', 'heading')),
  content_en    TEXT,
  content_th    TEXT,
  content_zh    TEXT,
  image_url     TEXT,
  image_alt_en  TEXT,
  image_alt_th  TEXT,
  image_alt_zh  TEXT,
  sort_order    INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blog_contents IS 'Block-based blog post content (trilingual)';


-- =============================================================================
-- 10. INDEXES
-- =============================================================================
-- Performance indexes on foreign keys, slugs, status fields, and commonly
-- filtered/sorted columns.
-- =============================================================================

-- admin_users indexes
CREATE INDEX idx_admin_users_email ON admin_users (email);
CREATE INDEX idx_admin_users_role ON admin_users (role);

-- properties indexes (foreign keys)
CREATE INDEX idx_properties_property_type_id ON properties (property_type_id);

-- properties indexes (slug lookups)
CREATE INDEX idx_properties_slug_en ON properties (slug_en);
CREATE INDEX idx_properties_slug_th ON properties (slug_th);
CREATE INDEX idx_properties_slug_zh ON properties (slug_zh);

-- properties indexes (filtering & sorting)
CREATE INDEX idx_properties_status ON properties (status);
CREATE INDEX idx_properties_featured ON properties (featured);
CREATE INDEX idx_properties_price ON properties (price);
CREATE INDEX idx_properties_province ON properties (province);
CREATE INDEX idx_properties_transaction_type ON properties (transaction_type);
CREATE INDEX idx_properties_created_at ON properties (created_at DESC);

-- properties composite index: active listings sorted by date (common query)
CREATE INDEX idx_properties_active_recent ON properties (status, created_at DESC)
  WHERE status = 'active';

-- properties composite index: featured active listings
CREATE INDEX idx_properties_featured_active ON properties (featured, status)
  WHERE featured = TRUE AND status = 'active';

-- property_images indexes
CREATE INDEX idx_property_images_property_id ON property_images (property_id);
CREATE INDEX idx_property_images_primary ON property_images (property_id, is_primary)
  WHERE is_primary = TRUE;
CREATE INDEX idx_property_images_sort ON property_images (property_id, sort_order);

-- inquiries indexes
CREATE INDEX idx_inquiries_property_id ON inquiries (property_id);
CREATE INDEX idx_inquiries_status ON inquiries (status);
CREATE INDEX idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX idx_inquiries_email ON inquiries (email);

-- homepage_sections indexes
CREATE INDEX idx_homepage_sections_sort ON homepage_sections (sort_order);
CREATE INDEX idx_homepage_sections_active ON homepage_sections (is_active, sort_order);

-- blog_posts indexes
CREATE INDEX idx_blog_posts_slug_en ON blog_posts (slug_en);
CREATE INDEX idx_blog_posts_slug_th ON blog_posts (slug_th);
CREATE INDEX idx_blog_posts_slug_zh ON blog_posts (slug_zh);
CREATE INDEX idx_blog_posts_status ON blog_posts (status);
CREATE INDEX idx_blog_posts_author_id ON blog_posts (author_id);
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX idx_blog_posts_created_at ON blog_posts (created_at DESC);

-- blog_posts composite index: published posts sorted by date
CREATE INDEX idx_blog_posts_published_recent ON blog_posts (status, published_at DESC)
  WHERE status = 'published';

-- blog_contents indexes
CREATE INDEX idx_blog_contents_blog_post_id ON blog_contents (blog_post_id);
CREATE INDEX idx_blog_contents_sort ON blog_contents (blog_post_id, sort_order);

-- property_types indexes
CREATE INDEX idx_property_types_sort ON property_types (sort_order);

-- projects indexes
CREATE INDEX idx_projects_property_type_id ON projects (property_type_id);
CREATE INDEX idx_projects_slug_en ON projects (slug_en);
CREATE INDEX idx_projects_slug_th ON projects (slug_th);
CREATE INDEX idx_projects_slug_zh ON projects (slug_zh);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_province ON projects (province);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX idx_projects_active_recent ON projects (status, created_at DESC)
  WHERE status = 'active';

-- project_images indexes
CREATE INDEX idx_project_images_project_id ON project_images (project_id);
CREATE INDEX idx_project_images_primary ON project_images (project_id, is_primary)
  WHERE is_primary = TRUE;
CREATE INDEX idx_project_images_sort ON project_images (project_id, sort_order);

-- properties.project_id index
CREATE INDEX idx_properties_project_id ON properties (project_id);


-- =============================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all tables. Public (anon) users can read active properties,
-- property types, published blog posts, active homepage sections, and their
-- content. Authenticated (admin) users have full CRUD access.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_contents     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- admin_users: Only authenticated admins can read/write
-- ---------------------------------------------------------------------------
CREATE POLICY "admin_users_select_authenticated"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "admin_users_insert_authenticated"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_users_update_authenticated"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_users_delete_authenticated"
  ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- property_types: Public read, authenticated write
-- ---------------------------------------------------------------------------
CREATE POLICY "property_types_select_public"
  ON property_types FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "property_types_insert_authenticated"
  ON property_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "property_types_update_authenticated"
  ON property_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "property_types_delete_authenticated"
  ON property_types FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- properties: Public can read active listings, authenticated has full access
-- ---------------------------------------------------------------------------
CREATE POLICY "properties_select_public"
  ON properties FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "properties_select_authenticated"
  ON properties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "properties_insert_authenticated"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "properties_update_authenticated"
  ON properties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "properties_delete_authenticated"
  ON properties FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- property_images: Public can read images of active properties, auth full
-- ---------------------------------------------------------------------------
CREATE POLICY "property_images_select_public"
  ON property_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
        AND properties.status = 'active'
    )
  );

CREATE POLICY "property_images_select_authenticated"
  ON property_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "property_images_insert_authenticated"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "property_images_update_authenticated"
  ON property_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "property_images_delete_authenticated"
  ON property_images FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- projects: Public can read active projects, authenticated full CRUD
-- ---------------------------------------------------------------------------
CREATE POLICY "projects_select_public"
  ON projects FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "projects_select_authenticated"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "projects_insert_authenticated"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "projects_update_authenticated"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "projects_delete_authenticated"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- project_images: Public can read images of active projects, auth full CRUD
-- ---------------------------------------------------------------------------
CREATE POLICY "project_images_select_public"
  ON project_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
        AND projects.status = 'active'
    )
  );

CREATE POLICY "project_images_select_authenticated"
  ON project_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "project_images_insert_authenticated"
  ON project_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "project_images_update_authenticated"
  ON project_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "project_images_delete_authenticated"
  ON project_images FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- inquiries: Public can INSERT (submit contact forms), authenticated full
-- ---------------------------------------------------------------------------
CREATE POLICY "inquiries_insert_public"
  ON inquiries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "inquiries_select_authenticated"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "inquiries_insert_authenticated"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "inquiries_update_authenticated"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "inquiries_delete_authenticated"
  ON inquiries FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- homepage_sections: Public can read active sections, authenticated full
-- ---------------------------------------------------------------------------
CREATE POLICY "homepage_sections_select_public"
  ON homepage_sections FOR SELECT
  TO anon
  USING (is_active = TRUE);

CREATE POLICY "homepage_sections_select_authenticated"
  ON homepage_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "homepage_sections_insert_authenticated"
  ON homepage_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "homepage_sections_update_authenticated"
  ON homepage_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "homepage_sections_delete_authenticated"
  ON homepage_sections FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- blog_posts: Public can read published posts, authenticated full access
-- ---------------------------------------------------------------------------
CREATE POLICY "blog_posts_select_public"
  ON blog_posts FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "blog_posts_select_authenticated"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_posts_insert_authenticated"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "blog_posts_update_authenticated"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "blog_posts_delete_authenticated"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- blog_contents: Public can read content of published posts, auth full
-- ---------------------------------------------------------------------------
CREATE POLICY "blog_contents_select_public"
  ON blog_contents FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE blog_posts.id = blog_contents.blog_post_id
        AND blog_posts.status = 'published'
    )
  );

CREATE POLICY "blog_contents_select_authenticated"
  ON blog_contents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "blog_contents_insert_authenticated"
  ON blog_contents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "blog_contents_update_authenticated"
  ON blog_contents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "blog_contents_delete_authenticated"
  ON blog_contents FOR DELETE
  TO authenticated
  USING (true);


-- =============================================================================
-- 12. SEED DATA: property_types
-- =============================================================================
-- All 11 property types with trilingual slugs and names.
-- Sort order matches the display priority (1 = first).
-- =============================================================================

INSERT INTO property_types (slug_en, slug_th, slug_zh, name_en, name_th, name_zh, icon, has_projects, sort_order) VALUES
  ('condo',     'คอนโด',         '公寓',     'Condo',     'คอนโดมิเนียม',  '公寓',     'condo',     TRUE,  1),
  ('townhouse', 'ทาวน์เฮาส์',     '联排别墅',  'Townhouse', 'ทาวน์เฮาส์',    '联排别墅',  'townhouse', TRUE,  2),
  ('house',     'บ้าน',          '房屋',     'House',     'บ้านเดี่ยว',     '房屋',     'house',     FALSE, 3),
  ('land',      'ที่ดิน',         '土地',     'Land',      'ที่ดิน',         '土地',     'land',      FALSE, 4),
  ('villa',     'วิลล่า',        '别墅',     'Villa',     'วิลล่า',        '别墅',     'villa',     FALSE, 5),
  ('apartment', 'อพาร์ทเมนท์',    '公寓楼',    'Apartment', 'อพาร์ทเมนท์',    '公寓楼',    'apartment', TRUE,  6),
  ('office',    'สำนักงาน',       '办公室',    'Office',    'สำนักงาน',       '办公室',    'office',    FALSE, 7),
  ('store',     'ร้านค้า',        '商铺',     'Store',     'ร้านค้า',        '商铺',     'store',     FALSE, 8),
  ('factory',   'โรงงาน',        '工厂',     'Factory',   'โรงงาน',        '工厂',     'factory',   FALSE, 9),
  ('hotel',     'โรงแรม',        '酒店',     'Hotel',     'โรงแรม',        '酒店',     'hotel',     FALSE, 10),
  ('building',  'อาคาร',         '大楼',     'Building',  'อาคาร',         '大楼',     'building',  FALSE, 11);


-- =============================================================================
-- 13. SEED DATA: default admin user
-- =============================================================================
-- Default super-admin account for initial platform setup.
-- Email: admin@thea5995.com
-- Password: Admin@5995! (bcrypt hash below)
-- IMPORTANT: Change this password immediately after first login!
-- =============================================================================

INSERT INTO admin_users (email, password_hash, name, role) VALUES
  (
    'admin@thea5995.com',
    '$2b$12$VEuq1HOnnEALUE0a.Lo7j.SKWzfUT4cyS693hrlEPNzZ3pgtX6GYC',
    'Super Admin',
    'super_admin'
  );


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
-- To apply this schema to your Supabase project:
--   1. Go to Supabase Dashboard > SQL Editor
--   2. Paste this entire file
--   3. Click "Run"
--
-- Or use the Supabase CLI:
--   supabase db reset   (applies migrations + seed)
-- =============================================================================
