-- =============================================================================
-- Migration: Add Projects feature
-- =============================================================================
-- Adds projects table, project_images table, has_projects flag on property_types,
-- and project_id link on properties.
-- =============================================================================

-- 1. Add has_projects column to property_types
ALTER TABLE property_types ADD COLUMN IF NOT EXISTS has_projects BOOLEAN DEFAULT FALSE;
UPDATE property_types SET has_projects = TRUE WHERE slug_en IN ('condo', 'townhouse', 'apartment');

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en            TEXT          NOT NULL,
  name_th            TEXT,
  name_zh            TEXT,
  slug_en            TEXT          UNIQUE NOT NULL,
  slug_th            TEXT          UNIQUE,
  slug_zh            TEXT          UNIQUE,
  description_en     TEXT,
  description_th     TEXT,
  description_zh     TEXT,
  property_type_id   INTEGER       REFERENCES property_types(id),
  developer_name     TEXT,
  facilities         TEXT[],
  year_built         INTEGER,
  total_units        INTEGER,
  address            TEXT,
  district           TEXT,
  province           TEXT,
  latitude           DECIMAL(10,8),
  longitude          DECIMAL(11,8),
  status             TEXT          NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('active', 'completed', 'under_construction', 'draft')),
  seo_title_en       TEXT,
  seo_title_th       TEXT,
  seo_title_zh       TEXT,
  seo_description_en TEXT,
  seo_description_th TEXT,
  seo_description_zh TEXT,
  created_at         TIMESTAMPTZ   DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at'
  ) THEN
    CREATE TRIGGER set_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

-- 3. Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
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

-- 4. Add project_id to properties
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_property_type_id ON projects(property_type_id);
CREATE INDEX IF NOT EXISTS idx_projects_province ON projects(province);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_properties_project_id ON properties(project_id);

-- 6. RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Projects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_read_anon') THEN
    CREATE POLICY "projects_read_anon" ON projects FOR SELECT TO anon USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_read_authenticated') THEN
    CREATE POLICY "projects_read_authenticated" ON projects FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_insert_authenticated') THEN
    CREATE POLICY "projects_insert_authenticated" ON projects FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_update_authenticated') THEN
    CREATE POLICY "projects_update_authenticated" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_delete_authenticated') THEN
    CREATE POLICY "projects_delete_authenticated" ON projects FOR DELETE TO authenticated USING (true);
  END IF;

  -- Project images policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_images_read_anon') THEN
    CREATE POLICY "project_images_read_anon" ON project_images FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_images_read_authenticated') THEN
    CREATE POLICY "project_images_read_authenticated" ON project_images FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_images_insert_authenticated') THEN
    CREATE POLICY "project_images_insert_authenticated" ON project_images FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_images_update_authenticated') THEN
    CREATE POLICY "project_images_update_authenticated" ON project_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_images_delete_authenticated') THEN
    CREATE POLICY "project_images_delete_authenticated" ON project_images FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
